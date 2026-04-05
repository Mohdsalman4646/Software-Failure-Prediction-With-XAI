import { useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceDot,
  ReferenceArea
} from 'recharts'
import './AnalyticsDashboard.css'

const generateInitialData = () => {
  const baseTime = Date.now() - 11 * 2500
  return Array.from({ length: 12 }).map((_, index) => {
    const valueNoise = Math.sin(index / 2) * 8
    return {
      time: `${index * 2}m`,
      cpu: Math.max(28, 55 + valueNoise + Math.random() * 10),
      memory: Math.max(34, 48 + valueNoise + Math.random() * 12),
      errors: Math.max(0, Math.round(2 + Math.sin(index / 3) * 2 + Math.random() * 2)),
      response: Math.max(120, 260 + valueNoise * 12 + Math.random() * 70),
      timestamp: baseTime + index * 2500
    }
  })
}

const CustomDot = ({ cx, cy, payload, dataKey }) => {
  const value = payload[dataKey]
  const thresholds = {
    cpu: 86,
    memory: 90,
    errors: 8,
    response: 800
  }
  const isAnomaly = value > thresholds[dataKey]

  return (
    <circle
      cx={cx}
      cy={cy}
      r={isAnomaly ? 6 : 3}
      fill={isAnomaly ? '#ff4b6b' : '#00e5ff'}
      stroke={isAnomaly ? '#ff4b6b' : '#38bdf8'}
      strokeWidth={isAnomaly ? 2 : 1}
      opacity={isAnomaly ? 1 : 0.9}
    />
  )
}

const AnalyticsDashboard = () => {
  const [data, setData] = useState(generateInitialData)

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prevData) => {
        const nextIndex = prevData.length
        const prev = prevData[prevData.length - 1]
        const cpu = Math.max(24, Math.min(98, prev.cpu + (Math.random() - 0.4) * 12))
        const memory = Math.max(30, Math.min(96, prev.memory + (Math.random() - 0.5) * 10))
        const response = Math.max(110, Math.min(950, prev.response + (Math.random() - 0.4) * 100))
        const errors = Math.max(0, Math.min(18, prev.errors + Math.round((Math.random() - 0.4) * 3)))
        const nextValue = {
          time: `${nextIndex * 2}m`,
          cpu,
          memory,
          errors,
          response,
          timestamp: Date.now()
        }
        return [...prevData.slice(-11), nextValue]
      })
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  const summary = useMemo(() => {
    const latest = data[data.length - 1]
    return [
      { label: 'CPU Usage', value: `${latest.cpu.toFixed(1)}%`, color: '#22d3ee', unit: 'avg' },
      { label: 'Memory Usage', value: `${latest.memory.toFixed(1)}%`, color: '#a855f7', unit: 'avg' },
      { label: 'Error Count', value: latest.errors, color: '#34d399', unit: 'count' },
      { label: 'Response Time', value: `${latest.response.toFixed(0)}ms`, color: '#fb7185', unit: 'avg' }
    ]
  }, [data])

  return (
    <section className="dashboard-shell">
      <div className="dashboard-header">
        <div>
          <h2>System Performance Dashboard</h2>
          <p>Live analytics with XAI-backed anomaly alerts and intelligent metrics.</p>
        </div>
        <div className="dashboard-meta">
          <span>Live updates every 2.5s</span>
          <span>Dark mode optimized · Premium SaaS UI</span>
        </div>
      </div>

      <div className="dashboard-summary">
        {summary.map((item) => (
          <div key={item.label} className="summary-card" style={{ borderColor: item.color }}>
            <div className="summary-title">{item.label}</div>
            <div className="summary-value" style={{ color: item.color }}>{item.value}</div>
            <div className="summary-note">{item.unit === 'count' ? 'Current count' : 'Current average'}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-title">CPU Usage Over Time</div>
          <div className="chart-legend">
            <span className="legend-marker cpu" /> CPU
            <span className="legend-marker anomaly" /> Anomaly
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data} margin={{ top: 22, right: 18, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 12 }} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#94a3b8' }} />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ color: '#cbd5e1' }} />
              <Line type="monotone" dataKey="cpu" stroke="#22d3ee" strokeWidth={3} dot={<CustomDot dataKey="cpu" />} activeDot={{ r: 6, strokeWidth: 2, fill: '#38bdf8' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="dashboard-card">
          <div className="card-title">Memory Usage</div>
          <div className="chart-legend">
            <span className="legend-marker memory" /> Memory
            <span className="legend-marker anomaly" /> Spike
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data} margin={{ top: 22, right: 18, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="memoryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 12 }} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#94a3b8' }} />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ color: '#cbd5e1' }} />
              <Area type="monotone" dataKey="memory" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#memoryGradient)" dot={<CustomDot dataKey="memory" />} />
              {data.map((entry, index) => entry.memory > 90 ? (
                <ReferenceDot key={`mem-${index}`} x={entry.time} y={entry.memory} r={5} fill="#ff4b6b" stroke="#ff4b6b" />
              ) : null)}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="dashboard-card">
          <div className="card-title">Error Count</div>
          <div className="chart-legend">
            <span className="legend-marker errors" /> Errors
            <span className="legend-marker anomaly" /> Alert
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} margin={{ top: 22, right: 18, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 12 }} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#94a3b8' }} />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ color: '#cbd5e1' }} />
              <Bar dataKey="errors" fill="#34d399" radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.errors > 8 ? '#ff4b6b' : '#34d399'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="dashboard-card">
          <div className="card-title">Response Time</div>
          <div className="chart-legend">
            <span className="legend-marker response" /> Response
            <span className="legend-marker anomaly" /> Danger
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data} margin={{ top: 22, right: 18, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 12 }} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#94a3b8' }} />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ color: '#cbd5e1' }} />
              <Line type="monotone" dataKey="response" stroke="#fb7185" strokeWidth={3} dot={<CustomDot dataKey="response" />} activeDot={{ r: 6, strokeWidth: 2, fill: '#f472b6' }} />
              {data.map((entry, index) => entry.response > 800 ? (
                <ReferenceArea key={`ref-${index}`} x1={entry.time} x2={entry.time} stroke="rgba(255,75,107,0.15)" />
              ) : null)}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  )
}

export default AnalyticsDashboard
