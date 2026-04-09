import { Component } from 'react'

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null
    }
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application render error:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-container dark-mode">
          <main className="app-main" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem' }}>
            <div className="error-card" style={{ maxWidth: '720px', width: '100%' }}>
              <h3>⚠️ Application Error</h3>
              <p>The interface hit an unexpected render problem. Reload the page to restore the app.</p>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', opacity: 0.85 }}>
                {this.state.error?.message || 'Unknown render error'}
              </pre>
              <button type="button" className="submit-button" onClick={this.handleReload}>
                Reload App
              </button>
            </div>
          </main>
        </div>
      )
    }

    return this.props.children
  }
}

export default AppErrorBoundary