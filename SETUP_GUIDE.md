# 🚀 Setup & Installation Guide

## System Requirements

- **Node.js**: 16.0 or higher
- **Python**: 3.8 or higher
- **npm** or **yarn**: Package manager
- **Administrator access**: For port binding (5000, 5173)

## 🎯 Quick Start (5 minutes)

### Windows Users

1. **Open Terminal 1** (for Backend):
   ```bash
   cd C:\Users\moham\OneDrive\Desktop\SFP
   start_backend.bat
   ```

2. **Open Terminal 2** (for Frontend):
   ```bash
   cd C:\Users\moham\OneDrive\Desktop\SFP
   start_frontend.bat
   ```

3. **Open Browser**: http://localhost:5173

### Mac/Linux Users

1. **Terminal 1** (Backend):
   ```bash
   cd ~/path-to-project
   ./start_backend.sh
   ```

2. **Terminal 2** (Frontend):
   ```bash
   cd ~/path-to-project
   ./start_frontend.sh
   ```

3. **Open Browser**: http://localhost:5173

## 📖 Detailed Installation

### Step 1: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend server
python app.py
```

**Expected output:**
```
Starting Software Failure Prediction API...
Server running on http://localhost:5000
API documentation available at http://localhost:5000/api/info
```

### Step 2: Frontend Setup

```bash
# Navigate to frontend directory
cd "Software Failure Prediction With XAI"

# Install npm dependencies
npm install

# Start development server
npm run dev
```

**Expected output:**
```
  VITE v8.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

## ✅ Verification Checklist

### Backend is Running:
- [ ] Terminal shows "Server running on http://localhost:5000"
- [ ] No error messages or exceptions
- [ ] Model is trained (you'll see accuracy/precision metrics)

Test with:
```bash
# In another terminal, test the API
curl http://localhost:5000/api/health
```

Expected response:
```json
{"status": "healthy", "message": "API is running"}
```

### Frontend is Running:
- [ ] Terminal shows "Local: http://localhost:5173/"
- [ ] No compilation errors
- [ ] Browser can access the app

### End-to-End Test:
1. Open http://localhost:5173
2. Adjust sliders to input metrics
3. Click "🚀 Predict" button
4. Should see results with explanation within 2-3 seconds
5. Try dark mode toggle in header

## 🔧 Troubleshooting

### Backend Issues

**Error: "Address already in use"**
```bash
# Backend port 5000 is in use
# Option 1: Kill the process using port 5000
# On Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Option 2: Change port in app.py (last line)
# app.run(debug=True, port=5001, host='0.0.0.0')
```

**Error: "ModuleNotFoundError: No module named 'flask'"**
```bash
# Reinstall dependencies
pip install -r requirements.txt

# Or manually install
pip install flask flask-cors scikit-learn numpy
```

**Error: "Connection refused" from frontend**
```bash
# Make sure backend is running
# Check that backend is on http://localhost:5000
# Verify CORS is enabled in app.py
```

### Frontend Issues

**Error: "npm command not found"**
```bash
# Install Node.js from https://nodejs.org/
# Restart terminal after installation
```

**Error: "Port 5173 already in use"**
```bash
# Kill the process using port 5173
# Or change port in vite.config.js
# server: { port: 3000 }
```

**Error: "Cannot find module 'axios'"**
```bash
cd "Software Failure Prediction With XAI"
npm install axios recharts
```

### CORS Issues

If frontend can't reach backend, ensure backend has CORS enabled:
```python
# In app.py, verify this line exists:
CORS(app)  # This enables Cross-Origin requests
```

## 🐍 Python/Backend Configuration

### Environment Variables

Create `.env` file in backend directory (optional):
```
FLASK_ENV=development
FLASK_DEBUG=True
MODEL_PATH=failure_model.pkl
```

### Using Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install packages
pip install -r requirements.txt

# Deactivate when done
deactivate
```

## 📦 Dependencies Explained

### Frontend
- **react**: UI framework
- **react-dom**: React DOM rendering
- **axios**: HTTP requests to backend
- **recharts**: Data visualization (optional, for future charts)

### Backend
- **flask**: Web framework
- **flask-cors**: Enable CORS for frontend
- **scikit-learn**: Machine learning library
- **numpy**: Numerical computing

## 🚀 Build for Production

### Frontend Build
```bash
cd "Software Failure Prediction With XAI"
npm run build

# Output will be in dist/ directory
```

### Backend Deployment
```bash
# Use production WSGI server (gunicorn)
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 🧪 Testing the API

### Using curl

```bash
# Health check
curl http://localhost:5000/api/health

# Get API info
curl http://localhost:5000/api/info

# Make a prediction
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "cpu_usage": 75,
    "memory_usage": 82,
    "error_count": 15,
    "response_time": 1250
  }'
```

### Using Postman

1. Create new POST request
2. URL: `http://localhost:5000/api/predict`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "cpu_usage": 45,
  "memory_usage": 60,
  "error_count": 5,
  "response_time": 200
}
```

## 📚 Project Structure Reference

```
SFP/
├── Software Failure Prediction With XAI/  (Frontend)
│   ├── src/
│   │   ├── components/                     (React components)
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── backend/                                 (Backend)
│   ├── app.py                              (Flask app)
│   ├── model.py                            (ML model)
│   ├── requirements.txt
│   └── *.pkl                               (Trained models)
│
├── start_backend.bat/.sh                   (Startup scripts)
├── start_frontend.bat/.sh
└── README_FULL.md
```

## 🆘 Getting Help

1. **Check console errors**: Both frontend and backend show errors in terminal
2. **Check network tab**: Browser DevTools → Network tab for API calls
3. **Test API directly**: Use curl or Postman to test backend
4. **Check ports**: Ensure 5000 and 5173 are not in use

## ✨ Next Steps

Once everything is running:

1. **Test predictions**: Try different metric combinations
2. **Understand explanations**: Read the XAI insights
3. **Try dark mode**: Click moon icon in header
4. **Explore API**: Visit http://localhost:5000/api/info
5. **Customize**: Modify thresholds in model.py
6. **Extend**: Add more features or improve UI

## 📝 Notes

- Initial backend startup may take 10-30 seconds (model training)
- Model files (*.pkl) are generated automatically
- Frontend hot-reloads on file changes
- Backend requires restart after code changes

## 🎉 You're Ready!

Your Software Failure Prediction system is now ready to use. Start with the Quick Start section above!
