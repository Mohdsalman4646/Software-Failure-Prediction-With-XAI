import { useState, useEffect } from 'react'
import axios from 'axios'
import PredictionForm from './components/PredictionForm'
import PredictionResult from './components/PredictionResult'
import FeatureImportance from './components/FeatureImportance'
import ThemeToggle from './components/ThemeToggle'
import SplashScreen from './components/SplashScreen'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import './App.css'

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
      const apiPromise = axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/predict`, formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      // Ensure minimum 2-second loading time for better UX
      const timeoutPromise = new Promise(resolve => setTimeout(resolve, 2000))
      
      const [response] = await Promise.all([apiPromise, timeoutPromise])
      
      setPrediction(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to get prediction. Make sure the backend is running.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGetLiveData = async () => {
    setMonitoringLoading(true)
    setError(null)
    
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/monitor`)
      setLiveData(response.data)
    } catch (err) {
      setError('Failed to get live system data. Make sure the backend is running.')
      console.error('Error:', err)
    } finally {
      setMonitoringLoading(false)
    }
  }

  const toggleTheme = () => {
    setDarkMode(!darkMode)
  }

  return (
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
  )
}

export default App
