import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ================================
# RISK PREDICTION - RULE-BASED MODEL
# ================================
# 5-Metric System Failure Risk Predictor
# Metrics: CPU (%), Memory (%), Disk (%), Network Latency (ms), Error Rate (%)
# Output: Risk Level (Low/Medium/High) with Confidence Score (0-100%)

# Safe Thresholds (below these = normal operation)
CPU_SAFE_THRESHOLD = 70
MEMORY_SAFE_THRESHOLD = 70
DISK_SAFE_THRESHOLD = 80
NETWORK_LATENCY_SAFE_THRESHOLD = 100  # ms
ERROR_RATE_SAFE_THRESHOLD = 5  # %

# Warning Thresholds (exceed safe = caution)
CPU_WARNING_THRESHOLD = 85
MEMORY_WARNING_THRESHOLD = 85
DISK_WARNING_THRESHOLD = 90
NETWORK_LATENCY_WARNING_THRESHOLD = 200  # ms
ERROR_RATE_WARNING_THRESHOLD = 15  # %

# Critical Thresholds (exceed warning = critical)
CPU_CRITICAL_THRESHOLD = 95
MEMORY_CRITICAL_THRESHOLD = 95
DISK_CRITICAL_THRESHOLD = 95
NETWORK_LATENCY_CRITICAL_THRESHOLD = 500  # ms
ERROR_RATE_CRITICAL_THRESHOLD = 30  # %

FEATURE_COLUMNS = ["cpu", "memory", "disk", "network_latency", "error_rate"]
FEATURE_REASON_MAP = {
    "cpu": "CPU usage is high",
    "memory": "Memory usage is high",
    "disk": "Disk usage is high",
    "network_latency": "Network latency is elevated",
    "error_rate": "Error rate is elevated",
}


# ================================
# RISK LEVEL DETERMINATION
# ================================
def _get_metric_severity(metric_value, safe_threshold, warning_threshold, critical_threshold):
    """Determine severity level (0-3) for a metric.
    
    Returns:
        tuple: (severity_level: 0=safe, 1=warning, 2=critical, contribution: 0-100%)
    """
    if metric_value < safe_threshold:
        # Safe: contribution = normalized position within safe range
        contribution = (metric_value / safe_threshold) * 20  # 0-20%
        return 0, contribution
    elif metric_value < warning_threshold:
        # Warning: contribution = 30-60%
        range_width = warning_threshold - safe_threshold
        normalized = (metric_value - safe_threshold) / range_width
        contribution = 30 + (normalized * 30)  # 30-60%
        return 1, contribution
    elif metric_value < critical_threshold:
        # Critical: contribution = 60-90%
        range_width = critical_threshold - warning_threshold
        normalized = (metric_value - warning_threshold) / range_width
        contribution = 60 + (normalized * 30)  # 60-90%
        return 2, contribution
    else:
        # Beyond critical: contribution = 90-100%
        contribution = 95
        return 2, contribution


def _assess_risk_level(cpu, memory, disk, network_latency, error_rate):
    """Assess overall system risk based on 5 metrics.
    
    Returns:
        dict: {
            'risk_level': 'Low'|'Medium'|'High',
            'confidence_score': 0-100,
            'critical_metrics': [list of critical metrics],
            'warning_metrics': [list of warning metrics],
            'metric_severities': {metric: severity, ...},
            'metric_contributions': {metric: contribution_percent, ...}
        }
    """
    severities = {}
    contributions = {}
    
    # Assess each metric
    cpu_sev, cpu_contrib = _get_metric_severity(cpu, CPU_SAFE_THRESHOLD, CPU_WARNING_THRESHOLD, CPU_CRITICAL_THRESHOLD)
    severities['cpu'] = cpu_sev
    contributions['cpu'] = cpu_contrib
    
    mem_sev, mem_contrib = _get_metric_severity(memory, MEMORY_SAFE_THRESHOLD, MEMORY_WARNING_THRESHOLD, MEMORY_CRITICAL_THRESHOLD)
    severities['memory'] = mem_sev
    contributions['memory'] = mem_contrib
    
    disk_sev, disk_contrib = _get_metric_severity(disk, DISK_SAFE_THRESHOLD, DISK_WARNING_THRESHOLD, DISK_CRITICAL_THRESHOLD)
    severities['disk'] = disk_sev
    contributions['disk'] = disk_contrib
    
    latency_sev, latency_contrib = _get_metric_severity(network_latency, NETWORK_LATENCY_SAFE_THRESHOLD, NETWORK_LATENCY_WARNING_THRESHOLD, NETWORK_LATENCY_CRITICAL_THRESHOLD)
    severities['network_latency'] = latency_sev
    contributions['network_latency'] = latency_contrib
    
    error_sev, error_contrib = _get_metric_severity(error_rate, ERROR_RATE_SAFE_THRESHOLD, ERROR_RATE_WARNING_THRESHOLD, ERROR_RATE_CRITICAL_THRESHOLD)
    severities['error_rate'] = error_sev
    contributions['error_rate'] = error_contrib
    
    # Count metrics at each severity level
    critical_count = sum(1 for sev in severities.values() if sev == 2)
    warning_count = sum(1 for sev in severities.values() if sev == 1)
    
    # Extract metric names by severity
    critical_metrics = [name for name, sev in severities.items() if sev == 2]
    warning_metrics = [name for name, sev in severities.items() if sev == 1]
    
    # Determine risk level based on rule set
    if critical_count >= 2 or critical_count == 1 and warning_count >= 2:
        risk_level = 'High'
    elif critical_count == 1 or warning_count >= 2:
        risk_level = 'Medium'
    else:
        risk_level = 'Low'
    
    # Calculate confidence score (0-100)
    # Confidence is higher when metrics are further from safe thresholds (more clear signal)
    avg_contribution = sum(contributions.values()) / len(contributions)
    
    if risk_level == 'High':
        # High confidence for High risk if critical metrics present
        confidence_score = min(100, avg_contribution + (critical_count * 15))
    elif risk_level == 'Medium':
        # Medium confidence based on warning metrics
        confidence_score = min(100, avg_contribution + (warning_count * 10))
    else:
        # High confidence for Low risk if most metrics are safe
        safe_count = sum(1 for sev in severities.values() if sev == 0)
        confidence_score = min(100, 70 + (safe_count * 6))
    
    return {
        'risk_level': risk_level,
        'confidence_score': round(confidence_score, 1),
        'critical_metrics': critical_metrics,
        'warning_metrics': warning_metrics,
        'metric_severities': severities,
        'metric_contributions': {k: round(v, 1) for k, v in contributions.items()}
    }


# ================================
# PREDICTION API
# ================================
def predict_risk(cpu, memory, disk, network_latency, error_rate):
    """Predict system failure risk based on 5 metrics.
    
    Args:
        cpu (float): CPU usage percentage (0-100)
        memory (float): Memory usage percentage (0-100)
        disk (float): Disk usage percentage (0-100)
        network_latency (float): Network latency in milliseconds
        error_rate (float): Error rate percentage (0-100)
    
    Returns:
        dict: Risk assessment with risk_level, confidence_score, and details
    """
    assessment = _assess_risk_level(cpu, memory, disk, network_latency, error_rate)
    return assessment


def explain_prediction(cpu, memory, disk, network_latency, error_rate):
    """Generate human-readable explanation for the prediction.
    
    Returns:
        str: Explanation text
    """
    assessment = _assess_risk_level(cpu, memory, disk, network_latency, error_rate)
    risk_level = assessment['risk_level']
    critical = assessment['critical_metrics']
    warning = assessment['warning_metrics']
    
    if risk_level == 'High':
        if critical:
            critical_reasons = ', '.join([FEATURE_REASON_MAP[m] for m in critical[:2]])
            return f"System is at HIGH RISK due to: {critical_reasons}. Immediate action recommended."
        else:
            return "System is at HIGH RISK due to multiple elevated metrics. Action recommended."
    elif risk_level == 'Medium':
        if warning or critical:
            problem_reasons = ', '.join([FEATURE_REASON_MAP[m] for m in (critical + warning)[:2]])
            return f"System is at MEDIUM RISK: {problem_reasons}. Monitor closely."
        else:
            return "System is at MEDIUM RISK. Consider reviewing system metrics."
    else:
        return "System is operating normally - all metrics are within safe thresholds."


def get_solutions(cpu, memory, disk, network_latency, error_rate):
    """Provide actionable solutions based on risk drivers.
    
    Returns:
        list: Solution objects with issue, problem, and solutions
    """
    assessment = _assess_risk_level(cpu, memory, disk, network_latency, error_rate)
    solutions = []
    driver_metrics = set(assessment['critical_metrics'] + assessment['warning_metrics'])
    
    if 'cpu' in driver_metrics:
        solutions.append({
            "issue": "High CPU Usage",
            "problem": "Processor is working at high capacity",
            "solutions": [
                "Close unnecessary applications and browser tabs",
                "Check Task Manager for high-CPU processes",
                "Disable startup programs you don't need",
                "Run antivirus scan to check for malware",
                "Consider upgrading hardware if this is persistent"
            ]
        })
    
    if 'memory' in driver_metrics:
        solutions.append({
            "issue": "High Memory Usage",
            "problem": "RAM is nearly full or under high pressure",
            "solutions": [
                "Close unused programs and applications",
                "Clear browser cache and temporary files",
                "Uninstall software you no longer use",
                "Restart your computer to clear memory",
                "Monitor for memory leaks in background processes",
                "Upgrade RAM if this occurs frequently"
            ]
        })
    
    if 'disk' in driver_metrics:
        solutions.append({
            "issue": "High Disk Usage",
            "problem": "Storage space is running critically low",
            "solutions": [
                "Delete temporary files and recycle bin items",
                "Uninstall unused applications",
                "Move large files to external storage",
                "Clear Windows temporary folder (%temp%)",
                "Run Disk Cleanup utility",
                "Install an additional disk or upgrade storage"
            ]
        })
    
    if 'network_latency' in driver_metrics:
        solutions.append({
            "issue": "High Network Latency",
            "problem": "Network response time is elevated",
            "solutions": [
                "Check internet connection stability",
                "Restart your network router",
                "Reduce network congestion (fewer devices/applications)",
                "Move closer to Wi-Fi router or use wired connection",
                "Check for background downloads or uploads",
                "Contact ISP if latency persists"
            ]
        })
    
    if 'error_rate' in driver_metrics:
        solutions.append({
            "issue": "High Error Rate",
            "problem": "System is experiencing frequent errors",
            "solutions": [
                "Run full system antivirus scan",
                "Install latest OS and driver updates",
                "Run System File Checker (sfc /scannow)",
                "Check Event Viewer for error patterns",
                "Run Windows Memory Diagnostic tool",
                "Perform system restore if errors started recently"
            ]
        })
    
    return solutions


# ================================
# TEST/DEMO
# ================================
if __name__ == "__main__":
    # Example test values
    cpu = 85
    memory = 75
    disk = 92
    network_latency = 150
    error_rate = 8
    
    # Make prediction
    assessment = predict_risk(cpu, memory, disk, network_latency, error_rate)
    
    print("="*60)
    print("SYSTEM FAILURE PREDICTION MODEL - DEMO")
    print("="*60)
    print(f"\nInput Metrics:")
    print(f"  CPU Usage:           {cpu}%")
    print(f"  Memory Usage:        {memory}%")
    print(f"  Disk Usage:          {disk}%")
    print(f"  Network Latency:     {network_latency}ms")
    print(f"  Error Rate:          {error_rate}%")
    
    print(f"\nPrediction:")
    print(f"  Risk Level:          {assessment['risk_level']}")
    print(f"  Confidence Score:    {assessment['confidence_score']}%")
    print(f"  Critical Metrics:    {assessment['critical_metrics']}")
    print(f"  Warning Metrics:     {assessment['warning_metrics']}")
    
    explanation = explain_prediction(cpu, memory, disk, network_latency, error_rate)
    print(f"\nExplanation:")
    print(f"  {explanation}")
    
    solutions = get_solutions(cpu, memory, disk, network_latency, error_rate)
    print(f"\nRecommended Actions ({len(solutions)} issue{'s' if len(solutions) != 1 else ''}):")
    for i, sol in enumerate(solutions, 1):
        print(f"  {i}. {sol['issue']}")
        for step in sol['solutions'][:3]:
            print(f"     - {step}")
        if len(sol['solutions']) > 3:
            print(f"     ... and {len(sol['solutions']) - 3} more steps")
    
    print("\n" + "="*60)

