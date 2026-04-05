# 🚀 Quick Start Guide

## ⚡ Get Running in 2 Steps (Windows)

### Step 1: Start the Backend
Open **Command Prompt** or **PowerShell** and run:
```bash
cd C:\Users\moham\OneDrive\Desktop\SFP
start_backend.bat
```

Wait until you see:
```
Server running on http://localhost:5000
```

### Step 2: Start the Frontend
Open **another** Command Prompt/PowerShell and run:
```bash
cd C:\Users\moham\OneDrive\Desktop\SFP
start_frontend.bat
```

Wait until you see:
```
Local:   http://localhost:5173/
```
*(Note: If port 5173 is in use, it may use 5174, 5175, or another port)*

### Step 3: Open Browser
Visit: **http://localhost:5173** (or the port shown in your terminal)

✅ You're done! The app is running!

---

## 🎮 Using the Application

1. **Adjust the sliders** to set system metrics:
   - CPU Usage (0-100%)
   - Memory Usage (0-100%)
   - Error Count (0-100)
   - Response Time (0-5000ms)

2. **Click "🚀 Predict"** button

3. **See results** with:
   - Prediction (Safe ✅ or Failure 🚨)
   - Confidence score
   - **Simple explanation** in everyday words (like "your computer is working too hard" instead of technical terms)
   - **Step-by-step solutions** to fix any problems found

4. **Try dark mode** - Click the moon icon 🌙 in the header

---

## 📊 Understanding Results

### Green (Safe ✅)
- **Meaning**: System is operating normally
- **Risk Level**: LOW
- **Action**: No immediate action needed

### Red (Failure 🚨)
- **Meaning**: System at risk of failure
- **Risk Level**: MEDIUM/HIGH
- **Action**: Review system metrics and optimize

### Explanation
The explanation below results shows **why** the prediction was made in **simple, everyday words** that anyone can understand:
- Instead of "High CPU usage", it says "the computer's processor is working too hard"
- Instead of "Slow response time", it says "the computer is taking too long to respond"
- Clear messages like "Everything looks good - your computer is running smoothly!"

### Solutions
When problems are detected, the system provides **specific, actionable solutions** for each issue:
- **High CPU Usage**: Close unnecessary programs, run virus scans, update drivers
- **High Memory Usage**: Clear temporary files, uninstall unused software, add more RAM
- **High Error Count**: Run system scans, update software, check disk for errors
- **Slow Response Time**: Restart computer, disable startup programs, clear cache

Each solution includes **step-by-step instructions** you can follow immediately.

---

## 🧪 Sample Test Cases

### Test 1: Safe System
```
CPU: 40%
Memory: 50%
Errors: 2
Response Time: 300ms
→ Expected: Safe ✅
```

### Test 2: At Risk
```
CPU: 85%
Memory: 80%
Errors: 25
Response Time: 1800ms
→ Expected: Failure 🚨
```

### Test 3: Critical
```
CPU: 95%
Memory: 92%
Errors: 45
Response Time: 3500ms
→ Expected: Failure 🚨 (High Confidence)
```

---

## 🛑 Stop Running

### Stop Backend
- Go to backend terminal window
- Press `Ctrl + C`

### Stop Frontend
- Go to frontend terminal window
- Press `Ctrl + C`

---

## ❓ Troubleshooting

### "Cannot connect to localhost:5000"
- ✓ Make sure backend terminal is running
- ✓ Check backend shows "Server running on http://localhost:5000"
- ✓ Check port 5000 is not blocked by firewall

### "Port 5173 already in use"
- ✓ Close any other development servers
- ✓ Run `start_frontend.bat` again

### "ModuleNotFoundError"
- ✓ Backend Python dependencies missing
- ✓ Run: `pip install -r requirements.txt` in backend folder
- ✓ Or activate virtual environment: `\.venv\Scripts\activate.bat` then install packages

---

## 📚 More Information

- **Full README**: See `README_FULL.md`
- **Setup Guide**: See `SETUP_GUIDE.md`
- **API Docs**: Visit `http://localhost:5000/api/info` when backend running

---

## 🎓 Project Files

### Frontend
```
Software Failure Prediction With XAI/
├── src/
│   ├── components/          ← React components
│   ├── App.jsx             ← Main app
│   └── *.css               ← Styles
├── package.json
└── vite.config.js
```

### Backend
```
backend/
├── app.py                  ← Flask API
├── model.py               ← ML & XAI
├── requirements.txt       ← Dependencies
└── *.pkl                  ← Trained models
```

---

## ✨ Cool Features to Try

- 🌙 **Dark Mode**: Toggle in header
- 📊 **Dynamic Sliders**: Real-time value display
- ⚡ **Instant Predictions**: 1-2 second response
- 💡 **Smart Explanations**: Rule-based XAI insights
- � **Step-by-Step Solutions**: Actionable fixes for detected problems
- 🎨 **ASK Watermark**: Subtle background branding that adapts to light/dark themes
- �📱 **Mobile Friendly**: Try on phone!

---

## 🎉 Success!

You now have a fully functional **Software Failure Prediction** system with:
- Machine Learning model
- Explainable AI explanations
- Modern responsive UI
- Dark/Light mode
- Real-time predictions

**Enjoy!** 🚀

---

**Need help?** Check `SETUP_GUIDE.md` for detailed troubleshooting.
