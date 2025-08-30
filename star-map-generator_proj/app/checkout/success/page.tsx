"use client"

import Link from "next/link"
import { useEffect } from "react"

export default function SuccessPage() {
  useEffect(() => {
    const url = new URL(window.location.href)
    const sessionId = url.searchParams.get("session_id")
    const paidHash = url.searchParams.get("h")
    const isPrint = url.searchParams.get("print") === "1"
    const target = new URL(`/#create`, window.location.origin)
    if (!isPrint && paidHash) target.searchParams.set("paid", "true")
    if (!isPrint && paidHash) target.searchParams.set("h", paidHash)
    // Navigate back to home; auto-download only for digital purchase
    window.location.replace(target.toString())
  }, [])

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
      <h1 className="text-3xl font-bold mb-3">Payment Successful</h1>
      <p className="text-muted-foreground mb-6">Thanks for your purchase. You can now generate and download your PDF.</p>
      <Link href="/#create" className="rounded-md px-5 py-3 bg-foreground text-background">Return to Generator</Link>
    </div>
  )
}


