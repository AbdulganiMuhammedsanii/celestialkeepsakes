import { NextResponse } from "next/server"

// Sends contact messages via Resend if configured, otherwise logs
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { name, email, message } = body as { name?: string; email?: string; message?: string }
    if (!name || !email || !message) {
      return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 })
    }

    const to = "trimifyai@gmail.com"
    const from = process.env.RESEND_FROM || "onboarding@resend.dev"
    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
      return NextResponse.json({ ok: false, error: "Email not configured (RESEND_API_KEY missing)" }, { status: 500 })
    }

    const { Resend } = await import("resend")
    const resend = new Resend(apiKey)
    const { data, error } = await resend.emails.send({
      to,
      from,
      subject: `New Contact Message from ${name}`,
      reply_to: email,
      text: `From: ${name} <${email}>\n\nMessage:\n${message}`,
    })
    if (error) {
      return NextResponse.json({ ok: false, error: error.message || "Failed to send" }, { status: 500 })
    }
    return NextResponse.json({ ok: true, id: data?.id })
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
  }
}


