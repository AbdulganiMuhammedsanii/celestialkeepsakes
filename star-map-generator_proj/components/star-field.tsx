"use client"

import { useEffect, useRef, useState } from "react"

interface StarFieldProps {
  config: {
    date: string
    time: string
    latitude: number
    longitude: number
    theme: string
    showConstellations: boolean
    showGrid: boolean
    showLabels: boolean
    darkMode: boolean // Added darkMode to config interface
  }
  isGenerating: boolean
}

interface Star {
  x: number
  y: number
  magnitude: number
  name?: string
  constellation?: string
}

interface Constellation {
  name: string
  stars: number[]
  lines: [number, number][]
}

const generateStars = (config: StarFieldProps["config"]): Star[] => {
  const stars: Star[] = []
  const numStars = 200

  // Generate stars in circular distribution for poster aesthetic
  for (let i = 0; i < numStars; i++) {
    const seed = (config.latitude + config.longitude + new Date(config.date).getTime()) * (i + 1)
    const random1 = (Math.sin(seed) + 1) / 2
    const random2 = (Math.cos(seed * 1.1) + 1) / 2
    const random3 = (Math.sin(seed * 1.3) + 1) / 2
    const random4 = (Math.cos(seed * 1.7) + 1) / 2

    // Create circular distribution
    const angle = random1 * Math.PI * 2
    const radius = Math.sqrt(random2) * 0.45 // Keep within circular bounds

    const x = 0.5 + radius * Math.cos(angle)
    const y = 0.5 + radius * Math.sin(angle)

    stars.push({
      x: x * 100,
      y: y * 100,
      magnitude: 1 + random3 * 4,
      name:
        i < 15
          ? `${["Sirius", "Vega", "Arcturus", "Rigel", "Procyon", "Betelgeuse", "Altair", "Aldebaran", "Spica", "Antares", "Pollux", "Fomalhaut", "Deneb", "Regulus", "Capella"][i]}`
          : undefined,
    })
  }

  return stars
}

const constellations: Constellation[] = [
  {
    name: "Ursa Major",
    stars: [0, 1, 2, 3, 4, 5, 6],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 0],
    ],
  },
  {
    name: "Orion",
    stars: [10, 11, 12, 13, 14, 15, 16],
    lines: [
      [10, 11],
      [11, 12],
      [12, 13],
      [13, 14],
      [14, 15],
      [15, 16],
    ],
  },
  {
    name: "Cassiopeia",
    stars: [20, 21, 22, 23, 24],
    lines: [
      [20, 21],
      [21, 22],
      [22, 23],
      [23, 24],
    ],
  },
  {
    name: "Leo",
    stars: [30, 31, 32, 33, 34],
    lines: [
      [30, 31],
      [31, 32],
      [32, 33],
      [33, 34],
    ],
  },
  {
    name: "Cygnus",
    stars: [40, 41, 42, 43, 44],
    lines: [
      [40, 41],
      [41, 42],
      [42, 43],
      [43, 44],
    ],
  },
]

export function StarField({ config, isGenerating }: StarFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stars, setStars] = useState<Star[]>([])

  useEffect(() => {
    setStars(generateStars(config))
  }, [config])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const size = Math.min(rect.width, rect.height)
    canvas.width = size * window.devicePixelRatio
    canvas.height = size * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = size
    const height = size
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 2 - 20

    ctx.clearRect(0, 0, width, height)

    ctx.save()
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.clip()

    const bgColor = config.darkMode ? "#ffffff" : "#1a1f2e"
    ctx.fillStyle = bgColor
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.fill()

    if (isGenerating) {
      ctx.fillStyle = config.darkMode ? "#666666" : "#666666"
      ctx.font = "14px system-ui"
      ctx.textAlign = "center"
      ctx.fillText("Calculating celestial positions...", centerX, centerY)
      ctx.restore()
      return
    }

    if (config.showGrid) {
      const gridColor = config.darkMode ? "rgba(30, 41, 59, 0.4)" : "rgba(255, 255, 255, 0.3)"
      ctx.strokeStyle = gridColor
      ctx.lineWidth = 0.5
      ctx.setLineDash([2, 2])

      // Concentric circles
      for (let i = 1; i <= 4; i++) {
        const r = (radius / 4) * i
        ctx.beginPath()
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Radial lines (like clock positions)
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.lineTo(centerX + radius * Math.cos(angle - Math.PI / 2), centerY + radius * Math.sin(angle - Math.PI / 2))
        ctx.stroke()
      }
      ctx.setLineDash([])
    }

    if (config.showConstellations) {
      const lineColor = config.darkMode ? "#1e293b" : "#ffffff"
      ctx.strokeStyle = lineColor
      ctx.lineWidth = 1
      ctx.globalAlpha = 0.8

      constellations.forEach((constellation) => {
        constellation.lines.forEach(([startIdx, endIdx]) => {
          const startStar = stars[startIdx]
          const endStar = stars[endIdx]

          if (startStar && endStar) {
            const startX = centerX + (startStar.x - 50) * (radius / 50)
            const startY = centerY + (startStar.y - 50) * (radius / 50)
            const endX = centerX + (endStar.x - 50) * (radius / 50)
            const endY = centerY + (endStar.y - 50) * (radius / 50)

            ctx.beginPath()
            ctx.moveTo(startX, startY)
            ctx.lineTo(endX, endY)
            ctx.stroke()
          }
        })
      })
      ctx.globalAlpha = 1
    }

    stars.forEach((star, index) => {
      const x = centerX + (star.x - 50) * (radius / 50)
      const y = centerY + (star.y - 50) * (radius / 50)

      // Check if star is within circular bounds
      const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
      if (distFromCenter > radius - 10) return

      // Create realistic star sizes based on magnitude
      const baseRadius = Math.max(0.5, (6 - star.magnitude) * 1.2)
      const glowRadius = baseRadius * 3

      // Add subtle twinkling effect
      const twinkle = Math.sin(Date.now() * 0.001 + index * 0.1) * 0.2 + 1
      const finalRadius = baseRadius * twinkle

      if (config.darkMode) {
        // Dark mode: dark stars on white background with subtle glow
        const starColor = star.magnitude < 2 ? "#0f172a" : star.magnitude < 3.5 ? "#1e293b" : "#334155"

        // Subtle glow effect for bright stars
        if (star.magnitude < 3) {
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius)
          gradient.addColorStop(0, starColor)
          gradient.addColorStop(0.3, `${starColor}40`)
          gradient.addColorStop(1, `${starColor}00`)
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(x, y, glowRadius, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.fillStyle = starColor
      } else {
        // Light mode: brilliant white stars with beautiful glow
        const brightness = star.magnitude < 2 ? 1 : star.magnitude < 3.5 ? 0.9 : 0.7
        const starColor = `rgba(255, 255, 255, ${brightness})`

        // Beautiful glow effect for all stars
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius)
        gradient.addColorStop(0, starColor)
        gradient.addColorStop(0.2, `rgba(255, 255, 255, ${brightness * 0.6})`)
        gradient.addColorStop(0.5, `rgba(255, 255, 255, ${brightness * 0.3})`)
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)")

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x, y, glowRadius, 0, Math.PI * 2)
        ctx.fill()

        // Core star
        ctx.fillStyle = starColor
      }

      // Draw the main star body
      ctx.beginPath()
      ctx.arc(x, y, finalRadius, 0, Math.PI * 2)
      ctx.fill()

      // Add cross-shaped diffraction spikes for brightest stars
      if (star.magnitude < 2.5 && !config.darkMode) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 * twinkle})`
        ctx.lineWidth = 0.8
        ctx.lineCap = "round"

        const spikeLength = finalRadius * 4

        // Vertical spike
        ctx.beginPath()
        ctx.moveTo(x, y - spikeLength)
        ctx.lineTo(x, y + spikeLength)
        ctx.stroke()

        // Horizontal spike
        ctx.beginPath()
        ctx.moveTo(x - spikeLength, y)
        ctx.lineTo(x + spikeLength, y)
        ctx.stroke()
      }

      if (config.showLabels && star.name && star.magnitude < 2.5) {
        ctx.fillStyle = config.darkMode ? "#1e293b" : "#ffffff"
        ctx.font = "9px system-ui"
        ctx.textAlign = "center"
        ctx.fillText(star.name, x, y - finalRadius - 8)
      }
    })

    if (config.showConstellations && config.showLabels) {
      ctx.fillStyle = config.darkMode ? "#1e293b" : "#ffffff"
      ctx.font = "11px system-ui"
      ctx.textAlign = "center"

      constellations.forEach((constellation) => {
        if (constellation.stars.length > 0) {
          const centerStar = stars[constellation.stars[Math.floor(constellation.stars.length / 2)]]
          if (centerStar) {
            const x = centerX + (centerStar.x - 50) * (radius / 50)
            const y = centerY + (centerStar.y - 50) * (radius / 50)

            const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
            if (distFromCenter < radius - 30) {
              ctx.fillText(constellation.name, x, y - 15)
            }
          }
        }
      })
    }

    ctx.restore()
  }, [stars, config, isGenerating])

  return (
    <div className="w-full h-full relative">
      <canvas ref={canvasRef} className="w-full h-full" style={{ aspectRatio: "1/1" }} />
    </div>
  )
}
