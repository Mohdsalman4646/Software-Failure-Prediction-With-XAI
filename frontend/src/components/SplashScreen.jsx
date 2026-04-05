import React from 'react'
import './SplashScreen.css'

const SplashScreen = ({ fadeOut }) => {
  return (
    <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className="splash-background">
        {/* Animated particles */}
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
        <div className="particle particle-5"></div>
        <div className="particle particle-6"></div>
        
        {/* Additional floating light effects */}
        <div className="floating-light light-1"></div>
        <div className="floating-light light-2"></div>
        <div className="floating-light light-3"></div>
        <div className="floating-light light-4"></div>
      </div>

      <div className="splash-content">
        <div className="logo-container">
          <div className="ask-logo">
            <span className="ask-text">ASK</span>
            <div className="logo-glow"></div>
          </div>
        </div>

        <div className="developed-text">
          DEVELOPED BY ASK
        </div>

        <div className="loading-indicator">
          {/* Pulsing dots created with CSS */}
        </div>
      </div>
    </div>
  )
}

export default SplashScreen