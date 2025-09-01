import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY
  const stripe = stripeSecret ? (await import("stripe")).default : null

  if (!stripeSecret || !stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 })
  }

  const stripeClient = new stripe(stripeSecret, { apiVersion: "2024-06-20" })

  try {
    const body = await request.json().catch(() => ({}))
    const configHash = typeof body?.configHash === "string" ? body.configHash : undefined
    const type = typeof body?.type === "string" ? body.type : undefined

    const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const session = await stripeClient.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: type === "sound" ? "Custom Sound Wave Poster PDF" : "Custom Star Map PDF" },
            unit_amount: 99,
          },
          quantity: 1,
        },
      ],
      metadata: configHash ? { configHash } : undefined,
      success_url: `${site}/checkout/success?session_id={CHECKOUT_SESSION_ID}${configHash ? `&h=${configHash}` : ""}${type ? `&type=${encodeURIComponent(type)}` : ""}`,
      cancel_url: `${site}/checkout/cancel`,
    })

    return NextResponse.json({ id: session.id, url: session.url })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}


