"use client"

import { useEffect, useState } from "react"
import { ShoppingCart, ShieldCheck, Clock, Package } from "lucide-react"

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null
  const configHash = params?.get("h") || undefined
  const querySize = params?.get("size") || undefined
  const [config, setConfig] = useState<any>(null)

  // Load the exact config used at checkout for a faithful preview
  useEffect(() => {
    try {
      if (!configHash) return
      const stored = window.localStorage?.getItem(`ck_checkout_${configHash}`)
      if (stored) {
        const parsed = JSON.parse(stored)
        // prefer query size if present
        setConfig({ ...parsed, printSize: querySize || parsed.printSize })
      }
    } catch { }
  }, [configHash, querySize])

  const startCheckout = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configHash }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Checkout failed")
      window.location.href = data.url
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const startPrintOrder = async () => {
    try {
      setLoading(true)
      setError(null)
      const search = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null
      const size = search?.get("size") || "8x8"
      const res = await fetch("/api/create-print-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configHash, printSize: size }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Print checkout failed")
      window.location.href = data.url
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">

      <div className="rounded-2xl border card-glass p-8">
        <div className="flex items-start justify-between gap-6 flex-col md:flex-row">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">Checkout</h1>
            <p className="text-muted-foreground mb-4">Limited time: Pay $0.99 for the high‑resolution PDF, or order a physical print.</p>
            <ul className="text-sm text-muted-foreground space-y-2 mb-6">
              <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Secure payment powered by Stripe</li>
              <li className="flex items-center gap-2"><Clock className="w-4 h-4" /> Instant access after payment (PDF)</li>
            </ul>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={startCheckout} className="rounded-md px-6 py-3 btn-gradient shadow-lg inline-flex items-center gap-2" disabled={loading}>
                <ShoppingCart className="w-4 h-4" /> {loading ? "Redirecting..." : "Checkout"}
              </button>
              <button onClick={startPrintOrder} className="rounded-md px-6 py-3 bg-background border shadow-sm inline-flex items-center gap-2" disabled={loading}>
                <Package className="w-4 h-4" /> Order Print
              </button>
            </div>
            {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
          </div>
          <div className="w-full md:w-64 rounded-xl border p-4 bg-background/40">
            <h3 className="text-sm font-semibold mb-3">Order Summary</h3>
            <div className="flex items-center justify-between text-sm mb-1"><span>Custom Star Map PDF</span><span>$0.99</span></div>
            {config && (
              <>
                <div className="flex items-center justify-between text-xs mb-1"><span>Size</span><span>{config.printSize || "8x8"}</span></div>
                <div className="flex items-center justify-between text-xs mb-1"><span>Title</span><span className="truncate max-w-[10rem] text-right">{config.customTitle}</span></div>
                <div className="flex items-center justify-between text-xs mb-1"><span>Names</span><span className="truncate max-w-[10rem] text-right">{config.customSubtitle}</span></div>
                <div className="flex items-center justify-between text-xs mb-1"><span>Date</span><span>{(() => { try { const d = new Date(`${config.date}T00:00:00`); return d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) } catch { return config.date } })()}</span></div>
                <div className="flex items-center justify-between text-xs mb-3"><span>Location</span><span className="truncate max-w-[10rem] text-right">{config.city}</span></div>
              </>
            )}
            <div className="flex items-center justify-between text-sm mb-1"><span>Optional: Print (8x8 / 8x10)</span><span>$19.99</span></div>
            <div className="flex items-center justify-between text-sm mb-3"><span>Optional: Print (16x16 / 16x20)</span><span>$29.99</span></div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
              <span>Processing</span>
              <span>Free</span>
            </div>
            <div className="flex items-center justify-between text-sm font-semibold border-t pt-2">
              <span>Total</span>
              <span>$0.99</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


