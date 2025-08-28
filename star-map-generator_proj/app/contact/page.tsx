"use client"

import { useState } from "react"

export default function ContactPage() {
  const [status, setStatus] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>
    try {
      setSending(true)
      setStatus(null)
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, email: data.email, message: data.message }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Failed to send")
      setStatus("Thanks! We'll get back to you shortly.")
      form.reset()
    } catch (err: any) {
      setStatus(err?.message || "Failed to send message. Please try again later.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-3">Contact</h1>
      <p className="text-muted-foreground mb-6">Questions, custom requests, or help with your order? Send us a note.</p>
      <div className="rounded-2xl border card-glass p-5 md:p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1" htmlFor="name">Name</label>
              <input className="w-full border rounded-md px-3 py-3 md:py-2 text-base md:text-sm" id="name" name="name" autoComplete="name" required />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="email">Email</label>
              <input type="email" className="w-full border rounded-md px-3 py-3 md:py-2 text-base md:text-sm" id="email" name="email" autoComplete="email" required />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1" htmlFor="message">Message</label>
            <textarea className="w-full border rounded-md px-3 py-3 md:py-2 text-base md:text-sm" id="message" name="message" rows={6} required />
          </div>
          <button className="rounded-md w-full md:w-auto px-6 py-3 btn-gradient text-sm shadow-lg" type="submit" disabled={sending}>{sending ? "Sending..." : "Send"}</button>
        </form>
        {status && <p className="mt-4 text-green-600 text-sm">{status}</p>}
      </div>
    </div>
  )
}


