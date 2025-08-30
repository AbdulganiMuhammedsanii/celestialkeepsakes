import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY
  const stripe = stripeSecret ? (await import("stripe")).default : null

  if (!stripeSecret || !stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 })
  }

  const stripeClient = new stripe(stripeSecret, { apiVersion: "2024-06-20" })

  try {
    const body = await request.json().catch(() => ({} as any))
    const configHash: string | undefined = typeof body?.configHash === "string" ? body.configHash : undefined
    const printSize: string | undefined = typeof body?.printSize === "string" ? body.printSize : undefined

    if (!printSize) {
      return NextResponse.json({ error: "Missing printSize" }, { status: 400 })
    }

    // Price by size group
    const isSmall = printSize === "8x8" || printSize === "8x10"
    const unitAmount = isSmall ? 1999 : 2999 // USD cents

    const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const session = await stripeClient.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `Print Poster ${printSize}` },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      // Collect shipping address for Printify fulfillment later
      shipping_address_collection: { allowed_countries: ["US", "CA", "GB", "AU", "NZ", "IE", "DE", "FR", "NL", "SE", "NO", "DK", "FI", "IT", "ES"] },
      metadata: {
        ...(configHash ? { configHash } : {}),
        print: "1",
        printSize,
      },
      success_url: `${site}/checkout/success?session_id={CHECKOUT_SESSION_ID}&print=1${configHash ? `&h=${configHash}` : ""}&size=${encodeURIComponent(printSize)}`,
      cancel_url: `${site}/checkout/cancel`,
    })

    return NextResponse.json({ id: session.id, url: session.url })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to create print checkout session" }, { status: 500 })
  }
}


