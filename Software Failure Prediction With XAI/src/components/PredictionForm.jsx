import { useState, useEffect } from 'react'
import './PredictionForm.css'

function PredictionForm({ onSubmit, isLoading, liveData }) {
  const [formData, setFormData] = useState({
    cpu_usage: 50,
    memory_usage: 60,
    error_count: 5,
    response_time: 200
  })

  // Update form data when live data is received
  useEffect(() => {
    if (liveData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(prevData => ({
        ...prevData,
        cpu_usage: Math.round(liveData.cpu_usage),
        memory_usage: Math.round(liveData.memory_usage),
        error_count: Math.round(liveData.error_count),
        response_time: Math.round(liveData.response_time)
      }))
    }
  }, [liveData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="prediction-form">
      <div className="form-group">
        <label htmlFor="cpu_usage">
          CPU Usage (%)
          <span className="value-display">{formData.cpu_usage}%</span>
        </label>
        <input
          type="range"
          id="cpu_usage"
          name="cpu_usage"
          min="0"
          max="100"
          value={formData.cpu_usage}
          onChange={handleChange}
          className="range-input"
        />
        <div className="range-labels">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="memory_usage">
          Memory Usage (%)
          <span className="value-display">{formData.memory_usage}%</span>
        </label>
        <input
          type="range"
          id="memory_usage"
          name="memory_usage"
          min="0"
          max="100"
          value={formData.memory_usage}
          onChange={handleChange}
          className="range-input"
        />
        <div className="range-labels">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="error_count">
          Error Count
          <span className="value-display">{formData.error_count}</span>
        </label>
        <input
          type="range"
          id="error_count"
          name="error_count"
          min="0"
          max="100"
          value={formData.error_count}
          onChange={handleChange}
          className="range-input"
        />
        <div className="range-labels">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="response_time">
          Response Time (ms)
          <span className="value-display">{formData.response_time}ms</span>
        </label>
        <input
          type="range"
          id="response_time"
          name="response_time"
          min="0"
          max="5000"
          step="100"
          value={formData.response_time}
          onChange={handleChange}
          className="range-input"
        />
        <div className="range-labels">
          <span>0ms</span>
          <span>2500ms</span>
          <span>5000ms</span>
        </div>
      </div>

      <button 
        type="submit" 
        className="submit-button"
        disabled={isLoading}
      >
        {isLoading ? '⏳ Predicting...' : '🚀 Predict'}
      </button>
    </form>
  )
}

export default PredictionForm
