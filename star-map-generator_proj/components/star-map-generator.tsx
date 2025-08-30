"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { StarFieldSVG } from "@/components/star-field-svg"
import html2canvas from "html2canvas"
import { AuthButton } from "@/components/auth-button"
import { MapPin, Calendar, Palette, Download, RotateCcw, Moon, Sun, Save, ShoppingCart } from "lucide-react"

interface StarMapConfig {
  date: string
  time: string
  city: string
  latitude: number
  longitude: number
  theme: "classic" | "modern" | "vintage" | "minimal"
  showConstellations: boolean
  showGrid: boolean
  showGraticule?: boolean
  showLabels: boolean
  customTitle: string
  customSubtitle: string
  titleFont?: "playfair" | "cormorant" | "greatVibes" | "parisienne"
  darkMode: boolean // Added dark mode option
  printSize?: "8x8" | "8x10" | "16x16" | "16x20"
}

const themes = {
  classic: { name: "Classic", description: "Traditional star chart style" },
  modern: { name: "Modern", description: "Clean contemporary design" },
  vintage: { name: "Vintage", description: "Antique celestial map style" },
  minimal: { name: "Minimal", description: "Simple and elegant" },
}

const majorCities = [
  { name: "New York", lat: 40.7128, lng: -74.006 },
  { name: "London", lat: 51.5074, lng: -0.1278 },
  { name: "Tokyo", lat: 35.6762, lng: 139.6503 },
  { name: "Sydney", lat: -33.8688, lng: 151.2093 },
  { name: "Paris", lat: 48.8566, lng: 2.3522 },
  { name: "Los Angeles", lat: 34.0522, lng: -118.2437 },
  { name: "Cairo", lat: 30.0444, lng: 31.2357 },
  { name: "Mumbai", lat: 19.076, lng: 72.8777 },
]

export function StarMapGenerator() {
  const enablePersistence = false
  const [config, setConfig] = useState<StarMapConfig>({
    date: new Date().toISOString().split("T")[0],
    time: "22:00",
    city: "New York",
    latitude: 40.7128,
    longitude: -74.006,
    theme: "classic",
    showConstellations: true,
    showGrid: false,
    showGraticule: true,
    showLabels: true,
    customTitle: "Now & Forever",
    customSubtitle: "PHILIPPE & MARIE",
    titleFont: "parisienne",
    darkMode: true, // Default to dark mode in the design box
    printSize: "8x8",
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [savedMaps, setSavedMaps] = useState<any[]>([])
  const [currentMapId, setCurrentMapId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const posterRef = useRef<HTMLDivElement>(null)
  const [hasPaid, setHasPaid] = useState(false)
  const [paidHash, setPaidHash] = useState<string | null>(null)
  const [coupon, setCoupon] = useState("")
  const [couponStatus, setCouponStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle")

  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const paidQuery = params.get("paid") === "true"
    const successPath = window.location.pathname.startsWith("/checkout/success")
    const hash = params.get("h")
    if (paidQuery || successPath) {
      setHasPaid(true)
      if (hash) setPaidHash(hash)
    }
    // If we came back paid and hash matches current, auto-download once
    const handleAuto = async () => {
      if (!posterRef.current) return
      if ((paidQuery || successPath) && hash) {
        try {
          // Try to restore the exact config used at checkout from localStorage
          const stored = window.localStorage?.getItem(`ck_checkout_${hash}`)
          if (stored) {
            const parsed = JSON.parse(stored)
            setConfig((prev) => ({ ...prev, ...parsed }))
          }
        } catch { }
        // allow state to apply and poster to render
        await new Promise((r) => setTimeout(r, 500))
        await downloadPoster()
        try {
          window.localStorage?.removeItem(`ck_checkout_${hash}`)
        } catch { }
        // Clean query to avoid re-downloading on refresh
        const clean = new URL(window.location.href)
        clean.searchParams.delete("paid")
        clean.searchParams.delete("h")
        window.history.replaceState({}, "", clean.toString())
      }
    }
    handleAuto()
  }, [])

  useEffect(() => {
    if (enablePersistence) {
      loadSavedMaps()
    }
  }, [])

  const loadSavedMaps = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/star-maps")
      if (response.ok) {
        const maps = await response.json()
        setSavedMaps(maps)
      }
    } catch (error) {
      console.error("Failed to load saved maps:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveCurrentMap = async () => {
    try {
      setIsSaving(true)
      const starMapData = {
        title: config.customTitle,
        subtitle: config.customSubtitle,
        date: config.date,
        location: config.city,
        latitude: config.latitude,
        longitude: config.longitude,
        theme: config.theme,
        show_constellations: config.showConstellations,
        show_grid: config.showGrid,
      }

      const response = currentMapId
        ? await fetch(`/api/star-maps/${currentMapId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(starMapData),
        })
        : await fetch("/api/star-maps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(starMapData),
        })

      if (response.ok) {
        const savedMap = await response.json()
        setCurrentMapId(savedMap.id)
        await loadSavedMaps()
      }
    } catch (error) {
      console.error("Failed to save star map:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const loadMap = (map: any) => {
    setConfig({
      date: map.date,
      time: config.time, // Keep current time
      city: map.location,
      latitude: map.latitude,
      longitude: map.longitude,
      theme: map.theme,
      showConstellations: map.show_constellations,
      showGrid: map.show_grid,
      showLabels: config.showLabels, // Keep current labels setting
      customTitle: map.title,
      customSubtitle: map.subtitle || "",
      darkMode: config.darkMode, // Keep current dark mode
    })
    setCurrentMapId(map.id)
  }

  // City search state
  const [cityQuery, setCityQuery] = useState("")
  const [cityResults, setCityResults] = useState<any[]>([])
  const [isSearchingCities, setIsSearchingCities] = useState(false)
  const citySearchAbortRef = useRef<AbortController | null>(null)

  // Debounced city search
  useEffect(() => {
    const q = cityQuery.trim()
    if (!q || q.length < 2) {
      setCityResults([])
      return
    }
    const handle = setTimeout(async () => {
      try {
        setIsSearchingCities(true)
        if (citySearchAbortRef.current) citySearchAbortRef.current.abort()
        const ctrl = new AbortController()
        citySearchAbortRef.current = ctrl
        const res = await fetch(`/api/cities?q=${encodeURIComponent(q)}&limit=20`, { signal: ctrl.signal })
        if (!res.ok) return
        const data = await res.json()
        setCityResults(Array.isArray(data.results) ? data.results : [])
      } catch (e) {
        // ignore abort errors
      } finally {
        setIsSearchingCities(false)
      }
    }, 300)
    return () => clearTimeout(handle)
  }, [cityQuery])

  const handleCitySelect = (result: any) => {
    setConfig((prev) => ({
      ...prev,
      city: result.concise_name || result.name || result.display_name,
      latitude: Number(result.lat),
      longitude: Number(result.lon),
    }))
    setCityQuery("")
    setCityResults([])
  }

  const generateStarMap = async () => {
    setIsGenerating(true)
    // Simulate generation time
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsGenerating(false)
  }

  const resetToDefaults = () => {
    setConfig({
      date: new Date().toISOString().split("T")[0],
      time: "22:00",
      city: "New York",
      latitude: 40.7128,
      longitude: -74.006,
      theme: "classic",
      showConstellations: true,
      showGrid: false,
      showGraticule: true,
      showLabels: true,
      customTitle: "Now & Forever",
      customSubtitle: "PHILIPPE & MARIE",
      titleFont: "parisienne",
      darkMode: true, // Default to dark mode on reset
      printSize: "8x8",
    })
    setCurrentMapId(null)
  }

  const configHash = (() => {
    const data = {
      date: config.date,
      time: config.time,
      city: config.city,
      latitude: config.latitude,
      longitude: config.longitude,
      theme: config.theme,
      showConstellations: config.showConstellations,
      showGrid: config.showGrid,
      showLabels: config.showLabels,
      title: config.customTitle,
      subtitle: config.customSubtitle,
      darkMode: config.darkMode,
      printSize: config.printSize,
    }
    const json = JSON.stringify(data)
    let h = 0
    for (let i = 0; i < json.length; i++) h = (h * 31 + json.charCodeAt(i)) >>> 0
    return h.toString(16)
  })()

  const beginCheckout = async () => {
    if (couponStatus === "valid") {
      // Skip payment if coupon is valid; set paid and auto-download
      try {
        // Persist current config (same flow used after stripe success)
        window.localStorage?.setItem(
          `ck_checkout_${configHash}`,
          JSON.stringify({
            date: config.date,
            time: config.time,
            city: config.city,
            latitude: config.latitude,
            longitude: config.longitude,
            theme: config.theme,
            showConstellations: config.showConstellations,
            showGrid: config.showGrid,
            showGraticule: config.showGraticule,
            showLabels: config.showLabels,
            customTitle: config.customTitle,
            customSubtitle: config.customSubtitle,
            titleFont: config.titleFont,
            darkMode: config.darkMode,
            printSize: config.printSize,
          }),
        )
      } catch { }
      setHasPaid(true)
      setPaidHash(configHash)
      // allow UI update and render then download
      await new Promise((r) => setTimeout(r, 300))
      await downloadPoster()
      try { window.localStorage?.removeItem(`ck_checkout_${configHash}`) } catch { }
      return
    }

    try {
      // persist current config so we can restore for auto-download after returning
      window.localStorage?.setItem(`ck_checkout_${configHash}`,
        JSON.stringify({
          date: config.date,
          time: config.time,
          city: config.city,
          latitude: config.latitude,
          longitude: config.longitude,
          theme: config.theme,
          showConstellations: config.showConstellations,
          showGrid: config.showGrid,
          showGraticule: config.showGraticule,
          showLabels: config.showLabels,
          customTitle: config.customTitle,
          customSubtitle: config.customSubtitle,
          titleFont: config.titleFont,
          darkMode: config.darkMode,
          printSize: config.printSize,
        })
      )
    } catch { }

    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ configHash }),
    })
    const data = await res.json()
    if (res.ok) {
      window.location.href = data.url
    }
  }

  const downloadPoster = async () => {
    if (!posterRef.current) return

    try {
      setIsDownloading(true)
      // Decide target export dimensions based on aspect ratio (device-independent quality)
      const isSquare = config.printSize === "8x8" || config.printSize === "16x16"
      const longEdgePx = 3000
      const exportWidth = isSquare ? longEdgePx : Math.round(longEdgePx * 0.8) // 4:5 → width 80% of height
      const exportHeight = longEdgePx

      // Create an offscreen clone sized to the export pixel dimensions for crisp output
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

      // Render the offscreen high-DPI clone without relying on viewport size
      const canvas = await html2canvas(clone, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: config.darkMode ? "#1e293b" : "#f5f3f0",
        width: exportWidth,
        height: exportHeight,
        windowWidth: exportWidth,
        windowHeight: exportHeight,
        scrollX: 0,
        scrollY: 0,
      })

      // Convert to blob and download
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            const sizeLabel = isSquare ? (config.printSize || "square") : (config.printSize || "4x5")
            link.download = `star-map-${config.customTitle.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${config.date}-${sizeLabel}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
          }
        },
        "image/png",
        1.0,
      )
    } catch (error) {
      console.error("Failed to download poster:", error)
    } finally {
      // Clean up any offscreen clones and export flags
      try {
        const clones = document.querySelectorAll('[data-export="pdf"]')
        clones.forEach((n) => {
          if (n !== posterRef.current && n.parentElement) n.parentElement.removeChild(n)
        })
      } catch { }
      setIsDownloading(false)
    }
  }

  const colors = config.darkMode
    ? {
      background: "#1e293b", // navy background
      posterBg: "#1e293b",
      border: "#ffffff",
      text: "#ffffff",
      subtext: "#e2e8f0",
      cardBg: "#334155",
      cardBorder: "#475569",
    }
    : {
      background: "#f5f3f0", // cream background
      posterBg: "#f5f3f0",
      border: "#333",
      text: "#333",
      subtext: "#666",
      cardBg: "#ffffff",
      cardBorder: "#d4d0c8",
    }

  // Editor UI colors (do not change with poster darkMode)
  const ui = {
    text: "var(--color-foreground)",
    muted: "var(--color-muted-foreground)",
    cardBg: "var(--color-card)",
    cardBorder: "var(--color-border)",
    inputBg: "var(--color-input)",
  }

  const isSquare = config.printSize === "8x8" || config.printSize === "16x16"

  return (
    <div className="min-h-screen">
      <header className="border-b" style={{ borderColor: ui.cardBorder }}>
        <div className="container mx-auto px-4 sm:py-8 py-6 pt-[max(env(safe-area-inset-top),1rem)]">
          <div className="flex justify-between items-start mb-6">
            <div></div>
            <AuthButton />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">
              Celestial Star Map
            </h1>
            <p className="text-base text-muted-foreground">
              Create Beautiful Astronomical Posters
            </p>
            <p className="text-xs max-w-2xl mx-auto text-muted-foreground">
              Generate personalized circular star maps showing the exact night sky from any location and date
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Controls Panel (mobile after poster) */}
          <div className="lg:col-span-2 order-2 lg:order-1 flex flex-col gap-3 pr-2">
            {enablePersistence && (
              <Card style={{ backgroundColor: ui.cardBg, borderColor: ui.cardBorder }}>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base" style={{ color: ui.text }}>
                    <Save className="w-4 h-4" style={{ color: ui.muted }} />
                    Save & Load
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={saveCurrentMap}
                    disabled={isSaving}
                    className="w-full"

                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {currentMapId ? "Update" : "Save"} Map
                      </>
                    )}
                  </Button>

                  {savedMaps.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium" style={{ color: ui.text }}>
                        Saved Maps
                      </Label>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {savedMaps.map((map) => (
                          <button
                            key={map.id}
                            onClick={() => loadMap(map)}
                            className="w-full text-left p-2 rounded text-xs hover:opacity-80 transition-opacity"
                            style={{
                              backgroundColor: currentMapId === map.id ? ui.text : ui.cardBorder,
                              color: currentMapId === map.id ? '#ffffff' : ui.text,
                            }}
                          >
                            <div className="font-medium truncate">{map.title}</div>
                            <div className="opacity-70 truncate">
                              {map.location} • {new Date(map.date).toLocaleDateString()}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Coupon */}
            <Card className="order-[998]" style={{ backgroundColor: ui.cardBg, borderColor: ui.cardBorder }}>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base" style={{ color: ui.text }}>
                  Coupon
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={coupon}
                    onChange={(e) => {
                      setCoupon(e.target.value)
                      setCouponStatus("idle")
                    }}
                    className="h-8 text-xs px-2"
                    style={{ borderColor: ui.cardBorder, backgroundColor: ui.inputBg, color: ui.text }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (!coupon.trim()) return
                      setCouponStatus("checking")
                      try {
                        const res = await fetch("/api/validate-coupon", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ code: coupon.trim() }),
                        })
                        const data = await res.json()
                        setCouponStatus(data?.valid ? "valid" : "invalid")
                      } catch {
                        setCouponStatus("invalid")
                      }
                    }}
                    disabled={couponStatus === "checking"}
                    style={{ borderColor: ui.cardBorder, color: ui.text }}
                  >
                    {couponStatus === "checking" ? "Checking..." : "Apply"}
                  </Button>
                </div>
                {couponStatus === "valid" && (
                  <div className="text-[10px]" style={{ color: ui.muted }}>Coupon applied. You can download without payment.</div>
                )}
                {couponStatus === "invalid" && (
                  <div className="text-[10px]" style={{ color: ui.muted }}>Invalid coupon code.</div>
                )}
              </CardContent>
            </Card>

            {/* Checkout / Download Buttons (bottom of controls after all fields and coupon) */}
            <div className="order-[999] flex flex-wrap gap-3 justify-center lg:justify-start">
              {hasPaid && paidHash === configHash ? (
                <Button
                  onClick={downloadPoster}
                  disabled={isDownloading}
                  variant="outline"

                >
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
              ) : (
                <>
                  <Button onClick={beginCheckout} className="w-full sm:w-auto px-5 py-2 shadow-lg">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {couponStatus === "valid" ? "Download (Coupon)" : "Instant Checkout ($6.99)"}
                  </Button>
                  {/* Physical print order button */}
                  <Button
                    onClick={async () => {
                      const size = config.printSize || "8x8"
                      const res = await fetch("/api/create-print-checkout-session", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ configHash, printSize: size }),
                      })
                      const data = await res.json()
                      if (res.ok) {
                        window.location.href = data.url
                      }
                    }}
                    className="w-full sm:w-auto px-5 py-2 btn-gradient shadow-lg"
                  >
                    Order Print ({(config.printSize === "8x8" || config.printSize === "8x10") ? "$19.99" : "$29.99"})
                  </Button>
                  {/* Add to Cart for print */}
                  <Button
                    variant="outline"
                    onClick={() => {
                      try {
                        const size = config.printSize || "8x8"
                        const price = (size === "8x8" || size === "8x10") ? 1999 : 2999
                        const cart = { print: { size, price } }
                        window.localStorage?.setItem("ck_cart", JSON.stringify(cart))
                        window.localStorage?.setItem(
                          `ck_checkout_${configHash}`,
                          JSON.stringify({
                            date: config.date,
                            time: config.time,
                            city: config.city,
                            latitude: config.latitude,
                            longitude: config.longitude,
                            theme: config.theme,
                            showConstellations: config.showConstellations,
                            showGrid: config.showGrid,
                            showGraticule: config.showGraticule,
                            showLabels: config.showLabels,
                            customTitle: config.customTitle,
                            customSubtitle: config.customSubtitle,
                            titleFont: config.titleFont,
                            darkMode: config.darkMode,
                            printSize: size,
                          }),
                        )
                        window.location.href = `/checkout?h=${configHash}&size=${encodeURIComponent(size)}`
                      } catch { }
                    }}
                    className="w-full sm:w-auto"
                  >
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add Print to Cart
                    </>
                  </Button>
                </>
              )}
            </div>

            {/* (No checkout buttons here; kept at bottom under poster) */}

            <Card style={{ backgroundColor: ui.cardBg, borderColor: ui.cardBorder }}>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base" style={{ color: ui.text }}>
                  Custom Text
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="customTitle" className="text-sm font-medium" style={{ color: ui.text }}>
                    Title (Script Text)
                  </Label>
                  <Input
                    id="customTitle"
                    value={config.customTitle}
                    onChange={(e) => setConfig((prev) => ({ ...prev, customTitle: e.target.value }))}
                    style={{ borderColor: ui.cardBorder, backgroundColor: ui.inputBg, color: ui.text }}
                    placeholder="Now & Forever"
                    className="h-11 text-[16px] md:h-8 md:text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium" style={{ color: ui.text }}>
                        Title Font
                      </Label>
                      <Select value={config.titleFont} onValueChange={(value: any) => setConfig((p) => ({ ...p, titleFont: value }))}>
                        <SelectTrigger className="h-11 text-[16px] md:h-8 md:text-xs" style={{ borderColor: ui.cardBorder, backgroundColor: ui.inputBg, color: ui.text }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="playfair">Playfair Display</SelectItem>
                          <SelectItem value="cormorant">Cormorant Garamond</SelectItem>
                          <SelectItem value="greatVibes">Great Vibes</SelectItem>
                          <SelectItem value="parisienne">Parisienne</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Input
                    id="customSubtitle"
                    value={config.customSubtitle}
                    onChange={(e) => setConfig((prev) => ({ ...prev, customSubtitle: e.target.value }))}
                    style={{ borderColor: ui.cardBorder, backgroundColor: ui.inputBg, color: ui.text }}
                    placeholder="PHILIPPE & MARIE"
                    className="h-11 text-[16px] md:h-8 md:text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium" style={{ color: ui.text }}>Quick Presets</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => setConfig((p) => ({ ...p, darkMode: true, showConstellations: true, showGrid: false }))}>Night Sky</Button>
                      <Button size="sm" variant="outline" onClick={() => setConfig((p) => ({ ...p, darkMode: false, showConstellations: false, showGrid: false }))}>Minimal</Button>
                      <Button size="sm" variant="outline" onClick={() => setConfig((p) => ({ ...p, showLabels: !p.showLabels }))}>{config.showLabels ? "Hide Labels" : "Show Labels"}</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Date & Time */}
            <Card style={{ backgroundColor: ui.cardBg, borderColor: ui.cardBorder }}>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base" style={{ color: ui.text }}>
                  <Calendar className="w-4 h-4" style={{ color: ui.muted }} />
                  Date & Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-medium" style={{ color: ui.text }}>
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={config.date}
                    onChange={(e) => setConfig((prev) => ({ ...prev, date: e.target.value }))}
                    style={{ borderColor: ui.cardBorder, backgroundColor: ui.inputBg, color: ui.text }}
                    className="h-11 text-[16px] md:h-8 md:text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="text-sm font-medium" style={{ color: ui.text }}>
                    Time
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={config.time}
                    onChange={(e) => setConfig((prev) => ({ ...prev, time: e.target.value }))}
                    style={{ borderColor: ui.cardBorder, backgroundColor: ui.inputBg, color: ui.text }}
                    className="h-11 text-[16px] md:h-8 md:text-xs"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card style={{ backgroundColor: ui.cardBg, borderColor: ui.cardBorder }}>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base" style={{ color: ui.text }}>
                  <MapPin className="w-4 h-4" style={{ color: ui.muted }} />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <Label className="text-sm font-medium" style={{ color: ui.text }}>
                    City
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Search city..."
                      value={cityQuery}
                      onChange={(e) => setCityQuery(e.target.value)}
                      style={{ borderColor: ui.cardBorder, backgroundColor: ui.inputBg, color: ui.text }}
                      className="h-11 text-[16px] md:h-8 md:text-xs"
                    />
                    {cityQuery && (
                      <div
                        className="absolute z-20 mt-1 w-full max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md"
                        style={{ borderColor: ui.cardBorder, backgroundColor: ui.cardBg, color: ui.text }}
                      >
                        {isSearchingCities ? (
                          <div className="p-2 text-xs opacity-70">Searching...</div>
                        ) : cityResults.length === 0 ? (
                          <div className="p-2 text-xs opacity-70">No results</div>
                        ) : (
                          cityResults.map((r) => (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => handleCitySelect(r)}
                              className="w-full text-left px-3 py-2 text-xs hover:opacity-80"
                              style={{ color: ui.text }}
                            >
                              {r.concise_name}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-xs opacity-70" style={{ color: ui.muted }}>
                    Selected: {config.city} ({config.latitude.toFixed(4)}, {config.longitude.toFixed(4)})
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="latitude" className="text-xs font-medium" style={{ color: ui.text }}>
                      Latitude
                    </Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="0.0001"
                      value={config.latitude}
                      onChange={(e) => setConfig((prev) => ({ ...prev, latitude: Number.parseFloat(e.target.value) }))}
                      style={{ borderColor: ui.cardBorder, backgroundColor: ui.inputBg, color: ui.text }}
                      className="text-[16px] h-11 md:text-xs md:h-8"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude" className="text-xs font-medium" style={{ color: ui.text }}>
                      Longitude
                    </Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="0.0001"
                      value={config.longitude}
                      onChange={(e) => setConfig((prev) => ({ ...prev, longitude: Number.parseFloat(e.target.value) }))}
                      style={{ borderColor: ui.cardBorder, backgroundColor: ui.inputBg, color: ui.text }}
                      className="text-[16px] h-11 md:text-xs md:h-8"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>


            {/* Theme & Options */}
            <Card style={{ backgroundColor: ui.cardBg, borderColor: ui.cardBorder }}>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base" style={{ color: ui.text }}>
                  <Palette className="w-4 h-4" style={{ color: ui.muted }} />
                  Poster Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="darkMode"
                      className="text-sm font-medium flex items-center gap-2"
                      style={{ color: ui.text }}
                    >
                      {config.darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                      Dark Mode
                    </Label>
                    <Switch
                      id="darkMode"
                      checked={config.darkMode}
                      onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, darkMode: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="constellations" className="text-sm font-medium" style={{ color: ui.text }}>
                      Constellations
                    </Label>
                    <Switch
                      id="constellations"
                      checked={config.showConstellations}
                      onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, showConstellations: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="grid" className="text-sm font-medium" style={{ color: ui.text }}>
                      Coordinate Grid
                    </Label>
                    <Switch
                      id="grid"
                      checked={config.showGrid}
                      onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, showGrid: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="graticule" className="text-sm font-medium" style={{ color: ui.text }}>
                      Graticule (RA/Dec)
                    </Label>
                    <Switch
                      id="graticule"
                      checked={Boolean(config.showGraticule)}
                      onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, showGraticule: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="labels" className="text-sm font-medium" style={{ color: ui.text }}>
                      Star Names
                    </Label>
                    <Switch
                      id="labels"
                      checked={config.showLabels}
                      onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, showLabels: checked }))}
                    />
                  </div>
                  {/* Print Size / Aspect Ratio */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium" style={{ color: ui.text }}>
                      Print Size
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["8x8", "8x10", "16x16", "16x20"] as const).map((size) => (
                        <Button
                          key={size}
                          variant={config.printSize === size ? "default" : "outline"}
                          size="sm"
                          onClick={() => setConfig((p) => ({ ...p, printSize: size }))}
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">Squares preview as 1:1; rectangles preview as 4:5.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <div className="space-y-3">
              <Button
                onClick={generateStarMap}
                disabled={isGenerating}
                className="w-full h-11 text-sm"

                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>Generate Poster</>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetToDefaults}
                className="w-full bg-transparent"
                style={{ backgroundColor: ui.cardBg, borderColor: ui.cardBorder, color: ui.text }}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>
            </div>
          </div>

          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="max-w-2xl mx-auto">
              {/* Poster Container */}
              <div
                ref={posterRef}
                className="relative shadow-2xl mx-auto w-full max-w-[88vw] overflow-hidden p-4 sm:p-6 md:p-10"
                style={{
                  backgroundColor: colors.posterBg,
                  border: `2px solid ${colors.border}`,
                  aspectRatio: (config.printSize === "8x8" || config.printSize === "16x16") ? "1/1" : "4/5",
                }}
                data-aspect={isSquare ? "square" : "portrait"}
              >
                {/* Enhanced frame: double inner borders */}
                <div className="absolute inset-6 sm:inset-7 md:inset-8 border" style={{ borderColor: colors.border }} />
                <div className="absolute inset-8 sm:inset-9 md:inset-10 border opacity-60" style={{ borderColor: colors.border }} />
                {/* Subtle vignette overlay for depth */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      config.darkMode
                        ? "radial-gradient(ellipse at center, rgba(0,0,0,0) 60%, rgba(0,0,0,0.08) 100%)"
                        : "radial-gradient(ellipse at center, rgba(0,0,0,0) 60%, rgba(0,0,0,0.06) 100%)",
                  }}
                />

                {/* Star Map Circle */}
                <div className="flex justify-center items-start" style={{ height: isSquare ? "52%" : "56%" }}>
                  <div
                    data-circle
                    className={`relative flex-shrink-0 ${isSquare
                      ? "aspect-[1/1] w-[50%] sm:w-[52%] md:w-[58%] lg:w-[60%] mt-6 sm:mt-4 lg:mt-8"
                      : "aspect-[1/1] w-[68%] sm:w-[69%] md:w-[71%] lg:w-[73%] mt-8 sm:mt-4"
                      }`}
                  >
                    <StarFieldSVG config={config} isGenerating={isGenerating} />
                  </div>
                </div>

                <div className="mt-2 sm:mt-10 mb-14 sm:mb-10 px-3 flex flex-col items-center text-center" data-export-scope>
                  <h2
                    data-title
                    className="order-1 mb-2 sm:mb-4 text-lg sm:text-3xl md:text-4xl mt-8 sm:mt-16 md:mt-24"
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

                  {/* Date and Location (shown second on mobile) */}
                  <p data-date className="order-2 text-[7px] sm:text-[9px] tracking-[0.1em] leading-tight" style={{ color: colors.subtext, marginTop: 0 }}>
                    {(() => {
                      try {
                        const d = new Date(`${config.date}T00:00:00`)
                        return d
                          .toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
                          .toUpperCase()
                      } catch {
                        return config.date
                      }
                    })()}
                    , {config.city.toUpperCase()}
                  </p>

                  {/* Names (smaller on iPhone square) */}
                  <p
                    data-subtitle
                    className={`order-3 ${isSquare ? "text-[7px]" : "text-[9px]"} sm:text-sm font-semibold tracking-[0.1em] sm:tracking-[0.2em] break-words`}
                    style={{ color: colors.text, marginTop: 6, marginBottom: 4 }}
                  >
                    {config.customSubtitle}
                  </p>
                </div>

                {/* Bottom Text (hidden on export) */}
                <div className="absolute bottom-2 sm:bottom-16 left-2 right-2 text-center" data-noexport>
                  {!(hasPaid && paidHash === configHash) && (
                    <div
                      aria-label="Watermark"
                      className="mx-auto inline-block px-0.5 py-[1px] text-[4px] sm:text-[9px] uppercase tracking-widest border rounded"
                      style={{ color: colors.subtext, borderColor: colors.cardBorder }}
                    >
                      WATERMARK — Removed after purchase
                    </div>
                  )}
                </div>
              </div>

              {/* Checkout buttons are shown at the bottom of the controls column */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
