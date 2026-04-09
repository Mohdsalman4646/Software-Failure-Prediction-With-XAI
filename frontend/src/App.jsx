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

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '')

const normalizeLiveData = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  const cpu = Number(payload.cpu_usage)
  const memory = Number(payload.memory_usage)
  const errors = Number(payload.error_count)
  const response = Number(payload.response_time)

  if ([cpu, memory, errors, response].some((value) => !Number.isFinite(value))) {
    return null
  }

  return {
    cpu_usage: cpu,
    memory_usage: memory,
    error_count: errors,
    response_time: response
  }
}

const normalizePrediction = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  const prediction = payload.prediction
  const probability = Number(payload.probability)
  const explanation = typeof payload.explanation === 'string' ? payload.explanation : ''
  const solutions = Array.isArray(payload.solutions) ? payload.solutions : []
  const features = payload.features && typeof payload.features === 'object' ? payload.features : {}

  if (prediction !== 'safe' && prediction !== 'failure') {
    return null
  }

  if (!Number.isFinite(probability) || probability < 0 || probability > 1) {
    return null
  }

  return {
    prediction,
    probability,
    explanation,
    solutions,
    features
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
  const [showSplash, setShowSplash] = useState(true)
  const [splashFadeOut, setSplashFadeOut] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashFadeOut(true)
      setTimeout(() => {
        setShowSplash(false)
      }, 800) // Match the fade-out animation duration
    }, 2500) // 2.5 seconds

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode)
    document.body.classList.toggle('light-mode', !darkMode)
  }, [darkMode])

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
    } catch (err) {
      setPrediction(null)
      setError(getErrorMessage(err, 'Failed to get prediction. Make sure the backend is running.'))
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGetLiveData = async () => {
    setMonitoringLoading(true)
    setError(null)
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/monitor`)
      const normalizedData = normalizeLiveData(response.data)

      if (!normalizedData) {
        throw new Error('Invalid monitor payload')
      }

      setLiveData(normalizedData)
    } catch (err) {
      setLiveData(null)
      setError(getErrorMessage(err, 'Failed to get live system data. Check backend URL and ensure backend is running on port 5000.'))
      console.error('Error:', err)
    } finally {
      setMonitoringLoading(false)
    }
  }

  const toggleTheme = () => {
    setDarkMode(!darkMode)
  }

  return (
    <AppErrorBoundary>
      <>
        {showSplash && (
          <SplashScreen fadeOut={splashFadeOut} />
        )}

        {!showSplash && (
          <div className={`app-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
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
                <AnalyticsDashboard />
                <div className="content-grid">
                  {/* Left Panel - Input Form */}
                  <section className="input-section">
                    <h2>System Metrics</h2>
                    <div className="live-data-section">
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
                            <span>Errors: {liveData.error_count}</span>
                            <span>Response: {liveData.response_time.toFixed(0)}ms</span>
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
          </div>
        )}
      </>
    </AppErrorBoundary>
  )
}

export default App
