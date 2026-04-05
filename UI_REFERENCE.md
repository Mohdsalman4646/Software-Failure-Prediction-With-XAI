# 🎨 UI/UX Reference Guide

Visual guide to understand what you'll see when using the application.

---

## 🖼️ Application Layout

### Header Section
```
┌─────────────────────────────────────────────────────┐
│ 🔮 Software Failure Prediction | 🌙                │
│ Powered by Machine Learning & Explainable AI (XAI) │
└─────────────────────────────────────────────────────┘
```

**Header Features:**
- Gradient purple-to-pink background
- White text with transparency effect
- Moon icon (🌙) for dark mode toggle (top right)
- Responsive on mobile

---

## 📱 Main Layout (Desktop)

```
┌──────────────────────────────────────────────────────────────┐
│                        HEADER                                 │
├──────────────────────┬──────────────────────────────────────┤
│                      │                                       │
│  INPUT SECTION       │      RESULT SECTION                  │
│  (Left Column)       │      (Right Column)                  │
│                      │                                       │
│  • CPU Slider        │  ✅ Prediction Result OR            │
│  • Memory Slider     │  📊 Empty State OR                  │
│  • Error Slider      │  ⚠️ Error Message OR                │
│  • Response Slider   │  ⏳ Loading Spinner                 │
│                      │                                       │
│  [🚀 Predict Button] │                                       │
│                      │                                       │
└──────────────────────┴──────────────────────────────────────┘
│                        FOOTER                                 │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎯 Input Form Section

```
╔════════════════════════════════════╗
║        System Metrics              ║
╠════════════════════════════════════╣
║                                    ║
║  CPU Usage (%)              [50%]  ║
║  ██████░░░░░░░░░░░░░░░░░░░░░░░░  ║
║  0%          50%          100%     ║
║                                    ║
║  Memory Usage (%)           [60%]  ║
║  ███████░░░░░░░░░░░░░░░░░░░░░░░  ║
║  0%          50%          100%     ║
║                                    ║
║  Error Count                 [5]   ║
║  █░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ║
║  0           50           100      ║
║                                    ║
║  Response Time (ms)        [200]   ║
║  ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ║
║  0ms        2500ms       5000ms    ║
║                                    ║
║        [🚀 Predict]                ║
║                                    ║
╚════════════════════════════════════╝
```

**Form Features:**
- Smooth range sliders
- Real-time value display in badge
- Min/max labels on bottom
- Gradient thumb on hover
- Disabled state when loading

---

## ✅ Safe Result Display

```
╔════════════════════════════════════╗
║  ┌──────────────────────────────┐  ║
║  │ ● ✅ System Safe             │  ║
║  └──────────────────────────────┘  ║
║                                    ║
║  Prediction Confidence             ║
║  ██████████████████░░░░░░░░░░░░  ║
║  Safe: 98%                         ║
║                                    ║
║  ┌──────────┬──────────────────┐  ║
║  │Prediction│ SAFE             │  ║
║  ├──────────┼──────────────────┤  ║
║  │Prediction│ LOW              │  ║
║  │Risk Level│ (green)          │  ║
║  └──────────┴──────────────────┘  ║
║                                    ║
║  📊 XAI Explanation                ║
║  ┌────────────────────────────┐   ║
║  │ All metrics within healthy │   ║
║  │ range. No errors detected. │   ║
║  │ Excellent response time.   │   ║
║  └────────────────────────────┘   ║
║                                    ║
║  Key Factors:                      ║
║  → Normal CPU usage (45%)          ║
║  → Normal memory usage (50%)       ║
║  → No system errors detected       ║
║  → Response time excellent (250ms) ║
║                                    ║
╚════════════════════════════════════╝
```

**Safe Result Features:**
- Green header with checkmark ✅
- Pulsing green status indicator
- Green probability bar
- Positive tone in explanation
- Scrollable factors list

---

## 🚨 Failure Result Display

```
╔════════════════════════════════════╗
║  ┌──────────────────────────────┐  ║
║  │ ● 🚨 System at Risk          │  ║
║  └──────────────────────────────┘  ║
║                                    ║
║  Prediction Confidence             ║
║  ████████████████░░░░░░░░░░░░░░░ ║
║  Failure Risk: 78%                 ║
║                                    ║
║  ┌──────────┬──────────────────┐  ║
║  │Prediction│ FAILURE          │  ║
║  ├──────────┼──────────────────┤  ║
║  │Prediction│ HIGH             │  ║
║  │Risk Level│ (red)            │  ║
║  └──────────┴──────────────────┘  ║
║                                    ║
║  📊 XAI Explanation                ║
║  ┌────────────────────────────┐   ║
║  │ High failure risk detected  │   ║
║  │ due to: high CPU usage,     │   ║
║  │ high memory usage, many     │   ║
║  │ errors detected.            │   ║
║  └────────────────────────────┘   ║
║                                    ║
║  Key Factors:                      ║
║  → High CPU usage (80%)            ║
║  → High memory usage (85%)         ║
║  → Elevated error count (20)       ║
║  → Slow response time (1500ms)     ║
║                                    ║
╚════════════════════════════════════╝
```

**Failure Result Features:**
- Red header with warning 🚨
- Pulsing red status indicator
- Red probability bar
- Warning tone in explanation
- Specific risk factors listed

---

## ⏳ Loading State

```
╔════════════════════════════════════╗
║                                    ║
║           ⠙ ⠹ ⠸ ⠼ ⠴ ⠦ ⠧ ⠇ ⠏          ║
║         (Spinning Loader)          ║
║                                    ║
║   Analyzing system metrics...      ║
║                                    ║
║   (Button disabled - grayed out)   ║
║                                    ║
╚════════════════════════════════════╝
```

**Loading Features:**
- Smooth rotating border animation
- "Analyzing..." text
- Centered in results area
- Submit button disabled
- Shows while API call in progress

---

## ⚠️ Error State

```
╔════════════════════════════════════╗
║  ⚠️ Error                          ║
║                                    ║
║  Failed to get prediction. Make    ║
║  sure the backend is running.      ║
║                                    ║
║  (Red border, light red background)║
╚════════════════════════════════════╝
```

**Error Features:**
- Red border and background
- Warning icon ⚠️
- User-friendly message
- Clear instructions
- Dismisses on new prediction

---

## 📊 Empty State

```
╔════════════════════════════════════╗
║                                    ║
║             📊                     ║
║         (Floating animation)       ║
║                                    ║
║   Submit system metrics to see     ║
║   predictions and explanations     ║
║                                    ║
╚════════════════════════════════════╝
```

**Empty State Features:**
- Large emoji icon 📊
- Floating animation
- Helpful instruction text
- Guides user on what to do

---

## 📱 Mobile Layout

```
┌──────────────────────┐
│ 🔮 Prediction | 🌙  │
│ Powered by ML & XAI  │
├──────────────────────┤
│                      │
│  📋 INPUT FORM       │
│  • Sliders           │
│  • Values            │
│  [🚀 Predict]        │
│                      │
│  📊 RESULTS          │
│  • Prediction        │
│  • Explanation       │
│  (Stacked vertically)│
│                      │
├──────────────────────┤
│ © 2025 Software...   │
└──────────────────────┘
```

**Mobile Features:**
- Single column layout
- Full-width components
- Touch-friendly sliders
- Readable text size
- Stacked vertically

---

## 🌙 Dark Mode Comparison

### Light Mode
```
Background: White (#ffffff)
Text: Dark Gray (#1f2937)
Cards: Light Gray (#f9fafb)
Accents: Purple/Pink gradient
Borders: Light Gray (#e5e7eb)
```

### Dark Mode
```
Background: Dark Gray (#1f2937)
Text: Light Gray (#f9fafb)
Cards: Very Dark (#111827)
Accents: Purple/Pink gradient (same)
Borders: Medium Gray (#374151)
```

**Toggle Animation:**
- Smooth 0.3s transition
- All colors update together
- Moon 🌙 → Sun ☀️ icon change
- Preference persists during session

---

## 🎨 Color Palette

| Use | Light Mode | Dark Mode |
|-----|-----------|-----------|
| Safe | #10b981 (green) | #10b981 (green) |
| Failure | #ef4444 (red) | #ef4444 (red) |
| Warning | #f59e0b (orange) | #f59e0b (orange) |
| Primary | #6366f1 (indigo) | #6366f1 (indigo) |
| Secondary | #ec4899 (pink) | #ec4899 (pink) |
| Background | #ffffff | #1f2937 |
| Text Primary | #1f2937 | #f9fafb |
| Text Secondary | #6b7280 | #d1d5db |

---

## ✨ Interactive Effects

### Slider Hover
```
Normal:  ░░░░░░░░░░░░░░░░░
Hover:   ███████████░░░░░  (gradient background)
         (thumb scales up)
```

### Button Hover
```
Normal:  [🚀 Predict]
Hover:   [🚀 Predict]  (raised with shadow, slight shimmer)
Click:   [🚀 Predict]  (pressed down)
```

### Card Hover
```
Normal:  ╔══════════╗
         ║ Content  ║
         ╚══════════╝

Hover:   ╔══════════╗
         ║ Content  ║  (lifts up, shadow increases)
         ╚══════════╝
```

### Status Indicator
```
Safe:    ● ✅  (Green, pulsing 2s cycle)
Failure: ● 🚨  (Red, pulsing 2s cycle)
```

---

## 🔔 Animations Explained

### Slide In Up
```
Prediction result enters from bottom with fade
Duration: 0.5s
Easing: ease-out
```

### Float
```
Empty state icon floats up/down
Duration: 3s
Translation: 0 to -10px to 0
```

### Spin
```
Loading spinner rotates continuously
Duration: 1s
Direction: Clockwise, infinite
```

### Pulse
```
Status indicator fades on and off
Duration: 2s
Opacity: 1 → 0.5 → 1
Infinite loop
```

---

## 📏 Responsive Breakpoints

### Desktop (1024px+)
- Two-column layout
- Full-sized components
- Larger fonts
- Spacious spacing

### Tablet (768px - 1024px)
- Still two columns
- Slightly smaller fonts
- Reduced padding

### Mobile (<768px)
- Single column
- Stacked layout
- Optimized spacing
- Touch-friendly sizes

---

## ♿ Accessibility Features

- ✅ Semantic HTML (section, header, footer, etc.)
- ✅ Focus visible outlines (2px solid purple)
- ✅ High contrast ratios
- ✅ ARIA labels where needed
- ✅ Keyboard navigable (tabs work throughout)
- ✅ Color not sole indicator of status

---

## 📐 Spacing Guide

```
• Header padding: 2rem (32px)
• Section padding: 2rem (32px)
• Component gap: 1.5rem (24px)
• Form group gap: 0.5rem (8px)
• Border radius: 1rem (16px) - sections
• Border radius: 0.75rem (12px) - buttons
• Border radius: 0.5rem (8px) - inputs
```

---

## 🎯 User Interaction Flow

```
1. Page Loads
   ↓
2. User Adjusts Sliders
   ├─ Values update in real-time
   └─ Form validates
   ↓
3. User Clicks "Predict"
   ├─ Button disables
   ├─ Loading spinner shows
   ↓
4. Backend Processes (~100ms)
   ├─ Model predicts
   ├─ XAI generates explanation
   ↓
5. Results Display
   ├─ Animates in from bottom
   ├─ Color codes feature importance
   ├─ Shows explanation
   ↓
6. User Can:
   ├─ Read explanation
   ├─ Adjust metrics
   ├─ Make new prediction
   ├─ Toggle dark mode
```

---

## 🎊 Summary

The UI provides:
- ✨ **Beautiful** modern design with gradients
- 🎯 **Clear** visual hierarchy
- ⚡ **Smooth** animations and transitions
- 📱 **Responsive** across all devices
- ♿ **Accessible** to all users
- 🌙 **Themeable** with dark mode
- 💡 **Intuitive** user interactions
- 🎨 **Polished** attention to detail

---

**Every interaction is thoughtfully designed for clarity and delight!**
