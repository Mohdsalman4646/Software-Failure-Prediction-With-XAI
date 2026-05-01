import './PredictionResult.css'

function PredictionResult({ prediction }) {
  if (!prediction || typeof prediction !== 'object') {
    return null
  }

  const riskLevel = prediction.risk_level || 'Medium'
  const confidence = Number(prediction.confidence_score) || 0
  
  const isLow = riskLevel === 'Low'
  const isMedium = riskLevel === 'Medium'
  const isHigh = riskLevel === 'High'
  
  const riskIcon = isLow ? '✅' : isMedium ? '⚠️' : '🚨'
  const riskText = isLow ? 'System Safe' : isMedium ? 'System Caution' : 'System at Risk'
  const riskColor = isLow ? '#10b981' : isMedium ? '#f59e0b' : '#ef4444'

  return (
    <div className={`prediction-result ${isLow ? 'safe' : isHigh ? 'failure' : 'warning'}`}>
      <div className="result-header">
        <div className="status-indicator">
          <div className={`status-dot ${isLow ? 'safe' : isHigh ? 'failure' : 'warning'}`}></div>
          <h3 data-emoji={riskIcon}>{riskText}</h3>
        </div>
      </div>

      <div className="result-content">
        <div className="probability-section">
          <h4>Confidence Score</h4>
          <div className="probability-bar">
            <div 
              className={`probability-fill ${isLow ? 'safe' : isHigh ? 'failure' : 'warning'}`}
              style={{ width: `${confidence}%` }}
            ></div>
          </div>
          <p className="probability-text">
            <strong style={{ color: riskColor }}>{confidence.toFixed(1)}%</strong> confidence
          </p>
        </div>

        <div className="result-metrics">
          <div className="metric-card">
            <span className="metric-label">🎲 Risk Level</span>
            <span className="metric-value" style={{
              color: isLow ? '#10b981' : isMedium ? '#f59e0b' : '#ef4444'
            }}>
              {riskLevel}
            </span>
          </div>
          <div className="metric-card">
            <span className="metric-label">📊 Confidence</span>
            <span className="metric-value">{confidence.toFixed(1)}%</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">🎯 System Status</span>
            <span className="metric-value" style={{
              color: isLow ? '#10b981' : isMedium ? '#f59e0b' : '#ef4444'
            }}>
              {isLow ? 'Healthy' : isMedium ? 'Monitor' : 'Alert'}
            </span>
          </div>
          <div className="metric-card">
            <span className="metric-label">⚡ Recommendation</span>
            <span className="metric-value" style={{ color: riskColor }}>
              {isLow ? 'Continue' : isMedium ? 'Watch' : 'Act'}
            </span>
          </div>
        </div>

        {prediction.explanation && (
          <div className="explanation-section">
            <h4>📋 Analysis</h4>
            <p className="explanation-text">{prediction.explanation}</p>
          </div>
        )}

        {prediction.solutions && prediction.solutions.length > 0 && (
          <div className="solutions-section">
            <h4>🔧 Recommended Actions</h4>
            <div className="solutions-list">
              {prediction.solutions.map((solution, index) => (
                <div key={index} className="solution-item">
                  <h5>{index + 1}. {solution.issue}</h5>
                  <p className="problem-description">{solution.problem}</p>
                  <ul className="solution-steps">
                    {solution.solutions.map((step, stepIndex) => (
                      <li key={stepIndex}>
                        <span className="step-icon">→</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PredictionResult
