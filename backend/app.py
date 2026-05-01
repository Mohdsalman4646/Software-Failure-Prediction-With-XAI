from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from model import predict_risk, explain_prediction, get_solutions
import traceback
import os
import math
import psutil
import time
import sqlite3
from collections import deque

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_BUILD_DIR = os.path.abspath(os.path.join(BASE_DIR, '..', 'frontend', 'dist'))
AUDIT_DB_PATH = os.path.join(BASE_DIR, 'prediction_audit.db')
DEFAULT_HOST = os.getenv('FLASK_HOST', '127.0.0.1')
DEFAULT_PORT = int(os.getenv('PORT', os.getenv('FLASK_PORT', '5000')))
DEBUG_MODE = os.getenv('FLASK_DEBUG', '').lower() in {'1', 'true', 'yes', 'on'} or os.getenv('FLASK_ENV', '').lower() == 'development'
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173').split(',')
    if origin.strip()
]
MONITOR_WINDOW_SIZE = int(os.getenv('MONITOR_WINDOW_SIZE', '8'))
_monitor_error_history = deque(maxlen=max(3, MONITOR_WINDOW_SIZE))
_monitor_latency_history = deque(maxlen=max(3, MONITOR_WINDOW_SIZE))

# Setup Flask app with static folder for frontend
app = Flask(__name__, static_folder=FRONTEND_BUILD_DIR, static_url_path='')
CORS(app, resources={r'/api/*': {'origins': ALLOWED_ORIGINS}})


def init_audit_db():
    with sqlite3.connect(AUDIT_DB_PATH) as connection:
        cursor = connection.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS prediction_audit (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at REAL NOT NULL,
                request_source TEXT,
                user_agent TEXT,
                cpu_usage REAL NOT NULL,
                memory_usage REAL NOT NULL,
                disk_usage REAL NOT NULL,
                network_latency REAL NOT NULL,
                error_rate REAL NOT NULL,
                risk_level TEXT NOT NULL,
                confidence_score REAL NOT NULL,
                latency_ms REAL NOT NULL
            )
        ''')

        cursor.execute('PRAGMA table_info(prediction_audit)')
        existing_columns = {row[1] for row in cursor.fetchall()}

        # Migrate existing databases from the old schema without dropping history.
        if 'disk_usage' not in existing_columns:
            cursor.execute('ALTER TABLE prediction_audit ADD COLUMN disk_usage REAL NOT NULL DEFAULT 0')
        if 'network_latency' not in existing_columns:
            cursor.execute('ALTER TABLE prediction_audit ADD COLUMN network_latency REAL NOT NULL DEFAULT 0')
        if 'error_rate' not in existing_columns:
            cursor.execute('ALTER TABLE prediction_audit ADD COLUMN error_rate REAL NOT NULL DEFAULT 0')
        if 'risk_level' not in existing_columns:
            cursor.execute("ALTER TABLE prediction_audit ADD COLUMN risk_level TEXT NOT NULL DEFAULT 'Medium'")
        if 'confidence_score' not in existing_columns:
            cursor.execute('ALTER TABLE prediction_audit ADD COLUMN confidence_score REAL NOT NULL DEFAULT 50')

        # Backfill migrated rows using old values when those columns exist.
        if 'response_time' in existing_columns:
            cursor.execute(
                '''
                UPDATE prediction_audit
                SET network_latency = CASE
                    WHEN network_latency = 0 THEN response_time
                    ELSE network_latency
                END
                '''
            )
        if 'error_count' in existing_columns:
            cursor.execute(
                '''
                UPDATE prediction_audit
                SET error_rate = CASE
                    WHEN error_rate = 0 THEN error_count
                    ELSE error_rate
                END
                '''
            )

        connection.commit()


def log_prediction_event(cpu_usage, memory_usage, disk_usage, network_latency, error_rate, risk_level, confidence_score, latency_ms):
    request_source = request.headers.get('X-Forwarded-For', request.remote_addr or 'unknown')
    user_agent = request.headers.get('User-Agent', 'unknown')

    with sqlite3.connect(AUDIT_DB_PATH) as connection:
        cursor = connection.cursor()
        cursor.execute('PRAGMA table_info(prediction_audit)')
        existing_columns = {row[1] for row in cursor.fetchall()}

        legacy_prediction = 'safe' if risk_level == 'Low' else 'failure'
        record = {
            'created_at': time.time(),
            'request_source': request_source,
            'user_agent': user_agent,
            'cpu_usage': cpu_usage,
            'memory_usage': memory_usage,
            'disk_usage': disk_usage,
            'network_latency': network_latency,
            'error_rate': error_rate,
            'risk_level': risk_level,
            'confidence_score': confidence_score,
            'latency_ms': latency_ms,
            # Legacy compatibility fields for migrated DBs.
            'error_count': error_rate,
            'response_time': network_latency,
            'prediction': legacy_prediction,
            'probability': max(0.0, min(1.0, confidence_score / 100.0)),
        }

        insert_columns = [column for column in record if column in existing_columns]
        placeholders = ', '.join(['?'] * len(insert_columns))
        columns_sql = ', '.join(insert_columns)
        values = [record[column] for column in insert_columns]

        cursor.execute(
            f'INSERT INTO prediction_audit ({columns_sql}) VALUES ({placeholders})',
            values,
        )
        connection.commit()

# Train model on startup if not exists
init_audit_db()


EXPECTED_INPUTS = {
    'cpu_usage': {'min': 0, 'max': 100, 'label': 'CPU usage (%)'},
    'memory_usage': {'min': 0, 'max': 100, 'label': 'Memory usage (%)'},
    'disk_usage': {'min': 0, 'max': 100, 'label': 'Disk usage (%)'},
    'network_latency': {'min': 0, 'max': 10000, 'label': 'Network latency (ms)'},
    'error_rate': {'min': 0, 'max': 100, 'label': 'Error rate (%)'},
}


def error_response(message, code, status_code=400, field=None, details=None):
    payload = {
        'error': message,
        'code': code,
    }

    if field is not None:
        payload['field'] = field

    if details is not None:
        payload['details'] = details

    return jsonify(payload), status_code


def parse_numeric_field(data, field_name):
    config = EXPECTED_INPUTS[field_name]

    if field_name not in data:
        return None, error_response(
            f'Missing required field: {field_name}',
            'MISSING_FIELD',
            field=field_name,
            details={'expected': config['label']}
        )

    raw_value = data[field_name]

    if raw_value is None or isinstance(raw_value, bool):
        return None, error_response(
            f'{config["label"]} must be a number.',
            'INVALID_TYPE',
            field=field_name,
            details={'received': raw_value}
        )

    try:
        value = float(raw_value)
    except (TypeError, ValueError):
        return None, error_response(
            f'{config["label"]} must be a number.',
            'INVALID_TYPE',
            field=field_name,
            details={'received': raw_value}
        )

    if not math.isfinite(value):
        return None, error_response(
            f'{config["label"]} must be a finite number.',
            'NON_FINITE_VALUE',
            field=field_name,
            details={'received': raw_value}
        )

    if not (config['min'] <= value <= config['max']):
        return None, error_response(
            f'{config["label"]} must be between {config["min"]} and {config["max"]}.',
            'OUT_OF_RANGE',
            field=field_name,
            details={
                'min': config['min'],
                'max': config['max'],
                'received': value,
            }
        )

    return value, None


def _clamp(value, minimum, maximum):
    return max(minimum, min(maximum, value))


def _calculate_error_score(cpu_usage, memory_usage, swap_usage, disk_usage):
    # Weighted pressure score based on measurable host telemetry.
    cpu_component = _clamp((cpu_usage - 60) * 1.25, 0, 50)
    memory_component = _clamp((memory_usage - 65) * 1.2, 0, 30)
    swap_component = _clamp((swap_usage - 20) * 0.6, 0, 10)
    disk_component = _clamp((disk_usage - 80) * 0.5, 0, 10)
    instant_score = cpu_component + memory_component + swap_component + disk_component

    _monitor_error_history.append(instant_score)
    smoothed_score = sum(_monitor_error_history) / len(_monitor_error_history)

    return _clamp(smoothed_score, 0, 100)


def _calculate_response_time(cpu_usage, memory_usage, collector_latency_ms):
    # Estimated response-time pressure metric using measured sampling latency and host load.
    estimated = collector_latency_ms + (cpu_usage * 2.0) + (memory_usage * 1.5)
    _monitor_latency_history.append(estimated)
    smoothed = sum(_monitor_latency_history) / len(_monitor_latency_history)

    return _clamp(smoothed, 0, 5000)


def _format_bytes(num_bytes):
    units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
    size = float(max(0, num_bytes))
    for unit in units:
        if size < 1024 or unit == units[-1]:
            return f'{size:.2f} {unit}'
        size /= 1024.0


def _preferred_mount_candidates():
    if os.name == 'nt':
        candidates = ['C:\\']
        system_drive = os.environ.get('SystemDrive')
        if system_drive:
            candidates.append(f'{system_drive}\\')
        return candidates

    return ['/']


def _get_disk_usage_snapshot():
    candidates = []
    candidates.extend(_preferred_mount_candidates())

    base_drive = os.path.splitdrive(BASE_DIR)[0]
    if os.name == 'nt' and base_drive:
        candidates.append(f'{base_drive}\\')
    elif os.name != 'nt':
        candidates.append('/')

    try:
        for partition in psutil.disk_partitions(all=False):
            mountpoint = partition.mountpoint
            if not mountpoint:
                continue
            if os.name == 'nt' and 'cdrom' in partition.opts.lower():
                continue
            candidates.append(mountpoint)
    except Exception:
        # If partition listing fails, direct mount checks below still run.
        pass

    seen = set()
    ordered_candidates = []
    for mountpoint in candidates:
        if mountpoint in seen:
            continue
        seen.add(mountpoint)
        ordered_candidates.append(mountpoint)

    last_error = None
    for mountpoint in ordered_candidates:
        try:
            usage = psutil.disk_usage(mountpoint)
            total = int(usage.total)
            used = int(usage.used)
            free = int(usage.free)
            if total <= 0:
                continue

            percent_computed = (used / total) * 100.0
            if not math.isfinite(percent_computed):
                continue

            percent_from_psutil = float(usage.percent)
            percent = percent_computed
            if math.isfinite(percent_from_psutil) and abs(percent_from_psutil - percent_computed) <= 1.0:
                percent = percent_from_psutil

            return {
                'disk_usage_percent': _clamp(percent, 0, 100),
                'total_space_bytes': total,
                'used_space_bytes': used,
                'free_space_bytes': free,
                'total_space': _format_bytes(total),
                'used_space': _format_bytes(used),
                'free_space': _format_bytes(free),
                'source': mountpoint,
                'validation': {
                    'calculation': 'used / total * 100',
                    'computed_percent': round(percent_computed, 3),
                    'psutil_percent': round(percent_from_psutil, 3),
                },
            }
        except Exception as exc:
            last_error = exc

    raise RuntimeError(
        f'Unable to read disk usage from preferred/system partitions. Last error: {last_error}'
    )

@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Endpoint to make risk predictions
    Expected JSON:
    {
        "cpu_usage": float (0-100),
        "memory_usage": float (0-100),
        "disk_usage": float (0-100),
        "network_latency": float (0-10000),
        "error_rate": float (0-100)
    }
    """
    start_time = time.perf_counter()

    try:
        data = request.get_json(silent=True)

        if not isinstance(data, dict):
            return error_response(
                'Request body must be valid JSON.',
                'INVALID_JSON',
                details={'expected': list(EXPECTED_INPUTS.keys())}
            )

        cpu_usage, error = parse_numeric_field(data, 'cpu_usage')
        if error:
            return error

        memory_usage, error = parse_numeric_field(data, 'memory_usage')
        if error:
            return error

        disk_usage, error = parse_numeric_field(data, 'disk_usage')
        if error:
            return error

        network_latency, error = parse_numeric_field(data, 'network_latency')
        if error:
            return error

        error_rate, error = parse_numeric_field(data, 'error_rate')
        if error:
            return error
        
        # Make prediction
        assessment = predict_risk(cpu_usage, memory_usage, disk_usage, network_latency, error_rate)
        explanation = explain_prediction(cpu_usage, memory_usage, disk_usage, network_latency, error_rate)
        solutions = get_solutions(cpu_usage, memory_usage, disk_usage, network_latency, error_rate)
        
        latency_ms = (time.perf_counter() - start_time) * 1000

        log_prediction_event(
            cpu_usage=cpu_usage,
            memory_usage=memory_usage,
            disk_usage=disk_usage,
            network_latency=network_latency,
            error_rate=error_rate,
            risk_level=assessment['risk_level'],
            confidence_score=assessment['confidence_score'],
            latency_ms=latency_ms
        )
        
        result = {
            'risk_level': assessment['risk_level'],
            'confidence_score': assessment['confidence_score'],
            'explanation': explanation,
            'solutions': solutions,
            'latency_ms': round(latency_ms, 3),
            'features': {
                'cpu_usage': cpu_usage,
                'memory_usage': memory_usage,
                'disk_usage': disk_usage,
                'network_latency': network_latency,
                'error_rate': error_rate
            },
            'metrics_analysis': {
                'critical_metrics': assessment['critical_metrics'],
                'warning_metrics': assessment['warning_metrics'],
                'metric_contributions': assessment['metric_contributions']
            }
        }
        
        return jsonify(result), 200
    
    except Exception as e:
        print(f"Error in prediction endpoint: {str(e)}")
        print(traceback.format_exc())
        return error_response(
            'Internal server error while processing prediction request.',
            'INTERNAL_SERVER_ERROR',
            status_code=500,
            details={'exception': str(e)}
        )


@app.route('/api/prediction-history', methods=['GET'])
def prediction_history():
    """Get recent prediction audit events"""
    try:
        limit = request.args.get('limit', default=25, type=int)
        limit = max(1, min(limit, 200))

        with sqlite3.connect(AUDIT_DB_PATH) as connection:
            connection.row_factory = sqlite3.Row
            cursor = connection.cursor()
            cursor.execute(
                '''
                SELECT
                    id,
                    created_at,
                    request_source,
                    user_agent,
                    cpu_usage,
                    memory_usage,
                    disk_usage,
                    network_latency,
                    error_rate,
                    risk_level,
                    confidence_score,
                    latency_ms
                FROM prediction_audit
                ORDER BY id DESC
                LIMIT ?
                ''',
                (limit,)
            )
            rows = cursor.fetchall()

        return jsonify({
            'count': len(rows),
            'items': [dict(row) for row in rows]
        }), 200
    except Exception as e:
        print(f"Error in prediction history endpoint: {str(e)}")
        print(traceback.format_exc())
        return error_response(
            'Internal server error while fetching prediction history.',
            'INTERNAL_SERVER_ERROR',
            status_code=500,
            details={'exception': str(e)}
        )

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'API is running'}), 200

@app.route('/api/info', methods=['GET'])
def info():
    """Get API information"""
    return jsonify({
        'name': 'Software Failure Prediction API',
        'version': '1.0.0',
        'description': 'ML-based system failure prediction with XAI explanations',
        'features': ['Failure prediction', 'XAI explanations', 'Real-time telemetry monitoring'],
        'endpoints': {
            '/api/predict': 'POST - Make prediction',
            '/api/health': 'GET - Health check',
            '/api/info': 'GET - API information',
            '/api/monitor': 'GET - Get live system data',
            '/api/prediction-history': 'GET - Get recent prediction audit logs'
        }
    }), 200

@app.route('/api/monitor', methods=['GET'])
def monitor():
    """Get live system monitoring data with 5-metric risk assessment.

    Returns:
        CPU, Memory, Disk usage (all measured via psutil)
        Network Latency (collection timing-based approximation)
        Error Rate (derived from system pressure metrics)
    """
    try:
        start_time = time.perf_counter()
        cpu = psutil.cpu_percent(interval=0.15)
        virtual_memory = psutil.virtual_memory()
        memory = virtual_memory.percent
        disk_snapshot = _get_disk_usage_snapshot()
        disk = float(disk_snapshot['disk_usage_percent'])
        collector_latency_ms = (time.perf_counter() - start_time) * 1000
        
        # Network latency approximation: use collector_latency_ms as baseline,
        # add pressure based on system load
        system_pressure = (cpu + memory + disk) / 3
        network_latency = collector_latency_ms + (system_pressure * 0.5)
        
        # Error rate: derived metric based on system health indicators
        swap = psutil.swap_memory().percent
        pressure_score = _calculate_error_score(cpu, memory, swap, disk)
        error_rate = _clamp(pressure_score / 2, 0, 100)  # Scale to 0-100% range

        data = {
            'cpu_usage': round(cpu, 2),
            'memory_usage': round(memory, 2),
            'disk_usage': round(disk, 2),
            'disk_total_space': disk_snapshot['total_space'],
            'disk_used_space': disk_snapshot['used_space'],
            'disk_free_space': disk_snapshot['free_space'],
            'disk_source': disk_snapshot['source'],
            'network_latency': round(network_latency, 2),
            'error_rate': round(error_rate, 2),
            'timestamp': time.time(),
            'monitor_metadata': {
                'source': {
                    'cpu_usage': 'psutil.cpu_percent(interval=0.15)',
                    'memory_usage': 'psutil.virtual_memory().percent',
                    'disk_usage': 'psutil.disk_usage(system_mount).percent',
                    'network_latency': 'derived_from_collection_latency_and_system_load',
                    'error_rate': 'derived_weighted_pressure_score'
                },
                'supporting_metrics': {
                    'swap_usage': round(swap, 2),
                    'collector_latency_ms': round(collector_latency_ms, 3),
                    'system_pressure_avg': round(system_pressure, 2),
                    'disk_validation': disk_snapshot['validation'],
                    'disk_total_space_bytes': disk_snapshot['total_space_bytes'],
                    'disk_used_space_bytes': disk_snapshot['used_space_bytes'],
                    'disk_free_space_bytes': disk_snapshot['free_space_bytes']
                },
                'window_size': max(3, MONITOR_WINDOW_SIZE)
            }
        }
        
        return jsonify(data), 200
    
    except Exception as e:
        print(f"Error in monitoring endpoint: {str(e)}")
        return error_response(
            'Internal server error while collecting monitoring data.',
            'INTERNAL_SERVER_ERROR',
            status_code=500,
            details={'exception': str(e)}
        )


@app.errorhandler(404)
def not_found(error):
    # Check if it's a request for static files
    if request.path.startswith('/api/'):
        return jsonify({'error': 'Endpoint not found'}), 404
    
    # Serve index.html for all other routes (SPA routing)
    index_path = os.path.join(FRONTEND_BUILD_DIR, 'index.html')
    if os.path.exists(index_path):
        return send_from_directory(FRONTEND_BUILD_DIR, 'index.html'), 200
    
    return jsonify({'error': 'Frontend not built. Please run npm run build in frontend directory'}), 404

@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({'error': 'Method not allowed'}), 405

# Serve index.html for root path
@app.route('/')
def serve_index():
    return send_from_directory(FRONTEND_BUILD_DIR, 'index.html')

if __name__ == '__main__':
    print("Starting Software Failure Prediction API...")
    print(f"Server running on http://{DEFAULT_HOST}:{DEFAULT_PORT}")
    print("API documentation available at http://localhost:5000/api/info")
    app.run(debug=DEBUG_MODE, port=DEFAULT_PORT, host=DEFAULT_HOST)