import { StarMapGenerator } from "@/components/star-map-generator"
import Image from "next/image"
import samplePic from "@/components/sample_pic.png"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="grid grid-cols-[0.9fr_1.1fr] md:grid-cols-2 gap-4 md:gap-10 items-center">
          <div className="max-w-3xl pr-2 md:pr-4">
            <h1 className="text-[20px] sm:text-4xl md:text-5xl font-bold mb-3 brand-gradient hero-title-appear whitespace-nowrap md:whitespace-normal leading-none">Cherish the Moment</h1>
            <p className="text-base text-muted-foreground mb-6">
              A star map is a unique representation of the night sky — capturing the exact position of stars and constellations as seen from a specific place and time. Whether it's the moment you met, said "I do," or welcomed new life, your star map tells a cosmic story that's uniquely yours.
            </p>
            <a href="#create" className="inline-block rounded-md px-6 py-3 btn-gradient text-sm shadow-lg">Create Yours</a>
          </div>
          <div className="justify-self-end w-full md:justify-self-end md:col-start-2 md:col-end-3">
            <div className="relative w-full max-w-[420px] sm:max-w-sm md:max-w-md md:ml-auto">
              <div className="absolute -inset-4 sm:-inset-6 rounded-3xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-2xl" />
              <Image
                src={samplePic}
                alt="Framed star map poster on table"
                className="relative rounded-2xl border border-white/10 shadow-2xl h-auto w-full"
                sizes="(min-width: 1024px) 420px, (min-width: 768px) 360px, 80vw"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Reviews removed */}



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

      {/* Generator */}
      <section id="create" className="container mx-auto px-4 py-20">
        <div className="rounded-2xl border p-6 card-glass">
          <StarMapGenerator />
        </div>
      </section>
    </div>
  )
}
