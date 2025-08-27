import { type NextRequest, NextResponse } from "next/server"
import { saveStarMap, getUserStarMaps } from "@/lib/star-maps"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const starMap = await saveStarMap(body)
    return NextResponse.json(starMap, { status: 201 })
  } catch (error) {
    console.error("Error saving star map:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save star map" },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const starMaps = await getUserStarMaps()
    return NextResponse.json(starMaps)
  } catch (error) {
    console.error("Error fetching star maps:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch star maps" },
      { status: 500 },
    )
  }
}
