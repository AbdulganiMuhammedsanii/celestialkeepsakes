export default function FAQPage() {
  const faqs = [
    {
      q: "Are the star maps astronomically accurate?",
      a: "Yes, each star map is created using precise astronomical data to show the exact position of stars, planets, and constellations visible from your chosen location at the specific date and time.",
    },
    {
      q: "What information do I need to provide?",
      a: "Simply provide the date, time, and location of your special moment. You can also add a custom title and personal message to make it truly yours.",
    },
    {
      q: "How are the star maps delivered?",
      a: "After your purchase, the personalized star map design files will be sent directly to your email. You'll also be able to download them instantly with just one click — simple, fast, and ready to print whenever you like.",
    },
    {
      q: "Can I order a star map for a future date?",
      a: "Absolutely. You can create a star map for any date, past, present, or future.",
    },
    {
      q: "What makes these star maps special?",
      a: "Beyond their astronomical accuracy, each map is artistically rendered to create not just a scientific representation, but a beautiful piece of personalized art that tells your unique story.",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Questions & Answers</h1>
      <div className="space-y-6">
        {faqs.map(({ q, a }) => (
          <div key={q} className="rounded-lg border p-5">
            <h3 className="text-lg font-semibold mb-2">{q}</h3>
            <p className="text-muted-foreground">{a}</p>
          </div>
        ))}
      </div>
    </div>
  )
}


