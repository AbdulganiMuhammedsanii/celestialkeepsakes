import Link from "next/link"

export default function CancelPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
      <h1 className="text-3xl font-bold mb-3">Payment Canceled</h1>
      <p className="text-muted-foreground mb-6">No worries. You can try again anytime.</p>
      <Link href="/checkout" className="rounded-md px-5 py-3 bg-foreground text-background">Return to Checkout</Link>
    </div>
  )
}


