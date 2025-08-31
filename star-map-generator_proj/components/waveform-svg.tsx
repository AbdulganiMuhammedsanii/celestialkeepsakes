"use client"

import React from "react"

export interface WaveformConfig {
  darkMode: boolean
  deepDark?: boolean
  showGrid?: boolean
}

interface WaveformSVGProps {
  peaks: number[]
  config: WaveformConfig
  transparent?: boolean
}

export function WaveformSVG({ peaks, config, transparent = false }: WaveformSVGProps) {
  const stroke = config.darkMode ? (config.deepDark ? "#dbeafe" : "#ffffff") : "#334155"
  const grid = config.darkMode ? "#475569" : "#d4d0c8"
  const bg = config.darkMode ? (config.deepDark ? "#0b1020" : "#1e293b") : "#f5f3f0"

  const width = 1000
  const height = 600
  const mid = height / 2

  // Resampled/smoothed amplitudes to drive elegant curved lines
  const samples = React.useMemo(() => {
    if (!peaks || peaks.length === 0) return [] as number[]
    const count = 120
    const step = peaks.length / count
    const raw: number[] = []
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(i * step)
      raw.push(Math.min(1, Math.abs(peaks[Math.min(idx, peaks.length - 1)] || 0)))
    }
    // Smooth with a small moving average
    const win = 3
    const smooth: number[] = raw.map((_, i) => {
      let s = 0, n = 0
      for (let k = -win; k <= win; k++) {
        const j = i + k
        if (j >= 0 && j < raw.length) { s += raw[j]; n++ }
      }
      return s / Math.max(1, n)
    })
    return smooth
  }, [peaks])

  function buildCurvedPath(yOffset: number, ampScale: number, phase: number) {
    if (!samples.length) return ""
    const pts = samples.map((a, i) => {
      const xNorm = i / (samples.length - 1)
      // tighten horizontally: scale X around center
      const tight = 0.72
      const x = ((xNorm - 0.5) * tight + 0.5) * width
      const envelope = 0.15 + 0.85 * Math.sin(Math.PI * (i / (samples.length - 1)))
      const mod = 0.9 + 0.1 * Math.sin(8 * Math.PI * (i / (samples.length - 1)) + phase)
      const y = mid + yOffset - a * envelope * mod * (mid * ampScale * 1.15)
      return { x, y }
    })
    let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i]
      const p1 = pts[i + 1]
      const cx = (p0.x + p1.x) / 2
      const cy = (p0.y + p1.y) / 2
      d += ` Q ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} ${cx.toFixed(2)} ${cy.toFixed(2)}`
    }
    d += ` L ${pts[pts.length - 1].x.toFixed(2)} ${pts[pts.length - 1].y.toFixed(2)}`
    return d
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" role="img" aria-label="Audio waveform">
      <defs>
        <linearGradient id="barGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          {config.darkMode ? (
            <>
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#6366f1" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#334155" />
            </>
          )}
        </linearGradient>
        <linearGradient id="fillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          {config.darkMode ? (
            <>
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.05" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#475569" stopOpacity="0.05" />
            </>
          )}
        </linearGradient>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {!transparent && (<rect x="0" y="0" width={width} height={height} fill={bg} />)}
      {config.showGrid && (
        <g stroke={grid} strokeWidth={1} opacity={0.2}>
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={`v-${i}`} x1={(i * width) / 10} y1={0} x2={(i * width) / 10} y2={height} />
          ))}
          {Array.from({ length: 4 }).map((_, i) => (
            <line key={`h-${i}`} x1={0} y1={(i * height) / 4} x2={width} y2={(i * height) / 4} />
          ))}
        </g>
      )}
      {/* Elegant curved multi-line rendering */}
      <path d={buildCurvedPath(40, 0.75, 0)} fill="none" stroke="url(#barGrad)" strokeWidth={5} opacity={0.92} />
      <path d={buildCurvedPath(0, 0.6, Math.PI / 6)} fill="none" stroke="url(#barGrad)" strokeWidth={3.2} opacity={0.78} />
      <path d={buildCurvedPath(-40, 0.45, Math.PI / 3)} fill="none" stroke="url(#barGrad)" strokeWidth={2.6} opacity={0.6} />
      <path d={buildCurvedPath(-80, 0.3, Math.PI / 2)} fill="none" stroke="url(#barGrad)" strokeWidth={2.2} opacity={0.48} />
      <line x1={0} y1={mid} x2={width} y2={mid} stroke={stroke} strokeWidth={1} opacity={0.08} />
    </svg>
  )
}


