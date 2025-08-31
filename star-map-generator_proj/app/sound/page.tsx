import { SoundWaveGenerator } from "@/components/sound-wave-generator"

export default function SoundPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-20">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold">Sound Wave Poster</h1>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">Upload an audio file and transform it into an elegant waveform poster with the same sizing and checkout experience.</p>
      </div>
      <div className="rounded-2xl border p-6 card-glass">
        <SoundWaveGenerator />
      </div>
    </div>
  )
}


