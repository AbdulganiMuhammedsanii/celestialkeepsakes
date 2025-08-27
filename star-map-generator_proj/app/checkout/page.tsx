"use client"

import { useState } from "react"
import { ShoppingCart, ShieldCheck, Clock } from "lucide-react"

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null
  const configHash = params?.get("h") || undefined

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

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="rounded-2xl border card-glass p-8">
        <div className="flex items-start justify-between gap-6 flex-col md:flex-row">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">Checkout</h1>
            <p className="text-muted-foreground mb-4">Pay $7 to receive your high‑resolution PDF instantly.</p>
            <ul className="text-sm text-muted-foreground space-y-2 mb-6">
              <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Secure payment powered by Stripe</li>
              <li className="flex items-center gap-2"><Clock className="w-4 h-4" /> Instant access after payment</li>
            </ul>
            <button onClick={startCheckout} className="rounded-md px-6 py-3 btn-gradient shadow-lg inline-flex items-center gap-2" disabled={loading}>
              <ShoppingCart className="w-4 h-4" /> {loading ? "Redirecting..." : "Proceed to Payment ($7)"}
            </button>
            {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
          </div>
          <div className="w-full md:w-56 rounded-xl border p-4 bg-background/40">
            <h3 className="text-sm font-semibold mb-3">Order Summary</h3>
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Custom Star Map PDF</span>
              <span>$7.00</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
              <span>Processing</span>
              <span>Free</span>
            </div>
            <div className="flex items-center justify-between text-sm font-semibold border-t pt-2">
              <span>Total</span>
              <span>$7.00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


