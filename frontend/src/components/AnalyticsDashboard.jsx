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
      latency: Math.max(20, 100 + valueNoise * 8 + Math.random() * 40),
      errorRate: Math.max(0.5, 5 + Math.sin(index / 3) * 1.5 + Math.random() * 1),
      timestamp: baseTime + index * 2500
    }
  })
}

const formatHistoryTime = (timestamp) => {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) {
    return '--'
  }

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const CustomDot = ({ cx, cy, payload, dataKey }) => {
  const value = payload[dataKey]
  const thresholds = {
    cpu: 86,
    memory: 90,
    latency: 200,
    errorRate: 15
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

const AnalyticsDashboard = ({ predictionHistory = [] }) => {
  const [data, setData] = useState(generateInitialData)
  const hasRealHistory = Array.isArray(predictionHistory) && predictionHistory.length > 0

  const historyData = useMemo(() => {
    if (!hasRealHistory) {
      return []
    }

    return predictionHistory
      .slice(-12)
      .map((entry, index) => ({
        time: formatHistoryTime(entry.timestamp),
        cpu: entry.cpu_usage,
        memory: entry.memory_usage,
        latency: entry.network_latency,
        errorRate: entry.error_rate,
        timestamp: Number(entry.timestamp) || Date.now() + index,
        risk_level: entry.risk_level,
        confidence_score: entry.confidence_score
      }))
  }, [predictionHistory, hasRealHistory])

  const chartData = hasRealHistory ? historyData : data

  useEffect(() => {
    if (hasRealHistory) {
      return undefined
    }

    const interval = setInterval(() => {
      setData((prevData) => {
        const nextIndex = prevData.length
        const prev = prevData[prevData.length - 1]
        const cpu = Math.max(24, Math.min(98, prev.cpu + (Math.random() - 0.4) * 12))
        const memory = Math.max(30, Math.min(96, prev.memory + (Math.random() - 0.5) * 10))
        const latency = Math.max(15, Math.min(800, prev.latency + (Math.random() - 0.4) * 60))
        const errorRate = Math.max(0.1, Math.min(25, prev.errorRate + (Math.random() - 0.4) * 1.5))
        const nextValue = {
          time: `${nextIndex * 2}m`,
          cpu,
          memory,
          latency,
          errorRate,
          timestamp: Date.now()
        }
        return [...prevData.slice(-11), nextValue]
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [hasRealHistory])

  const summary = useMemo(() => {
    const latest = chartData[chartData.length - 1]
    if (!latest) {
      return []
    }

    return [
      { label: 'CPU Usage', value: `${latest.cpu.toFixed(1)}%`, color: '#22d3ee', unit: 'avg' },
      { label: 'Memory Usage', value: `${latest.memory.toFixed(1)}%`, color: '#a855f7', unit: 'avg' },
      { label: 'Network Latency', value: `${latest.latency.toFixed(0)}ms`, color: '#34d399', unit: 'ms' }
    ]
  }, [chartData])

  return (
    <section className="dashboard-shell">
      <div className="dashboard-header">
        <div>
          <h2>System Performance Dashboard</h2>
          <p>Live analytics with XAI-backed anomaly alerts and intelligent metrics.</p>
        </div>
        <div className="dashboard-meta">
          <span>{hasRealHistory ? 'Data source: live monitor feed and prediction history' : 'Live updates every 1s'}</span>
          <span>{hasRealHistory ? 'Real prediction trend mode' : 'Dark mode optimized · Premium SaaS UI'}</span>
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
            <LineChart data={chartData} margin={{ top: 22, right: 18, left: 0, bottom: 0 }}>
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
            <AreaChart data={chartData} margin={{ top: 22, right: 18, left: 0, bottom: 0 }}>
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
              {chartData.map((entry, index) => entry.memory > 90 ? (
                <ReferenceDot key={`mem-${index}`} x={entry.time} y={entry.memory} r={5} fill="#ff4b6b" stroke="#ff4b6b" />
              ) : null)}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="dashboard-card">
          <div className="card-title">Error Rate</div>
          <div className="chart-legend">
            <span className="legend-marker errors" /> Error Rate %
            <span className="legend-marker anomaly" /> Risk
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 22, right: 18, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 12 }} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#94a3b8' }} />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ color: '#cbd5e1' }} />
              <Bar dataKey="errorRate" fill="#10b981" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.errorRate > 15 ? '#ff4b6b' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="dashboard-card">
          <div className="card-title">Network Latency</div>
          <div className="chart-legend">
            <span className="legend-marker latency" /> Latency
            <span className="legend-marker anomaly" /> High
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={{ top: 22, right: 18, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 12 }} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#94a3b8' }} />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ color: '#cbd5e1' }} />
              <Line type="monotone" dataKey="latency" stroke="#34d399" strokeWidth={3} dot={<CustomDot dataKey="latency" />} activeDot={{ r: 6, strokeWidth: 2, fill: '#6ee7b7' }} />
              {chartData.map((entry, index) => entry.latency > 200 ? (
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
