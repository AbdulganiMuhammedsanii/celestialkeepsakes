import { StarMapGenerator } from "@/components/star-map-generator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star } from "lucide-react"
import Image from "next/image"
import samplePic from "@/components/sample_pic.png"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 brand-gradient">Cherish the Moment</h1>
            <p className="text-base text-muted-foreground mb-6">
              A star map is a unique representation of the night sky — capturing the exact position of stars and constellations as seen from a specific place and time. Whether it's the moment you met, said "I do," or welcomed new life, your star map tells a cosmic story that's uniquely yours.
            </p>
            <a href="#create" className="inline-block rounded-md px-6 py-3 btn-gradient text-sm shadow-lg">Create Yours</a>
          </div>
          <div className="justify-self-end">
            <div className="relative w-full max-w-sm md:max-w-md">
              <div className="absolute -inset-6 rounded-3xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-2xl" />
              <Image
                src={samplePic}
                alt="Framed star map poster on table"
                className="relative rounded-2xl border border-white/10 shadow-2xl"
                sizes="(min-width: 768px) 480px, 90vw"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold mb-5">Stories From the Heart</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-xl border p-6 card-glass">
            <div className="flex items-center gap-3 mb-3">
              <Avatar>
                <AvatarFallback>D</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">Davis A.</p>
                <div className="flex text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              “Absolutely stunning. The map captured the night of our engagement perfectly and the print quality is top notch. It’s now the centerpiece of our living room.”
            </p>
          </div>
          <div className="rounded-xl border p-6 card-glass">
            <div className="flex items-center gap-3 mb-3">
              <Avatar>
                <AvatarFallback>B</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">Bryan Sanchez</p>
                <div className="flex text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              “Fast, elegant, and heartfelt. I designed one for my parents’ anniversary and they teared up. The process was simple and the result felt premium.”
            </p>
          </div>
          <div className="rounded-xl border p-6 card-glass">
            <div className="flex items-center gap-3 mb-3">
              <Avatar>
                <AvatarFallback>S</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">Srithi P.</p>
                <div className="flex text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              “The details are beautiful and the customization is effortless. It looks like a boutique studio piece — can’t recommend it enough.”
            </p>
          </div>
        </div>
      </section>



      {/* Inscription */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Heartfelt Message</h3>
            <p className="text-muted-foreground">Add a personal inscription to immortalize your feelings, making each star map a unique expression of your love story.</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Stories From the Heart</h3>
            <p className="text-muted-foreground">Discover how our celestial creations have touched the lives of those who cherish moments as much as you do.</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">The Journey</h3>
            <p className="text-muted-foreground">Creating your personalized celestial keepsake is a simple yet magical process.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="create" className="container mx-auto px-4 py-20">
        <div className="rounded-2xl border p-6 card-glass">
          <h2 className="text-3xl font-semibold mb-4">Create Your Celestial Keepsake</h2>
          <StarMapGenerator />
        </div>
      </section>
    </div>
  )
}
