import { type NextRequest, NextResponse } from "next/server"
import { getStarMapById, updateStarMap, deleteStarMap } from "@/lib/star-maps"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const starMap = await getStarMapById(params.id)
    return NextResponse.json(starMap)
  } catch (error) {
    console.error("Error fetching star map:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch star map" },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const starMap = await updateStarMap(params.id, body)
    return NextResponse.json(starMap)
  } catch (error) {
    console.error("Error updating star map:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update star map" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await deleteStarMap(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting star map:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete star map" },
      { status: 500 },
    )
  }
}
