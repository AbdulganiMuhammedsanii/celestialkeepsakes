"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Stars, ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/`,
        },
      })
      if (error) throw error
      router.push("/")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      {/* Background stars */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-white/10 backdrop-blur-sm">
                <Stars className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
            <p className="text-slate-300">Sign in to your celestial account</p>
          </div>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Sign In</CardTitle>
              <CardDescription className="text-slate-300">
                Enter your credentials to access your star maps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-white">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-white">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                    />
                  </div>
                  {error && <p className="text-sm text-red-400">{error}</p>}
                  <Button
                    type="submit"
                    className="w-full bg-white text-slate-900 hover:bg-slate-100"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  <span className="text-slate-300">Don't have an account? </span>
                  <Link href="/auth/sign-up" className="text-white underline underline-offset-4 hover:text-slate-200">
                    Sign up
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Star Map Generator
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .stars {
          width: 1px;
          height: 1px;
          background: transparent;
          box-shadow: 1541px 1046px #fff, 1917px 1236px #fff, 1539px 1058px #fff, 1311px 1398px #fff,
            1516px 1457px #fff, 1693px 1479px #fff, 1402px 1516px #fff, 1956px 1622px #fff, 1747px 1665px #fff,
            1123px 1687px #fff, 1869px 1717px #fff, 1695px 1799px #fff, 1480px 1812px #fff, 1870px 1862px #fff,
            1934px 1887px #fff, 1867px 1943px #fff, 1583px 1954px #fff, 1924px 1954px #fff, 1516px 1988px #fff,
            1869px 1999px #fff;
          animation: animStar 50s linear infinite;
        }
        .stars:after {
          content: " ";
          position: absolute;
          top: 2000px;
          width: 1px;
          height: 1px;
          background: transparent;
          box-shadow: 1541px 1046px #fff, 1917px 1236px #fff, 1539px 1058px #fff, 1311px 1398px #fff,
            1516px 1457px #fff, 1693px 1479px #fff, 1402px 1516px #fff, 1956px 1622px #fff, 1747px 1665px #fff,
            1123px 1687px #fff, 1869px 1717px #fff, 1695px 1799px #fff, 1480px 1812px #fff, 1870px 1862px #fff,
            1934px 1887px #fff, 1867px 1943px #fff, 1583px 1954px #fff, 1924px 1954px #fff, 1516px 1988px #fff,
            1869px 1999px #fff;
        }
        .stars2 {
          width: 2px;
          height: 2px;
          background: transparent;
          box-shadow: 879px 1046px #fff, 1117px 1236px #fff, 1539px 1058px #fff, 1311px 1398px #fff,
            1516px 1457px #fff, 1693px 1479px #fff, 1402px 1516px #fff, 1956px 1622px #fff, 1747px 1665px #fff,
            1123px 1687px #fff, 1869px 1717px #fff, 1695px 1799px #fff, 1480px 1812px #fff, 1870px 1862px #fff,
            1934px 1887px #fff, 1867px 1943px #fff, 1583px 1954px #fff, 1924px 1954px #fff, 1516px 1988px #fff,
            1869px 1999px #fff;
          animation: animStar 100s linear infinite;
        }
        .stars2:after {
          content: " ";
          position: absolute;
          top: 2000px;
          width: 2px;
          height: 2px;
          background: transparent;
          box-shadow: 879px 1046px #fff, 1117px 1236px #fff, 1539px 1058px #fff, 1311px 1398px #fff,
            1516px 1457px #fff, 1693px 1479px #fff, 1402px 1516px #fff, 1956px 1622px #fff, 1747px 1665px #fff,
            1123px 1687px #fff, 1869px 1717px #fff, 1695px 1799px #fff, 1480px 1812px #fff, 1870px 1862px #fff,
            1934px 1887px #fff, 1867px 1943px #fff, 1583px 1954px #fff, 1924px 1954px #fff, 1516px 1988px #fff,
            1869px 1999px #fff;
        }
        .stars3 {
          width: 3px;
          height: 3px;
          background: transparent;
          box-shadow: 1541px 1046px #fff, 1917px 1236px #fff, 1539px 1058px #fff, 1311px 1398px #fff,
            1516px 1457px #fff, 1693px 1479px #fff, 1402px 1516px #fff, 1956px 1622px #fff, 1747px 1665px #fff,
            1123px 1687px #fff, 1869px 1717px #fff, 1695px 1799px #fff, 1480px 1812px #fff, 1870px 1862px #fff,
            1934px 1887px #fff, 1867px 1943px #fff, 1583px 1954px #fff, 1924px 1954px #fff, 1516px 1988px #fff,
            1869px 1999px #fff;
          animation: animStar 150s linear infinite;
        }
        .stars3:after {
          content: " ";
          position: absolute;
          top: 2000px;
          width: 3px;
          height: 3px;
          background: transparent;
          box-shadow: 1541px 1046px #fff, 1917px 1236px #fff, 1539px 1058px #fff, 1311px 1398px #fff,
            1516px 1457px #fff, 1693px 1479px #fff, 1402px 1516px #fff, 1956px 1622px #fff, 1747px 1665px #fff,
            1123px 1687px #fff, 1869px 1717px #fff, 1695px 1799px #fff, 1480px 1812px #fff, 1870px 1862px #fff,
            1934px 1887px #fff, 1867px 1943px #fff, 1583px 1954px #fff, 1924px 1954px #fff, 1516px 1988px #fff,
            1869px 1999px #fff;
        }
        @keyframes animStar {
          from {
            transform: translateY(0px);
          }
          to {
            transform: translateY(-2000px);
          }
        }
      `}</style>
    </div>
  )
}
