from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from model import MODEL_PATH, predict_failure, explain_prediction, get_solutions, train_model
import traceback
import os
import math
import psutil
import time

# Setup Flask app with static folder for frontend
FRONTEND_BUILD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'frontend', 'dist')
app = Flask(__name__, static_folder=FRONTEND_BUILD_DIR, static_url_path='')
CORS(app)

# Train model on startup if not exists
if not os.path.exists(MODEL_PATH):
    print("Training model...")
    model, accuracy = train_model()
    print(f"Model trained with {accuracy * 100:.2f}% accuracy")
else:
    print("Model already exists, skipping training")


EXPECTED_INPUTS = {
    'cpu_usage': {'min': 0, 'max': 100, 'label': 'CPU usage'},
    'memory_usage': {'min': 0, 'max': 100, 'label': 'Memory usage'},
    'error_count': {'min': 0, 'max': 100, 'label': 'Error count'},
    'response_time': {'min': 0, 'max': 5000, 'label': 'Response time'},
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

@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Endpoint to make predictions
    Expected JSON:
    {
        "cpu_usage": float (0-100),
        "memory_usage": float (0-100),
        "error_count": int (0-100),
        "response_time": float (0-5000)
    }
    """
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

        error_count, error = parse_numeric_field(data, 'error_count')
        if error:
            return error

        response_time, error = parse_numeric_field(data, 'response_time')
        if error:
            return error
        
        # Make prediction
        prediction, probability = predict_failure(cpu_usage, memory_usage, error_count, response_time)
        explanation = explain_prediction(cpu_usage, memory_usage, error_count, response_time)
        solutions = get_solutions(cpu_usage, memory_usage, error_count, response_time)
        
        result = {
            'prediction': 'failure' if prediction == 1 else 'safe',
            'probability': float(probability),
            'explanation': explanation,
            'solutions': solutions,
            'features': {
                'cpu_usage': cpu_usage,
                'memory_usage': memory_usage,
                'error_count': error_count,
                'response_time': response_time
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
        'features': ['Failure prediction', 'XAI explanations', 'Real-time monitoring'],
        'endpoints': {
            '/api/predict': 'POST - Make prediction',
            '/api/health': 'GET - Health check',
            '/api/info': 'GET - API information',
            '/api/monitor': 'GET - Get live system data'
        }
    }), 200

@app.route('/api/monitor', methods=['GET'])
def monitor():
    """Get live system monitoring data"""
    try:
        cpu = psutil.cpu_percent(interval=0.1)
        memory = psutil.virtual_memory().percent
        
        # Create additional features based on system state
        errors = 1 if cpu > 80 else 0
        response_time = cpu * 0.5  # Simplified response time calculation
        
        data = {
            'cpu_usage': cpu,
            'memory_usage': memory,
            'error_count': errors,
            'response_time': response_time,
            'timestamp': time.time()
        }
        
        return jsonify(data), 200
    
    except Exception as e:
        print(f"Error in monitoring endpoint: {str(e)}")
        return jsonify({'error': f'Failed to get system data: {str(e)}'}), 500

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
    print("Server running on http://localhost:5000")
    print("API documentation available at http://localhost:5000/api/info")
    app.run(debug=True, port=5000, host='0.0.0.0')