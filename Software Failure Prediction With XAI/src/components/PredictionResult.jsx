import './PredictionResult.css'

function PredictionResult({ prediction }) {
  const isSafe = prediction.prediction === 'safe'
  const probability = (prediction.probability * 100).toFixed(2)
  const riskLevel = prediction.probability > 0.7 ? 'HIGH' : prediction.probability > 0.4 ? 'MEDIUM' : 'LOW'
  const riskIcon = isSafe ? '✅' : '🚨'
  const riskText = isSafe ? 'System Safe' : 'System at Risk'

  return (
    <div className={`prediction-result ${isSafe ? 'safe' : 'failure'}`}>
      <div className="result-header">
        <div className="status-indicator">
          <div className={`status-dot ${isSafe ? 'safe' : 'failure'}`}></div>
          <h3 data-emoji={riskIcon}>{riskText}</h3>
        </div>
      </div>

      <div className="result-content">
        <div className="probability-section">
          <h4>Prediction Confidence</h4>
          <div className="probability-bar">
            <div 
              className={`probability-fill ${isSafe ? 'safe' : 'failure'}`}
              style={{ width: `${probability}%` }}
            ></div>
          </div>
          <p className="probability-text">
            {isSafe ? '✅ Safe' : '⚠️ Risk'}: <strong>{probability}%</strong>
          </p>
        </div>

        <div className="result-metrics">
          <div className="metric-card">
            <span className="metric-label">📊 Prediction</span>
            <span className="metric-value">{prediction.prediction.toUpperCase()}</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">⚡ Risk Level</span>
            <span className="metric-value" style={{
              color: riskLevel === 'HIGH' ? '#ef4444' : riskLevel === 'MEDIUM' ? '#f59e0b' : '#10b981'
            }}>
              {riskLevel}
            </span>
          </div>
          <div className="metric-card">
            <span className="metric-label">🎯 System Status</span>
            <span className="metric-value" style={{
              color: isSafe ? '#10b981' : '#ef4444'
            }}>
              {isSafe ? 'Active' : 'Alert'}
            </span>
          </div>
          <div className="metric-card">
            <span className="metric-label">📈 Confidence</span>
            <span className="metric-value">{probability}%</span>
          </div>
        </div>

        {prediction.solutions && prediction.solutions.length > 0 && (
          <div className="solutions-section">
            <h4>🔧 Recommended Solutions</h4>
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
