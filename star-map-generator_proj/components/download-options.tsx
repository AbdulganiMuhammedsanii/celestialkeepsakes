"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Download, FileImage, FileText } from "lucide-react"
import { downloadAsImage, downloadAsPDF, type DownloadOptions } from "@/lib/download-utils"

interface DownloadOptionsProps {
  posterRef: React.RefObject<HTMLElement>
  filename: string
  colors: {
    cardBg: string
    cardBorder: string
    text: string
    background: string
    subtext: string
  }
}

export function DownloadComponent({ posterRef, filename, colors }: DownloadOptionsProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [format, setFormat] = useState<"png" | "jpg" | "pdf">("png")
  const [quality, setQuality] = useState<"standard" | "high" | "ultra">("high")

  const getScale = () => {
    switch (quality) {
      case "standard":
        return 2
      case "high":
        return 3
      case "ultra":
        return 4
      default:
        return 3
    }
  }

  const handleDownload = async () => {
    if (!posterRef.current) return

    try {
      setIsDownloading(true)

      const options: DownloadOptions = {
        filename,
        format,
        scale: getScale(),
        quality: format === "jpg" ? 0.95 : 1.0,
      }

      if (format === "pdf") {
        await downloadAsPDF(posterRef.current, options)
      } else {
        await downloadAsImage(posterRef.current, options)
      }
    } catch (error) {
      console.error("Download failed:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Card style={{ backgroundColor: colors.cardBg, borderColor: colors.cardBorder }}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base" style={{ color: colors.text }}>
          <Download className="w-4 h-4" style={{ color: colors.subtext }} />
          Download Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium" style={{ color: colors.text }}>
            Format
          </Label>
          <Select value={format} onValueChange={(value: "png" | "jpg" | "pdf") => setFormat(value)}>
            <SelectTrigger
              style={{ borderColor: colors.cardBorder, backgroundColor: colors.cardBg, color: colors.text }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="png">
                <div className="flex items-center gap-2">
                  <FileImage className="w-4 h-4" />
                  PNG (Best Quality)
                </div>
              </SelectItem>
              <SelectItem value="jpg">
                <div className="flex items-center gap-2">
                  <FileImage className="w-4 h-4" />
                  JPG (Smaller Size)
                </div>
              </SelectItem>
              <SelectItem value="pdf">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  PDF (Print Ready)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium" style={{ color: colors.text }}>
            Quality
          </Label>
          <Select value={quality} onValueChange={(value: "standard" | "high" | "ultra") => setQuality(value)}>
            <SelectTrigger
              style={{ borderColor: colors.cardBorder, backgroundColor: colors.cardBg, color: colors.text }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard (2x)</SelectItem>
              <SelectItem value="high">High (3x)</SelectItem>
              <SelectItem value="ultra">Ultra (4x)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full"
          style={{ backgroundColor: colors.text, color: colors.background }}
        >
          {isDownloading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download {format.toUpperCase()}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
