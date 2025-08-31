"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { WaveformSVG } from "@/components/waveform-svg"
import { Download, RotateCcw, Moon, Sun, ShoppingCart } from "lucide-react"
import html2canvas from "html2canvas"

interface SoundConfig {
  date: string
  time: string
  customTitle: string
  customSubtitle: string
  titleFont?: "playfair" | "cormorant" | "greatVibes" | "parisienne"
  darkMode: boolean
  deepDark?: boolean
  showGrid?: boolean
  printSize?: "8x8" | "8x10" | "16x16" | "16x20"
  peaks: number[]
}

export function SoundWaveGenerator() {
  const [config, setConfig] = useState<SoundConfig>({
    date: new Date().toISOString().split("T")[0],
    time: "22:00",
    customTitle: "Now & Forever",
    customSubtitle: "YOUR VOICE, OUR POSTER",
    titleFont: "parisienne",
    darkMode: true,
    deepDark: false,
    showGrid: false,
    printSize: "8x8",
    peaks: [],
  })

  const [isDownloading, setIsDownloading] = useState(false)
  const [coupon, setCoupon] = useState("")
  const [couponStatus, setCouponStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle")
  const posterRef = useRef<HTMLDivElement>(null)

  const isSquare = config.printSize === "8x8" || config.printSize === "16x16"

  const colors = config.darkMode
    ? (config.deepDark
      ? { posterBg: "#0b1020", border: "#dbeafe", text: "#f8fafc", subtext: "#cbd5e1" }
      : { posterBg: "#1e293b", border: "#ffffff", text: "#ffffff", subtext: "#e2e8f0" })
    : { posterBg: "#f5f3f0", border: "#333", text: "#333", subtext: "#666" }

  const handleAudioUpload = async (file: File) => {
    const arrayBuf = await file.arrayBuffer()
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const audioBuf = await audioCtx.decodeAudioData(arrayBuf)
    const channel = audioBuf.getChannelData(0)
    // downsample to fixed bins
    const bins = 256
    const blockSize = Math.floor(channel.length / bins)
    const peaks: number[] = []
    for (let i = 0; i < bins; i++) {
      let sum = 0
      for (let j = 0; j < blockSize; j++) {
        const v = channel[i * blockSize + j] || 0
        sum += Math.abs(v)
      }
      peaks.push(Math.min(1, sum / blockSize * 4))
    }
    setConfig((p) => ({ ...p, peaks }))
  }

  const downloadPoster = async () => {
    if (!posterRef.current) return
    try {
      setIsDownloading(true)
      const longEdgePx = 3000
      const isSquare = config.printSize === "8x8" || config.printSize === "16x16"
      const exportWidth = isSquare ? longEdgePx : Math.round(longEdgePx * 0.8)
      const exportHeight = longEdgePx

      const original = posterRef.current
      const clone = original.cloneNode(true) as HTMLElement
      clone.style.position = "fixed"
      clone.style.left = "-10000px"
      clone.style.top = "0"
      clone.style.width = `${exportWidth}px`
      clone.style.height = `${exportHeight}px`
      clone.style.maxWidth = "none"
      clone.style.maxHeight = "none"
      clone.setAttribute("data-export", "pdf")
      clone.setAttribute("data-export-desktop", "true")
      document.body.appendChild(clone)

      const canvas = await html2canvas(clone, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: config.darkMode ? (config.deepDark ? "#0b1020" : "#1e293b") : "#f5f3f0",
        width: exportWidth,
        height: exportHeight,
        windowWidth: exportWidth,
        windowHeight: exportHeight,
        scrollX: 0,
        scrollY: 0,
      })

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `sound-poster-${config.date}-${config.printSize}.png`
          document.body.appendChild(a)
          a.click()
          a.remove()
          URL.revokeObjectURL(url)
        }
      }, "image/png", 1)
    } finally {
      try {
        const clones = document.querySelectorAll('[data-export="pdf"]')
        clones.forEach((n) => {
          if (n !== posterRef.current && n.parentElement) n.parentElement.removeChild(n)
        })
      } catch { }
      setIsDownloading(false)
    }
  }

  const configHash = (() => {
    const data = {
      date: config.date,
      time: config.time,
      customTitle: config.customTitle,
      customSubtitle: config.customSubtitle,
      titleFont: config.titleFont,
      darkMode: config.darkMode,
      deepDark: Boolean(config.deepDark),
      showGrid: Boolean(config.showGrid),
      printSize: config.printSize,
      peaks: config.peaks.slice(0, 8),
    }
    const json = JSON.stringify(data)
    let h = 0
    for (let i = 0; i < json.length; i++) h = (h * 31 + json.charCodeAt(i)) >>> 0
    return h.toString(16)
  })()

  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const paidQuery = params.get("paid") === "true"
    const hash = params.get("h")
    const handleAuto = async () => {
      if (!posterRef.current) return
      if (paidQuery && hash) {
        try {
          const stored = window.localStorage?.getItem(`ck_checkout_${hash}`)
          if (stored) {
            const parsed = JSON.parse(stored)
            setConfig((prev) => ({ ...prev, ...parsed }))
          }
        } catch { }
        await new Promise((r) => setTimeout(r, 500))
        await downloadPoster()
        try { window.localStorage?.removeItem(`ck_checkout_${hash}`) } catch { }
        const clean = new URL(window.location.href)
        clean.searchParams.delete("paid")
        clean.searchParams.delete("h")
        window.history.replaceState({}, "", clean.toString())
      }
    }
    handleAuto()
  }, [])

  const beginCheckout = async () => {
    if (couponStatus === "valid") {
      try {
        window.localStorage?.setItem(`ck_checkout_${configHash}`, JSON.stringify({ ...config }))
      } catch { }
      await new Promise((r) => setTimeout(r, 300))
      await downloadPoster()
      try { window.localStorage?.removeItem(`ck_checkout_${configHash}`) } catch { }
      return
    }
    try {
      window.localStorage?.setItem(`ck_checkout_${configHash}`, JSON.stringify({ ...config }))
    } catch { }
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ configHash, type: "sound" }),
    })
    const data = await res.json()
    if (res.ok) window.location.href = data.url
  }

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2 order-2 lg:order-1 flex flex-col gap-3 pr-2">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">Poster Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Upload Audio</Label>
              <Input type="file" accept="audio/*" onChange={(e) => e.target.files && e.target.files[0] && handleAudioUpload(e.target.files[0])} />
              <p className="text-xs text-muted-foreground">We visualize your audio as elegant sound waves.</p>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center gap-2">{config.darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />} Dark Mode</Label>
              <Switch checked={config.darkMode} onCheckedChange={(checked) => setConfig((p) => ({ ...p, darkMode: checked }))} />
            </div>
            {config.darkMode && (
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Deep Dark (sleek)</Label>
                <Switch checked={Boolean(config.deepDark)} onCheckedChange={(checked) => setConfig((p) => ({ ...p, deepDark: checked }))} />
              </div>
            )}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Grid</Label>
              <Switch checked={Boolean(config.showGrid)} onCheckedChange={(checked) => setConfig((p) => ({ ...p, showGrid: checked }))} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Print Size</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["8x8", "8x10", "16x16", "16x20"] as const).map((size) => (
                  <Button key={size} variant={config.printSize === size ? "default" : "outline"} size="sm" onClick={() => setConfig((p) => ({ ...p, printSize: size }))}>
                    {size}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium">Coupon</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter coupon code"
                  value={coupon}
                  onChange={(e) => { setCoupon(e.target.value); setCouponStatus("idle") }}
                  className="h-8 text-xs px-2"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (!coupon.trim()) return
                    setCouponStatus("checking")
                    try {
                      const res = await fetch("/api/validate-coupon", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: coupon.trim() }) })
                      const data = await res.json()
                      setCouponStatus(data?.valid ? "valid" : "invalid")
                    } catch { setCouponStatus("invalid") }
                  }}
                  disabled={couponStatus === "checking"}
                >
                  {couponStatus === "checking" ? "Checking..." : "Apply"}
                </Button>
              </div>
              {couponStatus === "valid" && (<div className="text-[10px] text-muted-foreground">Coupon applied. You can download without payment.</div>)}
              {couponStatus === "invalid" && (<div className="text-[10px] text-muted-foreground">Invalid coupon code.</div>)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">Custom Text</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label className="text-sm font-medium">Title (Script Text)</Label>
            <Input value={config.customTitle} onChange={(e) => setConfig((p) => ({ ...p, customTitle: e.target.value }))} placeholder="Now & Forever" className="h-11 text-[16px] md:h-8 md:text-xs" />
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Title Font</Label>
                <Select value={config.titleFont} onValueChange={(v: any) => setConfig((p) => ({ ...p, titleFont: v }))}>
                  <SelectTrigger className="h-11 text-[16px] md:h-8 md:text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="playfair">Playfair Display</SelectItem>
                    <SelectItem value="cormorant">Cormorant Garamond</SelectItem>
                    <SelectItem value="greatVibes">Great Vibes</SelectItem>
                    <SelectItem value="parisienne">Parisienne</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Input value={config.customSubtitle} onChange={(e) => setConfig((p) => ({ ...p, customSubtitle: e.target.value }))} placeholder="YOUR VOICE, OUR POSTER" className="h-11 text-[16px] md:h-8 md:text-xs" />
          </CardContent>
        </Card>

        <div className="order-[999] flex flex-wrap gap-3 justify-center lg:justify-start">
          <Button onClick={downloadPoster} disabled={isDownloading} variant="outline">
            {isDownloading ? (
              <>
                <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin mr-2" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download Poster
              </>
            )}
          </Button>
          <Button onClick={beginCheckout} className="w-full sm:w-auto px-5 py-2 shadow-lg">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Instant Checkout
          </Button>
        </div>
      </div>

      <div className="lg:col-span-3 order-1 lg:order-2">
        <div className="max-w-2xl mx-auto">
          <div
            ref={posterRef}
            className="relative shadow-2xl mx-auto w-full max-w-[88vw] overflow-hidden p-4 sm:p-6 md:p-10"
            style={{
              backgroundColor: colors.posterBg,
              border: `2px solid ${colors.border}`,
              aspectRatio: isSquare ? "1/1" : "4/5",
            }}
            data-aspect={isSquare ? "square" : "portrait"}
          >
            <div className="absolute inset-6 sm:inset-7 md:inset-8 border" style={{ borderColor: colors.border }} />
            <div className="absolute inset-8 sm:inset-9 md:inset-10 border opacity-60" style={{ borderColor: colors.border }} />

            <div className="flex justify-center items-end" style={{ height: isSquare ? "56%" : "60%" }}>
              <div
                className="relative w-[90%] sm:w-[88%] md:w-[86%] aspect-[7/4] rounded-full overflow-hidden"
                style={{ backgroundColor: "#000000", border: `1px solid ${colors.border}` }}
              >
                {/* Subtle star overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    opacity: 0.94,
                    backgroundImage:
                      `radial-gradient(circle at 12% 22%, rgba(255,255,255,0.25) 1px, transparent 1.6px),` +
                      `radial-gradient(circle at 28% 34%, rgba(255,255,255,0.18) 1px, transparent 1.8px),` +
                      `radial-gradient(circle at 45% 18%, rgba(255,255,255,0.2) 1.2px, transparent 1.8px),` +
                      `radial-gradient(circle at 62% 30%, rgba(255,255,255,0.22) 1px, transparent 1.6px),` +
                      `radial-gradient(circle at 78% 26%, rgba(255,255,255,0.18) 1.1px, transparent 1.7px),` +
                      `radial-gradient(circle at 16% 58%, rgba(255,255,255,0.2) 1px, transparent 1.6px),` +
                      `radial-gradient(circle at 34% 66%, rgba(255,255,255,0.22) 1.2px, transparent 1.8px),` +
                      `radial-gradient(circle at 52% 54%, rgba(255,255,255,0.18) 1px, transparent 1.6px),` +
                      `radial-gradient(circle at 70% 62%, rgba(255,255,255,0.2) 1.1px, transparent 1.7px),` +
                      `radial-gradient(circle at 86% 60%, rgba(255,255,255,0.18) 1px, transparent 1.6px),` +
                      `radial-gradient(circle at 24% 82%, rgba(255,255,255,0.2) 1.2px, transparent 1.8px),` +
                      `radial-gradient(circle at 44% 78%, rgba(255,255,255,0.22) 1px, transparent 1.6px),` +
                      `radial-gradient(circle at 64% 84%, rgba(255,255,255,0.18) 1.1px, transparent 1.7px),` +
                      `radial-gradient(circle at 82% 80%, rgba(255,255,255,0.22) 1px, transparent 1.6px)`
                  }}
                />
                <div className="absolute inset-0 p-2">
                  <WaveformSVG peaks={config.peaks} config={{ darkMode: config.darkMode, deepDark: config.deepDark, showGrid: false }} transparent />
                </div>
                {(config.peaks?.length || 0) === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white/80 text-[10px] sm:text-xs md:text-sm tracking-wider uppercase">
                      Add audio for sound waves
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 sm:mt-12 mb-14 sm:mb-10 px-3 flex flex-col items-center text-center" data-export-scope>
              <h2
                data-title
                className="order-1 mb-2 sm:mb-4 text-lg sm:text-3xl md:text-4xl mt-6 sm:mt-12 md:mt-16"
                style={{
                  fontFamily:
                    config.titleFont === "cormorant"
                      ? "var(--font-cormorant), serif"
                      : config.titleFont === "greatVibes"
                        ? "var(--font-great-vibes), cursive"
                        : config.titleFont === "parisienne"
                          ? "var(--font-parisienne), cursive"
                          : "var(--font-playfair-display), serif",
                  color: colors.text,
                  fontWeight: 500,
                  letterSpacing: "0.01em",
                  lineHeight: 1.1,
                }}
              >
                {config.customTitle}
              </h2>

              <p data-date className="order-2 text-[8px] sm:text-[10px] tracking-[0.1em] leading-tight" style={{ color: colors.subtext, marginTop: 0 }}>
                {(() => {
                  try {
                    const d = new Date(`${config.date}T00:00:00`)
                    return d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }).toUpperCase()
                  } catch {
                    return config.date
                  }
                })()}
              </p>

              <p data-subtitle className="order-3 text-[9px] sm:text-sm font-semibold tracking-[0.12em] sm:tracking-[0.2em] break-words" style={{ color: colors.text, marginTop: 6, marginBottom: 4 }}>
                {config.customSubtitle}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


