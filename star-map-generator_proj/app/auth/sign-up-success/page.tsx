"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail, ArrowLeft } from "lucide-react"

export default function SignUpSuccessPage() {
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
                <Mail className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white">Check Your Email</h1>
            <p className="text-slate-300">We've sent you a confirmation link</p>
          </div>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Almost There!</CardTitle>
              <CardDescription className="text-slate-300">
                Please check your email and click the confirmation link to activate your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-slate-300">
                  Once confirmed, you'll be able to save and manage your star maps.
                </p>
                <p className="text-xs text-slate-400">
                  Don't see the email? Check your spam folder or try signing up again.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button asChild className="w-full bg-white text-slate-900 hover:bg-slate-100">
                  <Link href="/auth/login">Go to Sign In</Link>
                </Button>
              </div>
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
