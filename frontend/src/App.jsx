import { useState, useEffect } from 'react'
import axios from 'axios'
import PredictionForm from './components/PredictionForm'
import PredictionResult from './components/PredictionResult'
import FeatureImportance from './components/FeatureImportance'
import ThemeToggle from './components/ThemeToggle'
import SplashScreen from './components/SplashScreen'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import AppErrorBoundary from './components/AppErrorBoundary'
import './App.css'

const SPLASH_VISIBLE_MS = 3800
const SPLASH_FADE_MS = 800

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '')
const HISTORY_STORAGE_KEY = 'prediction_history_v1'
const HISTORY_MAX_ITEMS = 120
const LIVE_FEED_INTERVAL_MS = 1000

const normalizeLiveData = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  const cpu = Number(payload.cpu_usage)
  const memory = Number(payload.memory_usage)
  const disk = Number(payload.disk_usage)
  const latency = Number(payload.network_latency)
  const errorRate = Number(payload.error_rate)

  if ([cpu, memory, disk, latency, errorRate].some((value) => !Number.isFinite(value))) {
    return null
  }

  return {
    cpu_usage: cpu,
    memory_usage: memory,
    disk_usage: disk,
    network_latency: latency,
    error_rate: errorRate
  }
}

const normalizePrediction = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  const riskLevel = payload.risk_level
  const confidence = Number(payload.confidence_score)
  const explanation = typeof payload.explanation === 'string' ? payload.explanation : ''
  const solutions = Array.isArray(payload.solutions) ? payload.solutions : []
  const features = payload.features && typeof payload.features === 'object' ? payload.features : {}

  if (!['Low', 'Medium', 'High'].includes(riskLevel)) {
    return null
  }

  if (!Number.isFinite(confidence) || confidence < 0 || confidence > 100) {
    return null
  }

  return {
    risk_level: riskLevel,
    confidence_score: confidence,
    explanation,
    solutions,
    features
  }
}

const normalizeHistoryItem = (item) => {
  if (!item || typeof item !== 'object') {
    return null
  }

  const cpu = Number(item.cpu_usage)
  const memory = Number(item.memory_usage)
  const disk = Number(item.disk_usage)
  const latency = Number(item.network_latency)
  const errorRate = Number(item.error_rate)
  const confidence = Number(item.confidence_score)

  if ([cpu, memory, disk, latency, errorRate].some((value) => !Number.isFinite(value))) {
    return null
  }

  const riskLevel = ['Low', 'Medium', 'High'].includes(item.risk_level)
    ? item.risk_level
    : 'Medium'

  let timestamp = Number(item.timestamp)
  if (!Number.isFinite(timestamp)) {
    const createdAt = Number(item.created_at)
    timestamp = Number.isFinite(createdAt) ? createdAt * 1000 : Date.now()
  }

  return {
    timestamp,
    cpu_usage: cpu,
    memory_usage: memory,
    disk_usage: disk,
    network_latency: latency,
    error_rate: errorRate,
    risk_level: riskLevel,
    confidence_score: Number.isFinite(confidence) ? confidence : null
  }
}

const getErrorMessage = (err, fallbackMessage) => {
  const serverMessage = err?.response?.data?.error
  const serverCode = err?.response?.data?.code

  if (serverMessage && serverCode) {
    return `${serverMessage} (${serverCode})`
  }

  if (serverMessage) {
    return serverMessage
  }

  return fallbackMessage
}

function App() {
  const [loading, setLoading] = useState(false)
  const [prediction, setPrediction] = useState(null)
  const [error, setError] = useState(null)
  const [darkMode, setDarkMode] = useState(true)
  const [liveData, setLiveData] = useState(null)
  const [monitoringLoading, setMonitoringLoading] = useState(false)
  const [isLiveFeedEnabled, setIsLiveFeedEnabled] = useState(true)
  const [predictionHistory, setPredictionHistory] = useState([])
  const [showSplash, setShowSplash] = useState(true)
  const [splashFadeOut, setSplashFadeOut] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setShowSplash(false)
    }, SPLASH_VISIBLE_MS + SPLASH_FADE_MS)

    const timer = setTimeout(() => {
      setSplashFadeOut(true)
    }, SPLASH_VISIBLE_MS)

    return () => {
      clearTimeout(timer)
      clearTimeout(fadeTimer)
    }
  }, [])


  const appendPredictionHistory = (entry) => {
    const normalizedEntry = normalizeHistoryItem(entry)
    if (!normalizedEntry) {
      return
    }

    setPredictionHistory((prevHistory) => {
      const nextHistory = [...prevHistory, normalizedEntry].slice(-HISTORY_MAX_ITEMS)
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(nextHistory))
      return nextHistory
    })
  }

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode)
    document.body.classList.toggle('light-mode', !darkMode)
  }, [darkMode])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY)
      if (!raw) {
        return
      }

      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) {
        return
      }

      const normalized = parsed
        .map(normalizeHistoryItem)
        .filter(Boolean)
        .slice(-HISTORY_MAX_ITEMS)

      setPredictionHistory(normalized)
    } catch (storageError) {
      console.error('Failed to restore local prediction history:', storageError)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const loadPredictionHistory = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/prediction-history?limit=${HISTORY_MAX_ITEMS}`)
        const items = Array.isArray(response?.data?.items) ? response.data.items : []
        const normalized = items
          .map(normalizeHistoryItem)
          .filter(Boolean)
          .sort((a, b) => a.timestamp - b.timestamp)

        if (mounted && normalized.length > 0) {
          setPredictionHistory(normalized)
          localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(normalized))
        }
      } catch (historyError) {
        console.error('Failed to load prediction history from backend:', historyError)
      }
    }

    loadPredictionHistory()

    return () => {
      mounted = false
    }
  }, [])

  const handlePrediction = async (formData) => {
    setLoading(true)
    setError(null)
    
    try {
      const apiPromise = axios.post(`${API_BASE_URL}/api/predict`, formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      // Ensure minimum 2-second loading time for better UX
      const timeoutPromise = new Promise(resolve => setTimeout(resolve, 2000))
      
      const [response] = await Promise.all([apiPromise, timeoutPromise])

      const normalizedPrediction = normalizePrediction(response.data)

      if (!normalizedPrediction) {
        throw new Error('Invalid prediction payload')
      }

      setPrediction(normalizedPrediction)
      appendPredictionHistory({
        timestamp: Date.now(),
        cpu_usage: normalizedPrediction.features?.cpu_usage,
        memory_usage: normalizedPrediction.features?.memory_usage,
        disk_usage: normalizedPrediction.features?.disk_usage,
        network_latency: normalizedPrediction.features?.network_latency,
        error_rate: normalizedPrediction.features?.error_rate,
        risk_level: normalizedPrediction.risk_level,
        confidence_score: normalizedPrediction.confidence_score
      })
    } catch (err) {
      setPrediction(null)
      setError(getErrorMessage(err, 'Failed to get prediction. Make sure the backend is running.'))
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchLiveData = async ({ showLoader = false, showError = false } = {}) => {
    if (showLoader) {
      setMonitoringLoading(true)
    }

    if (showError) {
      setError(null)
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/monitor`)
      const normalizedData = normalizeLiveData(response.data)

      if (!normalizedData) {
        throw new Error('Invalid monitor payload')
      }

      setLiveData(normalizedData)
      appendPredictionHistory({
        timestamp: Date.now(),
        cpu_usage: normalizedData.cpu_usage,
        memory_usage: normalizedData.memory_usage,
        disk_usage: normalizedData.disk_usage,
        network_latency: normalizedData.network_latency,
        error_rate: normalizedData.error_rate,
        risk_level: 'Medium',
        confidence_score: null
      })

      return true
    } catch (err) {
      setLiveData(null)
      if (showError) {
        setError(getErrorMessage(err, 'Failed to get live system data. Check backend URL and ensure backend is running on port 5000.'))
      }
      console.error('Error:', err)
      return false
    } finally {
      if (showLoader) {
        setMonitoringLoading(false)
      }
    }
  }

  const handleGetLiveData = async () => {
    await fetchLiveData({ showLoader: true, showError: true })
  }

  useEffect(() => {
    if (!isLiveFeedEnabled) {
      return undefined
    }

    let mounted = true
    let pollInFlight = false

    const pollLiveFeed = async () => {
      if (!mounted || pollInFlight) {
        return
      }

      pollInFlight = true
      await fetchLiveData({ showLoader: false, showError: false })
      pollInFlight = false
    }

    pollLiveFeed()
    const interval = setInterval(pollLiveFeed, LIVE_FEED_INTERVAL_MS)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [isLiveFeedEnabled])

  const toggleLiveFeed = () => {
    setIsLiveFeedEnabled((previous) => !previous)
  }

  const toggleTheme = () => {
    setDarkMode(!darkMode)
  }

  return (
    <AppErrorBoundary>
      <>
        {showSplash && <SplashScreen fadeOut={splashFadeOut} />}
        {!showSplash && <div className={`app-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
          {/* ASK Watermark */}
          <div className="watermark">ASK</div>
          
          <header className="app-header">
            <div className="header-content">
              <h1>🔮 Software Failure Prediction</h1>
              <p>Powered by Machine Learning & Explainable AI (XAI)</p>
            </div>
            <ThemeToggle darkMode={darkMode} onToggle={toggleTheme} />
          </header>

          <main className="app-main">
            <div className="container">
              <AnalyticsDashboard predictionHistory={predictionHistory} />
              <div className="content-grid">
                {/* Left Panel - Input Form */}
                <section className="input-section">
                  <h2>System Metrics</h2>
                  <div className="live-data-section">
                    <button
                      onClick={toggleLiveFeed}
                      className={`live-feed-toggle ${isLiveFeedEnabled ? 'enabled' : 'disabled'}`}
                    >
                      {isLiveFeedEnabled ? '⏸ Pause Live Feed' : '▶ Resume Live Feed'}
                    </button>
                    <p className="live-feed-status">
                      {isLiveFeedEnabled ? 'Live feed: ON (refreshing every 1s)' : 'Live feed: OFF (manual fetch only)'}
                    </p>
                    <button 
                      onClick={handleGetLiveData} 
                      disabled={monitoringLoading}
                      className="live-data-btn"
                    >
                      {monitoringLoading ? '🔄 Getting Live Data...' : '📊 Get Live System Data'}
                    </button>
                    {liveData && (
                      <div className="live-data-display">
                        <h4>Current System Status:</h4>
                        <div className="live-metrics">
                          <span>CPU: {liveData.cpu_usage.toFixed(1)}%</span>
                          <span>Memory: {liveData.memory_usage.toFixed(1)}%</span>
                          <span>Latency: {liveData.network_latency.toFixed(0)}ms</span>
                          <span>Error Rate: {liveData.error_rate.toFixed(1)}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <PredictionForm onSubmit={handlePrediction} isLoading={loading} liveData={liveData} />
                </section>

                {/* Right Panel - Results */}
                <section className="result-section">
                  {error && (
                    <div className="error-card">
                      <h3>⚠️ Error</h3>
                      <p>{error}</p>
                    </div>
                  )}

                  {loading && (
                    <div className="loading-container">
                      <div className="spinner"></div>
                      <p>Analyzing system metrics...</p>
                    </div>
                  )}

                  {prediction && !loading && (
                    <>
                      <PredictionResult prediction={prediction} />
                      <FeatureImportance explanation={prediction.explanation} />
                    </>
                  )}

                  {!prediction && !loading && !error && (
                    <div className="empty-state">
                      <div className="empty-icon">📊</div>
                      <p>Submit system metrics to see predictions and explanations</p>
                    </div>
                  )}
                </section>
              </div>
            </div>
          </main>

          <footer className="app-footer">
            <p>© 2025 Software Failure Prediction System | Built with React & XAI</p>
          </footer>
        </div>}
      </>
    </AppErrorBoundary>
  )
}

export default App
