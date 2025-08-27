"use client"

import { useState } from "react"

export default function ContactPage() {
  const [status, setStatus] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())
    console.log("contact:", data)
    setStatus("Thanks! We'll get back to you shortly.")
    form.reset()
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Contact</h1>
      <p className="text-muted-foreground mb-8">Questions, custom requests, or help with your order? Send us a note.</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1" htmlFor="name">Name</label>
          <input className="w-full border rounded-md px-3 py-2" id="name" name="name" required />
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="email">Email</label>
          <input type="email" className="w-full border rounded-md px-3 py-2" id="email" name="email" required />
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="message">Message</label>
          <textarea className="w-full border rounded-md px-3 py-2" id="message" name="message" rows={5} required />
        </div>
        <button className="rounded-md px-6 py-3 btn-gradient text-sm shadow-lg" type="submit">Send</button>
      </form>
      {status && <p className="mt-4 text-green-600 text-sm">{status}</p>}
    </div>
  )
}


