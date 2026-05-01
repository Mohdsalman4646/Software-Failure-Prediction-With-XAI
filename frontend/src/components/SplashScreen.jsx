import { useEffect, useMemo, useState } from 'react'
import './SplashScreen.css'

const SplashScreen = ({ fadeOut }) => {
  const [barHeights, setBarHeights] = useState([])
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => ({
        id: index,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 3 + Math.random() * 4,
        size: 2 + Math.random() * 3,
      })),
    []
  )

  useEffect(() => {
    const heights = Array.from({ length: 16 }, () => Math.random() * 100)
    setBarHeights(heights)
  }, [])

  return (
    <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className="splash-backdrop">
        <div className="backdrop-gradient"></div>
        <div className="holo-noise"></div>
        <div className="ambient-orb ambient-orb-left"></div>
        <div className="ambient-orb ambient-orb-right"></div>

        <div className="particle-field" aria-hidden="true">
          {particles.map((particle) => (
            <span
              key={particle.id}
              className="hud-particle"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
              }}
            ></span>
          ))}
        </div>
        
        <div className="corner-decoration corner-top-left">
          <svg viewBox="0 0 100 100" width="100" height="100">
            <path d="M 10 10 L 50 10 L 50 20 L 20 20 L 20 50 L 10 50 Z" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
            <line x1="10" y1="30" x2="40" y2="30" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          </svg>
        </div>
        
        <div className="corner-decoration corner-top-right">
          <svg viewBox="0 0 100 100" width="120" height="100">
            <line x1="10" y1="15" x2="70" y2="15" stroke="currentColor" strokeWidth="1" opacity="0.4" />
            <line x1="20" y1="25" x2="80" y2="25" stroke="currentColor" strokeWidth="1" opacity="0.5" />
            <line x1="10" y1="35" x2="70" y2="35" stroke="currentColor" strokeWidth="1" opacity="0.4" />
            <line x1="15" y1="50" x2="75" y2="50" stroke="currentColor" strokeWidth="1" opacity="0.3" />
          </svg>
        </div>

        <div className="corner-decoration corner-bottom-left">
          <svg viewBox="0 0 100 100" width="120" height="100">
            <rect x="10" y="10" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
            <rect x="15" y="15" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
            <line x1="50" y1="10" x2="50" y2="60" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          </svg>
        </div>

        <svg className="connector-lines" viewBox="0 0 1000 800" preserveAspectRatio="none">
          <g className="lines-group">
            <path className="connector connector-a" d="M 100 400 Q 250 350, 400 350" stroke="#38bdf8" strokeWidth="2" fill="none" opacity="0.6" />
            <path className="connector connector-b" d="M 100 450 Q 250 450, 400 450" stroke="#22d3ee" strokeWidth="1.5" fill="none" opacity="0.4" />
            <path className="connector connector-c" d="M 900 350 Q 750 350, 600 350" stroke="#38bdf8" strokeWidth="2" fill="none" opacity="0.6" />
            <path className="connector connector-d" d="M 900 450 Q 750 450, 600 450" stroke="#22d3ee" strokeWidth="1.5" fill="none" opacity="0.4" />
          </g>
        </svg>
        <div className="scanline-overlay"></div>
      </div>

      <div className="center-container">
        <div className="radar-wrapper">
          <div className="radar-aura"></div>
          <div className="radar-rings">
            <div className="ring ring-1"></div>
            <div className="ring ring-2"></div>
            <div className="ring ring-3"></div>
            <div className="ring ring-4"></div>
            <div className="radar-ticks">
              {Array.from({ length: 48 }).map((_, index) => (
                <span
                  key={index}
                  style={{
                    transform: `translate(-50%, -50%) rotate(${index * 7.5}deg)`,
                  }}
                ></span>
              ))}
            </div>
          </div>

          <div className="radar-grid">
            <svg viewBox="0 0 200 200" width="200" height="200">
              <line x1="100" y1="10" x2="100" y2="190" stroke="#38bdf8" strokeWidth="1" opacity="0.4" />
              <line x1="10" y1="100" x2="190" y2="100" stroke="#38bdf8" strokeWidth="1" opacity="0.4" />

              <line x1="30" y1="30" x2="170" y2="170" stroke="#38bdf8" strokeWidth="0.8" opacity="0.3" />
              <line x1="170" y1="30" x2="30" y2="170" stroke="#38bdf8" strokeWidth="0.8" opacity="0.3" />

              <circle cx="100" cy="50" r="2" fill="#38bdf8" opacity="0.6" />
              <circle cx="150" cy="100" r="2" fill="#38bdf8" opacity="0.6" />
              <circle cx="100" cy="150" r="2" fill="#38bdf8" opacity="0.6" />
              <circle cx="50" cy="100" r="2" fill="#38bdf8" opacity="0.6" />
            </svg>
          </div>

          <div className="radar-scanner"></div>
          <div className="radar-pulse"></div>
          <div className="radar-blip radar-blip-1"></div>
          <div className="radar-blip radar-blip-2"></div>
          <div className="center-dot"></div>
        </div>
      </div>

      <div className="data-viz-left">
        <div className="left-hud-panel left-hud-panel-top">
          <span className="hud-label">LIVE TELEMETRY</span>
          <span className="hud-value">SYNCED</span>
        </div>
        <div className="left-hud-panel left-hud-panel-bottom">
          <span className="hud-label">MODEL STATUS</span>
          <span className="hud-value">READY</span>
        </div>
      </div>

      <div className="data-viz-right">
        <div className="viz-container">
          <div className="bar-chart">
            {barHeights.slice(0, 8).map((height, i) => (
              <div key={i} className="bar-item">
                <div className="bar" style={{ height: `${height}%` }}></div>
              </div>
            ))}
          </div>

          <div className="viz-elements">
            <div className="element-lines">
              <svg viewBox="0 0 50 60" width="50" height="60">
                <line x1="0" y1="10" x2="40" y2="10" stroke="#38bdf8" strokeWidth="1" opacity="0.5" />
                <line x1="0" y1="25" x2="50" y2="25" stroke="#38bdf8" strokeWidth="1" opacity="0.4" />
                <line x1="0" y1="40" x2="45" y2="40" stroke="#38bdf8" strokeWidth="1" opacity="0.5" />
              </svg>
            </div>
            
            <svg viewBox="0 0 60 80" width="60" height="80" className="circle-indicator">
              <circle cx="30" cy="30" r="20" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.5" />
              <circle cx="30" cy="30" r="15" fill="none" stroke="#38bdf8" strokeWidth="0.8" opacity="0.3" />
              <circle cx="30" cy="30" r="10" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.6" />
              <circle cx="30" cy="30" r="3" fill="#38bdf8" opacity="0.8" />
            </svg>
          </div>
        </div>
      </div>

      <div className="splash-panel">
        <h2 className="main-title">SOFTWARE FAILURE PREDICTION</h2>
        <p className="main-subtitle">WITH XAI</p>

        <div className="loading-indicator">
          <div className="loading-track">
            <span className="loading-fill"></span>
          </div>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p className="loading-text">Analyzing system patterns...</p>
        </div>
      </div>
    </div>
  )
}

export default SplashScreen