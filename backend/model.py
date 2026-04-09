import os
import pandas as pd
import numpy as np
import joblib
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data.csv")
MODEL_PATH = os.path.join(BASE_DIR, "trained_model_percent.pkl")
MODEL_VERSION = 1
CPU_SCALE_FEATURE = "cpu"
ERROR_SCALE_FEATURE = "errors"
CPU_ALERT_THRESHOLD = 75
MEMORY_ALERT_THRESHOLD = 50
ERROR_ALERT_THRESHOLD = 75
RESPONSE_TIME_ALERT_THRESHOLD = 310


def _scale_to_percent(values, minimum, maximum):
    if maximum <= minimum:
        return np.zeros(len(values), dtype=float)

    return ((values - minimum) / (maximum - minimum)) * 100.0


def _prepare_training_frame(data):
    training_frame = data.copy()
    cpu_min = float(training_frame[CPU_SCALE_FEATURE].min())
    cpu_max = float(training_frame[CPU_SCALE_FEATURE].max())
    error_min = float(training_frame[ERROR_SCALE_FEATURE].min())
    error_max = float(training_frame[ERROR_SCALE_FEATURE].max())

    training_frame[CPU_SCALE_FEATURE] = _scale_to_percent(
        training_frame[CPU_SCALE_FEATURE].to_numpy(dtype=float), cpu_min, cpu_max
    )
    training_frame[ERROR_SCALE_FEATURE] = _scale_to_percent(
        training_frame[ERROR_SCALE_FEATURE].to_numpy(dtype=float), error_min, error_max
    )

    return training_frame


def _load_artifacts():
    artifacts = joblib.load(MODEL_PATH)

    if isinstance(artifacts, dict):
        return artifacts

    raise ValueError("Unsupported model artifact format. Retrain the model.")


# ----------------------------
# TRAIN MODEL
# ----------------------------
def train_model():

    # Load dataset
    data = pd.read_csv(DATA_PATH)

    training_frame = _prepare_training_frame(data)

    # Features and label
    X = training_frame[["cpu", "memory", "errors", "response_time"]]
    y = training_frame["failure"]

    # Split dataset
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Train model
    model = XGBClassifier(eval_metric='logloss', n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # Evaluate accuracy on the test split
    predictions = model.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)

    # Save model
    joblib.dump({
        "version": MODEL_VERSION,
        "model": model,
    }, MODEL_PATH)

    print("Model trained and saved successfully")
    print(f"Model accuracy: {accuracy * 100:.2f}%")

    return model, accuracy


# ----------------------------
# LOAD MODEL
# ----------------------------
def load_model():
    artifacts = _load_artifacts()
    return artifacts["model"], artifacts


# ----------------------------
# PREDICT FAILURE
# ----------------------------
def predict_failure(cpu, memory, errors, response_time):

    model, _ = load_model()

    # Use numpy array to avoid feature name warnings
    input_data = np.array([[cpu, memory, errors, response_time]], dtype=float)

    prediction = model.predict(input_data)[0]
    probability = model.predict_proba(input_data)[0][1]

    return prediction, probability


# ----------------------------
# EXPLAIN PREDICTION (XAI)
# ----------------------------
def explain_prediction(cpu, memory, errors, response_time):

    reasons = []

    if cpu > CPU_ALERT_THRESHOLD:
        reasons.append("the computer's processor is working too hard")

    if memory > MEMORY_ALERT_THRESHOLD:
        reasons.append("the computer's memory is almost full")

    if errors > ERROR_ALERT_THRESHOLD:
        reasons.append("the computer is making too many mistakes")

    if response_time > RESPONSE_TIME_ALERT_THRESHOLD:
        reasons.append("the computer is taking too long to respond")

    if reasons:
        return "Your computer might have problems because " + ", ".join(reasons) + "."
    else:
        return "Everything looks good - your computer is running smoothly!"


# ----------------------------
# GET SOLUTIONS FOR ISSUES
# ----------------------------
def get_solutions(cpu, memory, errors, response_time):

    solutions = []

    if cpu > CPU_ALERT_THRESHOLD:
        solutions.append({
            "issue": "High CPU Usage",
            "problem": "The computer's processor is working too hard",
            "solutions": [
                "Close unnecessary programs and browser tabs",
                "Run a virus scan to check for malware",
                "Update your operating system and drivers",
                "Consider upgrading to a faster processor if this happens frequently",
                "Use Task Manager (Ctrl+Shift+Esc) to identify and close high-CPU processes"
            ]
        })

    if memory > MEMORY_ALERT_THRESHOLD:
        solutions.append({
            "issue": "High Memory Usage",
            "problem": "The computer's memory is almost full",
            "solutions": [
                "Close unused programs and browser tabs",
                "Clear temporary files and browser cache",
                "Uninstall unnecessary software",
                "Add more RAM if you frequently run out of memory",
                "Use built-in disk cleanup tools to free up space",
                "Move large files to external storage"
            ]
        })

    if errors > ERROR_ALERT_THRESHOLD:
        solutions.append({
            "issue": "High Error Count",
            "problem": "The computer is making too many mistakes",
            "solutions": [
                "Run a full system scan with antivirus software",
                "Check for and install Windows updates",
                "Update all installed software and drivers",
                "Run System File Checker: Open Command Prompt as admin and type 'sfc /scannow'",
                "Check disk for errors: Open Command Prompt as admin and type 'chkdsk /f'",
                "Test your RAM using Windows Memory Diagnostic tool"
            ]
        })

    if response_time > RESPONSE_TIME_ALERT_THRESHOLD:
        solutions.append({
            "issue": "Slow Response Time",
            "problem": "The computer is taking too long to respond",
            "solutions": [
                "Restart your computer to clear temporary issues",
                "Close background programs and processes",
                "Disable startup programs you don't need",
                "Clear browser cache and temporary internet files",
                "Defragment your hard drive (for HDD, not SSD)",
                "Check your internet connection speed and stability",
                "Consider upgrading to a solid-state drive (SSD) for faster performance"
            ]
        })

    return solutions


# ----------------------------
# TEST MODEL
# ----------------------------
if __name__ == "__main__":

    # Train model if needed
    model, accuracy = train_model()

    # Example test values
    cpu = 85
    memory = 60
    errors = 80
    response_time = 320

    prediction, probability = predict_failure(cpu, memory, errors, response_time)

    print("Prediction:", prediction)
    print("Failure Probability:", probability)
    print(f"Accuracy from training data: {accuracy * 100:.2f}%")

    explanation = explain_prediction(cpu, memory, errors, response_time)
    solutions = get_solutions(cpu, memory, errors, response_time)

    print("Explanation:", explanation)
    if solutions:
        print("Solutions provided:")
        for solution in solutions:
            print(f"- {solution['issue']}: {len(solution['solutions'])} steps")
    else:
        print("No solutions needed - system is healthy!")
