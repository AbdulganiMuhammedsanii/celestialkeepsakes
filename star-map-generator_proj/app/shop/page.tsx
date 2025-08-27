import Link from "next/link"

export default function ShopPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Shop Now</h1>
      <p className="text-muted-foreground mb-8 max-w-2xl">
        Design your personalized star map and receive high-resolution files instantly. Perfect for weddings, anniversaries, birthdays, or any unforgettable moment.
      </p>
      <div className="rounded-xl border p-6">
        <h2 className="text-xl font-semibold mb-3">Custom Star Map</h2>
        <p className="text-muted-foreground mb-4">Create from any date, time, and location. Multiple styles. Instant download.</p>
        <Link href="/#create" className="inline-block rounded-md px-5 py-3 bg-foreground text-background text-sm">Start Designing</Link>
      </div>
    </div>
  )
}


