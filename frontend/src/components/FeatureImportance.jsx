import './FeatureImportance.css'

function FeatureImportance({ explanation }) {
  if (typeof explanation !== 'string' || explanation.trim().length === 0) return null

  // Parse explanation to extract features with icons
  const parseExplanation = (text) => {
    const factorMapping = [
      {
        pattern: /the computer's processor is working too hard/gi,
        icon: '⚙️',
        label: 'High CPU Usage - Processor overload'
      },
      {
        pattern: /the computer's memory is almost full/gi,
        icon: '💾',
        label: 'High Memory Usage - RAM shortage'
      },
      {
        pattern: /the computer is making too many mistakes/gi,
        icon: '⚡',
        label: 'High Error Count - System errors'
      },
      {
        pattern: /the computer is taking too long to respond/gi,
        icon: '🐢',
        label: 'Slow Response - Performance lag'
      }
    ]

    const features = []
    factorMapping.forEach(({ pattern, icon, label }) => {
      if (pattern.test(text)) {
        features.push({ icon, label })
      }
    })

    if (features.length === 0) {
      features.push({
        icon: '✅',
        label: 'All system metrics are within safe ranges'
      })
    }

    return features
  }

  const features = parseExplanation(explanation)

  return (
    <div className="feature-importance">
      <h3>Explainable AI Analysis</h3>
      <div className="explanation-text">
        <p>{explanation}</p>
      </div>

      <div className="contributing-factors">
        <h4>Contributing Factors</h4>
        <div className="factors-list">
          {features.map((feature, index) => (
            <div key={index} className="factor-item">
              <span className="factor-icon">{feature.icon}</span>
              <span className="factor-text">{feature.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="xai-info">
        <p><em>💡 How We Explain Predictions:</em> Our AI system analyzes your computer's performance metrics and provides clear, understandable explanations of why it might be at risk or running smoothly. Each factor contributes to the final prediction.</p>
      </div>
    </div>
  )
}

export default FeatureImportance
