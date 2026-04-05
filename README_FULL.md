# 🔮 Software Failure Prediction with Explainable AI (XAI)

A modern, full-stack web application that uses Machine Learning and Explainable AI to predict software system failures in real-time.

## 📋 Project Overview

This application combines a **React-based frontend** with a **Python Flask backend** to:

- 🎯 **Predict** whether a system will fail based on system metrics
- 📊 **Explain** predictions using rule-based XAI techniques
- 🎨 **Visualize** results with modern, responsive UI
- 🌙 **Adapt** to dark/light mode preferences

## 🚀 Quick Start

### Frontend Setup

```bash
cd "Software Failure Prediction With XAI"
npm install
npm run dev
```

Frontend will be available at: `http://localhost:5173`

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Backend API will be available at: `http://localhost:5000`

## 🏗️ Project Structure

```
Software Failure Prediction With XAI/
├── src/
│   ├── components/
│   │   ├── PredictionForm.jsx      # Input form component
│   │   ├── PredictionResult.jsx    # Results display
│   │   ├── FeatureImportance.jsx   # XAI explanation component
│   │   ├── ThemeToggle.jsx         # Dark/light mode toggle
│   │   └── *.css                   # Component styles
│   ├── App.jsx                      # Main app component
│   ├── App.css                      # Global styles
│   ├── main.jsx                     # Entry point
│   └── index.css                    # Global CSS

backend/
├── app.py                           # Flask application
├── model.py                         # ML model & XAI logic
├── requirements.txt                 # Python dependencies
└── *.pkl                           # Trained model files
```

## 🎯 Features

### Core Functionality

✅ **Input Form** - Collect system metrics:
- CPU Usage (0-100%)
- Memory Usage (0-100%)
- Error Count (0-100)
- Response Time (0-5000ms)

✅ **ML Prediction** - Powered by Gradient Boosting:
- Trained on synthetic realistic data
- Handles feature interactions
- 95%+ accuracy on test set

✅ **XAI Explanation** - Rule-based interpretability:
- Why the system is safe or at-risk
- Specific contributing factors
- Actionable insights

✅ **Modern UI** - React + Dynamic CSS:
- Responsive design (mobile & desktop)
- Smooth animations & transitions
- Color-coded feedback (green safe, red failure)
- Loading states & error handling
- Dark/light mode toggle
- **ASK watermark** - Subtle background branding

✅ **Solution Recommendations** - Actionable fixes:
- Step-by-step solutions for detected issues
- Covers CPU, memory, errors, and response time problems
- User-friendly language for non-technical users

### API Endpoints

#### `POST /api/predict`
Make a prediction with system metrics.

**Request:**
```json
{
  "cpu_usage": 75.5,
  "memory_usage": 82.3,
  "error_count": 15,
  "response_time": 1250
}
```

**Response:**
```json
{
  "prediction": "failure",
  "probability": 0.78,
  "explanation": "High failure risk detected due to: very high CPU usage (75.5%), high memory usage (82.3%), elevated error count (15)...",
  "features": {
    "cpu_usage": 75.5,
    "memory_usage": 82.3,
    "error_count": 15,
    "response_time": 1250
  }
}
```

#### `GET /api/health`
Health check endpoint.

#### `GET /api/info`
Get API information and documentation.

## 🤖 Machine Learning Model

### Model Architecture
- **Algorithm**: Gradient Boosting Classifier
- **Features**: 4 (CPU, Memory, Errors, Response Time)
- **Training Data**: 1000 synthetic samples with realistic patterns
- **Performance**: ~95% accuracy

### XAI Approach
Rule-based explanations that analyze:
- Individual feature contributions
- Feature interactions
- Risk factor severity
- Actionable recommendations

## 🎨 UI/UX Highlights

- **Modern Design**: Gradient backgrounds, smooth shadows, card-based layout
- **Animations**: Floating icons, spinning loader, sliding alerts, hovering effects
- **Responsive**: Grid layout adjusts to mobile/tablet/desktop
- **Accessibility**: Focus states, semantic HTML, ARIA attributes
- **Dark Mode**: Full theme support with CSS variables

## 📊 Sample Predictions

### System Safe ✅
```
CPU: 45% | Memory: 55% | Errors: 2 | Response: 250ms
→ Prediction: SAFE (confidence: 98%)
→ Explanation: All metrics within healthy range
```

### System at Risk 🚨
```
CPU: 92% | Memory: 89% | Errors: 35 | Response: 3200ms
→ Prediction: FAILURE (confidence: 85%)
→ Explanation: Critical CPU/memory usage, excessive errors...
```

## 🔧 Technologies

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **Axios** - HTTP client
- **CSS3** - Modern styling with variables and animations

### Backend
- **Flask 2.3** - Web framework
- **scikit-learn** - ML library
- **NumPy** - Numerical computing
- **Python 3.8+** - Language

## 📦 Installation Details

### Prerequisites
- Node.js 16+ (frontend)
- Python 3.8+ (backend)
- npm or yarn (package manager)

### Step-by-step

1. **Clone/Extract project**
2. **Install frontend**:
   ```bash
   cd "Software Failure Prediction With XAI"
   npm install
   ```

3. **Install backend**:
   ```bash
   cd ../backend
   pip install -r requirements.txt
   ```

4. **Run backend**:
   ```bash
   python app.py
   ```

5. **Run frontend** (in another terminal):
   ```bash
   cd "Software Failure Prediction With XAI"
   npm run dev
   ```

6. **Access app** at http://localhost:5173

## 🎓 How It Works

### Prediction Pipeline
1. User inputs system metrics via form
2. Frontend sends POST request to backend API
3. Backend ML model scales features
4. Model generates prediction & probability
5. XAI engine analyzes features & creates explanation
6. Response returned with prediction, probability, and explanation
7. Frontend displays results with visual feedback

### XAI Logic
- Analyzes each input feature independently
- Identifies risk thresholds for each metric
- Combines factors based on ML model decision
- Generates human-readable explanation
- Highlights key contributing factors

## 🚀 Future Enhancements

- [ ] Real-time monitoring dashboard
- [ ] Historical prediction trends
- [ ] SHAP/LIME advanced XAI visualizations
- [ ] Model retraining interface
- [ ] Multi-model ensemble
- [ ] Batch prediction API
- [ ] Export results to CSV
- [ ] Alert system with thresholds

## 📝 License

This project is provided as-is for educational and commercial use.

## 🤝 Contributing

Feel free to extend and customize:
- Add more metrics to the model
- Implement advanced XAI techniques
- Enhance UI/UX
- Add data persistence
- Create visualization dashboard

## 📧 Support

For issues or questions, please refer to the API documentation at `/api/info` endpoint.

---

**Built with ❤️ using React, Flask, and Machine Learning**
