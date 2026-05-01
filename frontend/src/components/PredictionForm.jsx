import { useState, useEffect } from 'react'
import './PredictionForm.css'

function PredictionForm({ onSubmit, isLoading, liveData }) {
  const [formData, setFormData] = useState({
    cpu_usage: 50,
    memory_usage: 60,
    disk_usage: 70,
    network_latency: 80,
    error_rate: 5
  })

  // Update form data when live data is received
  useEffect(() => {
    if (liveData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(prevData => ({
        ...prevData,
        cpu_usage: Math.round(liveData.cpu_usage),
        memory_usage: Math.round(liveData.memory_usage),
        disk_usage: Math.round(liveData.disk_usage),
        network_latency: Math.round(liveData.network_latency),
        error_rate: Math.round(liveData.error_rate)
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

      <input
        type="hidden"
        id="disk_usage"
        name="disk_usage"
        value={formData.disk_usage}
        readOnly
      />

      <div className="form-group">
        <label htmlFor="network_latency">
          Network Latency (ms)
          <span className="value-display">{formData.network_latency}ms</span>
        </label>
        <input
          type="range"
          id="network_latency"
          name="network_latency"
          min="0"
          max="1000"
          step="10"
          value={formData.network_latency}
          onChange={handleChange}
          className="range-input"
        />
        <div className="range-labels">
          <span>0ms</span>
          <span>500ms</span>
          <span>1000ms</span>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="error_rate">
          Error Rate (%)
          <span className="value-display">{formData.error_rate}%</span>
        </label>
        <input
          type="range"
          id="error_rate"
          name="error_rate"
          min="0"
          max="100"
          step="0.5"
          value={formData.error_rate}
          onChange={handleChange}
          className="range-input"
        />
        <div className="range-labels">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
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
