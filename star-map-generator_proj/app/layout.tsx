import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Dancing_Script, Playfair_Display, Cormorant_Garamond, Great_Vibes, Parisienne } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/react"
import Script from "next/script"

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dancing-script",
})

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair-display",
})

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
})

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  display: "swap",
  weight: "400",
  variable: "--font-great-vibes",
})

const parisienne = Parisienne({
  subsets: ["latin"],
  display: "swap",
  weight: "400",
  variable: "--font-parisienne",
})

export const metadata: Metadata = {
  title: "Star Map Generator",
  description: "Create beautiful astronomical posters",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta name="google-adsense-account" content="ca-pub-4896735734946710" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} ${dancingScript.variable} ${playfairDisplay.variable} ${cormorant.variable} ${greatVibes.variable} ${parisienne.variable}`}>
        <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 sm:py-4 py-3 pt-[max(env(safe-area-inset-top),0.75rem)] flex items-center justify-between">
            <a href="/" className="text-lg font-semibold brand-gradient">Celestial Keepsakes</a>
            <nav className="flex gap-6 text-sm">
              <a href="/" className="hover:opacity-80">Home</a>
              <a href="/shop" className="hover:opacity-80">Shop</a>
              <a href="/faq" className="hover:opacity-80">FAQ</a>
              <a href="/contact" className="hover:opacity-80">Contact</a>
            </nav>
          </div>
        </header>
        {/* Top promo banner */}
        <div className="w-full border-b">
          <div className="btn-gradient">
            <div className="container mx-auto px-4 py-2 text-center relative overflow-hidden">
              <span className="text-xs sm:text-sm font-medium tracking-wide text-white">
                Perfect birthday and anniversary gift
              </span>
              <div className="pointer-events-none absolute inset-0">
                <div
                  className="absolute top-0 left-[-30%] h-full w-1/3 opacity-20 animate-shine"
                  style={{ background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.7) 50%, rgba(255,255,255,0) 100%)" }}
                />
              </div>
            </div>
          </div>
        </div>
        <main className="section-gradient min-h-[100dvh] overflow-x-hidden">{children}</main>
        <footer className="border-t mt-16">
          <div className="container mx-auto px-4 py-10 text-sm text-muted-foreground">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p>© {new Date().getFullYear()} Celestial Keepsakes. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="/faq">FAQ</a>
                <a href="/contact">Contact</a>
              </div>
            </div>
          </div>
        </footer>
        <Analytics />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-3JH5HDQ0DG"
          strategy="afterInteractive"
        />
        <Script id="ga4" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-3JH5HDQ0DG');
          `}
        </Script>
        <Script
          id="adsense"
          async
          strategy="afterInteractive"
          crossOrigin="anonymous"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4896735734946710"
        />
      </body>
    </html>
  )
}
