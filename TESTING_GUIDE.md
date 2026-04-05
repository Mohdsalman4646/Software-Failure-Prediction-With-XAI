# 🧪 Testing & Demo Scenarios

Complete guide to test the Software Failure Prediction application with realistic scenarios.

## 📋 Prerequisites

✅ Backend running on http://localhost:5000
✅ Frontend running on http://localhost:5173
✅ Browser opened to http://localhost:5173

---

## 🎯 Test Scenario 1: Perfectly Healthy System

**Scenario**: Your production system is running optimally

### Input Values:
- **CPU Usage**: 30%
- **Memory Usage**: 45%
- **Error Count**: 0
- **Response Time**: 150ms

### Expected Result:
```
✅ SAFE (98-99% confidence)
Risk Level: LOW
```

### Expected Explanation:
- All metrics within healthy range
- No system errors detected
- Excellent response time
- No immediate action needed

### Why This Happens:
All values are well below failure thresholds, so model confidently predicts a safe system.

---

## 🎯 Test Scenario 2: Warning Signs

**Scenario**: System showing early warning signs of potential issues

### Input Values:
- **CPU Usage**: 65%
- **Memory Usage**: 70%
- **Error Count**: 8
- **Response Time**: 800ms

### Expected Result:
```
✅ SAFE (65-75% confidence)
Risk Level: LOW-MEDIUM
```

### Expected Explanation:
- CPU usage elevated (65%)
- Memory usage normal
- Minor errors present (8)
- Response time reasonable but slightly high

### Why This Happens:
Some metrics are elevated but not at critical thresholds. The model still predicts safe but with lower confidence.

---

## 🎯 Test Scenario 3: At-Risk System

**Scenario**: System showing multiple concerning metrics

### Input Values:
- **CPU Usage**: 80%
- **Memory Usage**: 82%
- **Error Count**: 20
- **Response Time**: 1500ms

### Expected Result:
```
🚨 FAILURE (70-80% confidence)
Risk Level: HIGH
```

### Expected Explanation:
- High CPU usage (80%) impacts stability
- High memory usage (82%) is elevated
- Elevated error count (20) detected
- Warning: Response time of 1500ms suggests bottlenecks

### Why This Happens:
Multiple metrics exceed warning thresholds, creating cumulative failure risk. Model predicts likely failure.

---

## 🎯 Test Scenario 4: Critical System

**Scenario**: System in critical condition, imminent failure risk

### Input Values:
- **CPU Usage**: 95%
- **Memory Usage**: 92%
- **Error Count**: 42
- **Response Time**: 3200ms

### Expected Result:
```
🚨 FAILURE (90-95% confidence)
Risk Level: CRITICAL
```

### Expected Explanation:
- Critical: CPU usage at 95% severely impacts system stability
- Critical: Memory usage at 92% may cause crashes
- Alert: System has 42 errors indicating operational problems
- Critical: Response time of 3200ms indicates severe performance degradation

**Recommended Action**: Immediate intervention required!

### Why This Happens:
All metrics at critical levels, creating very high failure probability. Model confidently predicts failure.

---

## 🎯 Test Scenario 5: CPU Spike Only

**Scenario**: Temporary CPU spike during deployment

### Input Values:
- **CPU Usage**: 88%
- **Memory Usage**: 55%
- **Error Count**: 3
- **Response Time**: 250ms

### Expected Result:
```
🚨 FAILURE (55-65% confidence)
Risk Level: MEDIUM
```

### Expected Explanation:
- High CPU usage (88%) may cause performance issues
- Memory usage is normal at 55%
- System has 3 minor errors
- Response time is excellent at 250ms

### Why This Happens:
Although CPU is high, other metrics are good. Model detects risk but confidence is moderate.

---

## 🎯 Test Scenario 6: Memory Leak Pattern

**Scenario**: System experiencing memory leak

### Input Values:
- **CPU Usage**: 50%
- **Memory Usage**: 91%
- **Error Count**: 15
- **Response Time**: 1100ms

### Expected Result:
```
🚨 FAILURE (75-85% confidence)
Risk Level: HIGH
```

### Expected Explanation:
- CPU usage is normal at 50%
- Critical: Memory usage at 91% may cause crashes
- Caution: 15 errors detected in system
- Warning: Response time of 1100ms suggests bottlenecks

### Why This Happens:
High memory combined with errors and slow response predicts failure. This is typical of memory leak pattern.

---

## 🎯 Test Scenario 7: Slow Response Time Issue

**Scenario**: Database connection bottleneck causing slow responses

### Input Values:
- **CPU Usage**: 45%
- **Memory Usage**: 60%
- **Error Count**: 10
- **Response Time**: 2800ms

### Expected Result:
```
🚨 FAILURE (70-80% confidence)
Risk Level: MEDIUM-HIGH
```

### Expected Explanation:
- CPU usage is normal at 45%
- Memory usage is acceptable at 60%
- Caution: 10 errors detected
- Critical: Response time of 2800ms indicates severe performance degradation

### Why This Happens:
Very slow response time is a strong failure predictor, even if CPU/memory are OK. Indicates resource bottleneck.

---

## 🎯 Test Scenario 8: Intermittent Errors

**Scenario**: System generating many errors but other metrics OK

### Input Values:
- **CPU Usage**: 55%
- **Memory Usage**: 65%
- **Error Count**: 35
- **Response Time**: 400ms

### Expected Result:
```
🚨 FAILURE (75-85% confidence)
Risk Level: HIGH
```

### Expected Explanation:
- CPU usage is normal at 55%
- Memory usage is acceptable at 65%
- Alert: System has 35 errors indicating operational problems
- Response time is reasonable at 400ms

### Why This Happens:
High error count is a strong failure indicator, even if resource metrics look good.

---

## 📊 Pattern Recognition Examples

### Safe System Pattern
```
Low CPU (30-50%) + Low Memory (40-60%) + Few Errors (0-5) + Fast Response (100-500ms)
→ Always SAFE
```

### Warning Pattern
```
Medium CPU (60-75%) + Medium Memory (70-80%) + Some Errors (5-15) + Normal Response (600-1200ms)
→ Mixed result, depends on specific combination
```

### Failure Pattern
```
High CPU (80%+) OR High Memory (85%+) OR Many Errors (30+) OR Slow Response (2000ms+)
→ Usually FAILURE
```

### Critical Pattern
```
Very High CPU (90%+) AND High Memory (85%+) AND Many Errors (40+) AND Slow Response (3000ms+)
→ Always FAILURE (High confidence)
```

---

## 🧪 Interactive Testing Tips

### 1. Test Threshold Sensitivity
Gradually increase one metric while keeping others constant:
```
Start: CPU 50%, Memory 50%, Errors 5, Response 250ms → SAFE
Middle: CPU 75%, Memory 50%, Errors 5, Response 250ms → ?
High: CPU 85%, Memory 50%, Errors 5, Response 250ms → FAILURE
```

This shows how sensitive each metric is.

### 2. Test Feature Interactions
Compare two scenarios with same total "load":
```
Scenario A: CPU 90%, Memory 40%, Errors 5, Response 200ms → FAILURE
Scenario B: CPU 50%, Memory 80%, Errors 5, Response 200ms → FAILURE
```

Both fail but for different reasons!

### 3. Test Recovery
Simulate system fixing issues:
```
Critical: CPU 95%, Memory 92%, Errors 40, Response 3000ms → FAILURE
→ Restart service
Better: CPU 70%, Memory 60%, Errors 8, Response 600ms → SAFE/WARN
```

### 4. Test Dark Mode
While testing:
- Click 🌙 icon in header to toggle dark mode
- UI should smoothly transition
- All colors should remain readable

---

## 📈 Confidence Score Insights

The **probability percentage** shown in the results represents:
- **20-40%**: Weak signal, conflicting metrics
- **40-60%**: Mixed signals, borderline case
- **60-80%**: Moderate confidence, clear trend
- **80-95%**: High confidence, strong signals
- **95%+**: Very high confidence, all metrics agree

---

## 🔍 Debugging / Understanding Predictions

If a prediction seems unexpected:

1. **Read the explanation carefully** - It tells you why
2. **Check which metric is most problematic** - The explanation lists key factors
3. **Compare with similar scenarios above** - Does this match a known pattern?
4. **Try adjusting one metric at a time** - Isolate the culprit

---

## ✅ Validation Checklist

Use this checklist to verify the app works correctly:

- [ ] Backend page loads at http://localhost:5173
- [ ] Form sliders respond to mouse/touch
- [ ] Slider values display in real-time
- [ ] "Predict" button is clickable
- [ ] Loading spinner appears while predicting
- [ ] Results show prediction (Safe/Failure)
- [ ] Probability bar is visible and animated
- [ ] Explanation text appears below results
- [ ] XAI explanation makes sense
- [ ] Dark mode toggle works (click 🌙)
- [ ] Colors change in dark mode
- [ ] Safe predictions show ✅ and green colors
- [ ] Failure predictions show 🚨 and red colors
- [ ] Can make multiple predictions in a row
- [ ] Results update when metrics change

---

## 🎓 What You're Testing

### ML Model Capabilities
- Learns patterns from synthetic data
- Combines multiple features
- Assigns appropriate confidence levels
- Handles extreme values gracefully

### XAI Features
- Explains individual metric impact
- Identifies key risk factors
- Provides actionable insights
- Maintains interpretability

### UI/UX Features
- Smooth animations and transitions
- Real-time form feedback
- Clear visual hierarchy
- Responsive layout
- Dark/light mode support

---

## 📝 Notes

- **Initial predictions** may take 1-2 seconds (model loading)
- **Subsequent predictions** are faster
- **Explanations** are rule-based and deterministic
- **Confidence scores** reflect model certainty, not actual risk
- **Values are constrained** to realistic ranges

---

## 🚀 Next Steps

After testing:
1. ✅ Verify all test scenarios work
2. ✅ Explore the API at `/api/info`
3. ✅ Try the dark mode
4. ✅ Test on mobile browser
5. ✅ Review code and customization opportunities

**Enjoy exploring the application!** 🎉
