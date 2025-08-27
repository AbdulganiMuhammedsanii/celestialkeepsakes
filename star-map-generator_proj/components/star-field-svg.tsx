"use client"

import { useEffect, useMemo, useState } from "react"

interface StarFieldProps {
  config: {
    date: string
    time: string
    latitude: number
    longitude: number
    theme: string
    showConstellations: boolean
    showGrid: boolean
    showGraticule?: boolean
    showLabels: boolean
    darkMode: boolean
  }
  isGenerating: boolean
}

interface Star {
  x: number
  y: number
  magnitude: number
  name?: string
}

const generateStars = (config: StarFieldProps["config"], count = 800): Star[] => {
  const stars: Star[] = []
  for (let i = 0; i < count; i++) {
    const seed = (config.latitude + config.longitude + new Date(config.date).getTime()) * (i + 1)
    const r1 = (Math.sin(seed * 0.73) + 1) / 2
    const r2 = (Math.cos(seed * 0.91) + 1) / 2
    const r3 = (Math.sin(seed * 1.37) + 1) / 2

    const angle = r1 * Math.PI * 2
    const radius = Math.sqrt(r2) * 0.48
    const x = 0.5 + radius * Math.cos(angle)
    const y = 0.5 + radius * Math.sin(angle)

    stars.push({
      x: x * 1000,
      y: y * 1000,
      magnitude: 1 + r3 * 4,
      name:
        i < 14
          ? (
            [
              "SIRIUS",
              "VEGA",
              "ARCTURUS",
              "RIGEL",
              "PROCYON",
              "BETELGEUSE",
              "ALTAIR",
              "ALDEBARAN",
              "SPICA",
              "ANTARES",
              "POLLUX",
              "FOMALHAUT",
              "DENEB",
              "REGULUS",
            ] as const
          )[i]
          : undefined,
    })
  }
  return stars
}

export function StarFieldSVG({ config, isGenerating }: StarFieldProps) {
  const [seed, setSeed] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setSeed((s) => s + 1)
  }, [config])

  useEffect(() => {
    setMounted(true)
  }, [])

  const stars = useMemo(() => generateStars(config, 900), [config, seed])

  const size = 1000
  const center = size / 2
  const radius = center - 30

  const colors = config.darkMode
    ? {
      bg: "#0a0c16",
      fg: "#ffffff",
      mid: "#94a3b8",
      grid: "#334155",
      line: "#94a3b8",
      label: "#ffffff",
    }
    : {
      bg: "#0a0c16",
      fg: "#ffffff",
      mid: "#a3b8ff",
      grid: "#334155",
      line: "#9fb3ff",
      label: "#e2e8f0",
    }

  // Approximate Local Sidereal Time rotation (radians) for given date/time/longitude
  const raRotation = useMemo(() => {
    try {
      const date = new Date(`${config.date}T${config.time}:00`)
      const toJulian = (d: Date) => {
        const time = d.getTime() / 86400000 + 2440587.5
        return time
      }
      const JD = toJulian(date)
      const T = (JD - 2451545.0) / 36525.0
      let GMST = 280.46061837 + 360.98564736629 * (JD - 2451545.0) + 0.000387933 * T * T - (T * T * T) / 38710000
      GMST = ((GMST % 360) + 360) % 360
      let LST = GMST + config.longitude
      LST = ((LST % 360) + 360) % 360
      return (LST * Math.PI) / 180
    } catch {
      return 0
    }
  }, [config.date, config.time, config.longitude])

  if (!mounted) {
    // Avoid SSR rendering to prevent runtime errors; render minimal placeholder
    return (
      <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
        <circle cx={center} cy={center} r={radius} fill={config.darkMode ? "#0a0c16" : "#0a0c16"} />
        <circle cx={center} cy={center} r={radius} fill="none" stroke={config.darkMode ? "#ffffff" : "#e2e8f0"} strokeWidth={2} />
      </svg>
    )
  }


  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Star map"
    >
      <defs>
        <radialGradient id="poster-bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={config.darkMode ? "#0f1629" : "#0f1629"} />
          <stop offset="55%" stopColor={colors.bg} />
          <stop offset="100%" stopColor={colors.bg} />
        </radialGradient>
        <radialGradient id="vignette" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="#00000000" />
          <stop offset="100%" stopColor={config.darkMode ? "#00000014" : "#00000066"} />
        </radialGradient>
        <filter id="star-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="circle-clip">
          <circle cx={center} cy={center} r={radius} />
        </clipPath>
      </defs>

      <circle cx={center} cy={center} r={radius} fill="url(#poster-bg)" />
      <circle cx={center} cy={center} r={radius} fill="url(#vignette)" />

      {isGenerating ? (
        <g>
          <text x={center} y={center} textAnchor="middle" fill={colors.label} fontSize={28}>
            Calculating celestial positions...
          </text>
        </g>
      ) : (
        <g clipPath="url(#circle-clip)">
          {config.showGrid && (
            <g opacity={config.darkMode ? 0.25 : 0.4} stroke={colors.grid} strokeWidth={0.6}>
              {[1, 2, 3, 4].map((i) => (
                <circle key={i} cx={center} cy={center} r={(radius / 4) * i} fill="none" />
              ))}
              {Array.from({ length: 24 }).map((_, i) => {
                const a = (i * Math.PI) / 12
                const x = center + radius * Math.cos(a - Math.PI / 2)
                const y = center + radius * Math.sin(a - Math.PI / 2)
                return <line key={i} x1={center} y1={center} x2={x} y2={y} />
              })}
            </g>
          )}

          {/* Graticule: Right Ascension (RA) and Declination (Dec) */}
          {config.showGraticule && (
            <g>
              {/* Soft glow underlay */}
              <g stroke={config.darkMode ? "#c7d2fe" : "#6366f1"} strokeWidth={2.2} opacity={0.18}>
                {[15, 30, 45, 60].map((deg) => (
                  <circle key={`dec-glow-${deg}`} cx={center} cy={center} r={(radius * (90 - deg)) / 90} fill="none" />
                ))}
                {Array.from({ length: 24 }).map((_, i) => {
                  const a = (i * Math.PI) / 12 + raRotation
                  const x = center + radius * Math.cos(a - Math.PI / 2)
                  const y = center + radius * Math.sin(a - Math.PI / 2)
                  return <line key={`ra-glow-${i}`} x1={center} y1={center} x2={x} y2={y} />
                })}
              </g>
              {/* Main graticule */}
              <g stroke={config.darkMode ? "#c7d2fe" : "#475569"} strokeWidth={1.1} opacity={0.85}>
                {[15, 30, 45, 60].map((deg) => (
                  <circle key={`dec-${deg}`} cx={center} cy={center} r={(radius * (90 - deg)) / 90} fill="none" strokeDasharray="4 3" />
                ))}
                {Array.from({ length: 24 }).map((_, i) => {
                  const a = (i * Math.PI) / 12 + raRotation
                  const x = center + radius * Math.cos(a - Math.PI / 2)
                  const y = center + radius * Math.sin(a - Math.PI / 2)
                  return <line key={`ra-${i}`} x1={center} y1={center} x2={x} y2={y} strokeDasharray="7 4" />
                })}
              </g>
            </g>
          )}

          {/* Constellation lines */}
          {config.showConstellations && (
            <g stroke={config.darkMode ? "#c7d2fe" : colors.line} strokeWidth={1.3} opacity={config.darkMode ? 0.75 : 0.8}>
              {stars.slice(0, 70).map((s, i) => {
                const next = stars[i + 1]
                if (!next) return null
                const sx = center + (s.x - 500) * (radius / 500)
                const sy = center + (s.y - 500) * (radius / 500)
                const ex = center + (next.x - 500) * (radius / 500)
                const ey = center + (next.y - 500) * (radius / 500)
                const ds = Math.hypot(ex - sx, ey - sy)
                if (ds > radius * 0.25) return null
                return <line key={i} x1={sx} y1={sy} x2={ex} y2={ey} />
              })}
            </g>
          )}

          {/* Background micro-stars */}
          <g opacity={config.darkMode ? 0.85 : 0.9}>
            {Array.from({ length: 1400 }).map((_, idx) => {
              const a = (idx * 16807) % 360
              const rr = (idx * 48271) % 1000
              const angle = (a / 180) * Math.PI
              const rad = Math.sqrt(rr / 1000) * (radius - 10)
              const x = center + rad * Math.cos(angle)
              const y = center + rad * Math.sin(angle)
              const d = Math.hypot(x - center, y - center)
              if (d > radius - 6) return null
              const r = (idx % 7 === 0 ? 0.7 : 0.4)
              return <circle key={`bg-${idx}`} cx={x} cy={y} r={r} fill={colors.fg} opacity={idx % 9 === 0 ? 0.9 : 0.6} />
            })}
          </g>

          {/* Main Stars (no glow) */}
          <g>
            {stars.map((star, idx) => {
              const x = center + (star.x - 500) * (radius / 500)
              const y = center + (star.y - 500) * (radius / 500)
              const d = Math.hypot(x - center, y - center)
              if (d > radius - 8) return null

              const baseR = Math.max(0.35, (6 - star.magnitude) * 0.9)
              const bright = star.magnitude < 2.2

              const coreColor = config.darkMode ? "#ffffff" : bright ? "#ffffff" : "#dbeafe"

              return (
                <g key={idx}>
                  <circle cx={x} cy={y} r={baseR} fill={coreColor} />
                  {config.showLabels && star.name && star.magnitude < 2.5 && (
                    <text x={x} y={y - baseR - 8} fill={colors.label} fontSize={14} textAnchor="middle">
                      {star.name}
                    </text>
                  )}
                </g>
              )
            })}
          </g>
        </g>
      )}

      {/* Circle rim */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={config.darkMode ? "#ffffff" : "#e2e8f0"}
        strokeWidth={2}
      />
    </svg>
  )
}

export default StarFieldSVG
