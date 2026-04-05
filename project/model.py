import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

# ----------------------------
# TRAIN MODEL
# ----------------------------
def train_model():

    # Load dataset
    data = pd.read_csv("D:/MINIPROJECT/data.csv")

    # Features and label
    X = data[["cpu", "memory", "errors", "response_time"]]
    y = data["failure"]

    # Split dataset
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Train model
    model = RandomForestClassifier()
    model.fit(X_train, y_train)

    # Save model
    joblib.dump(model, "D:/MINIPROJECT/trained_model.pkl")

    print("Model trained and saved successfully")

    return model


# ----------------------------
# LOAD MODEL
# ----------------------------
def load_model():
    return joblib.load("trained_model.pkl")


# ----------------------------
# PREDICT FAILURE
# ----------------------------
def predict_failure(cpu, memory, errors, response_time):

    model = load_model()

    input_data = [[cpu, memory, errors, response_time]]

    prediction = model.predict(input_data)[0]
    probability = model.predict_proba(input_data)[0][1]

    return prediction, probability


# ----------------------------
# EXPLAIN PREDICTION (XAI)
# ----------------------------
def explain_prediction(cpu, memory, errors, response_time):

    reasons = []

    if cpu > 1500:
        reasons.append("High CPU usage")

    if memory > 50:
        reasons.append("High memory load")

    if errors > 5:
        reasons.append("Frequent system errors")

    if response_time > 310:
        reasons.append("Slow response time")

    if reasons:
        return "Failure risk due to: " + ", ".join(reasons)
    else:
        return "System operating normally"


# ----------------------------
# TEST MODEL
# ----------------------------
if __name__ == "__main__":

    # Train model if needed
    model = train_model()

    # Example test values
    cpu = 1600
    memory = 60
    errors = 8
    response_time = 320

    prediction, probability = predict_failure(cpu, memory, errors, response_time)

    print("Prediction:", prediction)
    print("Failure Probability:", probability)

    explanation = explain_prediction(cpu, memory, errors, response_time)

    print("Explanation:", explanation)