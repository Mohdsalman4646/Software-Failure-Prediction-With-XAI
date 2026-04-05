import './ThemeToggle.css'

function ThemeToggle({ darkMode, onToggle }) {
  return (
    <button className="theme-toggle" onClick={onToggle}>
      {darkMode ? '☀️' : '🌙'}
    </button>
  )
}

export default ThemeToggle
