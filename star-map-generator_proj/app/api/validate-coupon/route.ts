import { NextResponse } from "next/server"

// Validate a coupon code from Etsy purchases to bypass payment
// Set env COUPON_CODES as a comma-separated list of valid codes (e.g. ABC123,XYZ789)
export async function POST(request: Request) {
  try {
    const { code } = (await request.json().catch(() => ({}))) as { code?: string }
    if (!code || typeof code !== "string") {
      return NextResponse.json({ valid: false, reason: "Missing code" }, { status: 400 })
    }

    const raw = process.env.COUPON_CODES || ""
    const allowed = new Set(
      raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => s.toUpperCase()),
    )

    const isValid = allowed.has(code.trim().toUpperCase())
    return NextResponse.json({ valid: isValid })
  } catch (e) {
    return NextResponse.json({ valid: false, reason: "Server error" }, { status: 500 })
  }
}


