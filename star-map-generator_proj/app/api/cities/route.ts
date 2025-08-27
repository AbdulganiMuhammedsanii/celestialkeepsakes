import { type NextRequest, NextResponse } from "next/server"

// Simple proxy to Nominatim to search cities by query string
// Respect rate limits in production; this is minimal for demo purposes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")?.trim() ?? ""
    const limitParam = Number.parseInt(searchParams.get("limit") || "20", 10)
    const countryCodes = searchParams.get("countrycodes") || undefined // optional comma-separated ISO2 codes

    if (query.length < 2) {
      return NextResponse.json({ results: [] })
    }

    const limit = Math.max(1, Math.min(50, isNaN(limitParam) ? 20 : limitParam))

    const nominatimUrl = new URL("https://nominatim.openstreetmap.org/search")
    nominatimUrl.searchParams.set("q", query)
    nominatimUrl.searchParams.set("format", "jsonv2")
    nominatimUrl.searchParams.set("addressdetails", "1")
    nominatimUrl.searchParams.set("namedetails", "1")
    nominatimUrl.searchParams.set("limit", String(limit))
    nominatimUrl.searchParams.set("accept-language", "en")
    if (countryCodes) nominatimUrl.searchParams.set("countrycodes", countryCodes)

    const res = await fetch(nominatimUrl.toString(), {
      // Provide a UA per Nominatim usage policy
      headers: {
        "User-Agent": "celestialkeepsakes/1.0 (city search)",
        "Accept": "application/json",
      },
      // Cache briefly on the edge/runtime to reduce upstream load
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      return NextResponse.json({ error: "Upstream geocoder error" }, { status: res.status })
    }

    const raw: any[] = await res.json()

    // Normalize and lightly filter to types/addresstypes that make sense for cities
    const allowedPlaceTypes = new Set(["city", "town", "village", "hamlet", "suburb", "municipality", "locality"])
    const allowedAddressTypes = new Set(["city", "town", "village", "hamlet", "suburb", "municipality", "locality", "city_district"])

    const results = raw
      .filter((r) => {
        const isPlace = r?.class === "place" && allowedPlaceTypes.has(r?.type)
        const isAdminBoundaryCity = r?.category === "boundary" && r?.type === "administrative" && allowedAddressTypes.has(r?.addresstype)
        const hasUsefulAddressType = allowedAddressTypes.has(r?.addresstype)
        return isPlace || isAdminBoundaryCity || hasUsefulAddressType
      })
      .map((r) => {
        const address = r.address || {}
        const primaryName = address.city || address.town || address.village || address.hamlet || address.suburb || r.namedetails?.name || r.display_name
        const region = address.state || address.region || address.county
        const country = address.country
        const concise = [primaryName, region, country].filter(Boolean).join(", ")
        return {
          id: r.place_id,
          name: primaryName,
          display_name: r.display_name,
          concise_name: concise || r.display_name,
          lat: Number.parseFloat(r.lat),
          lon: Number.parseFloat(r.lon),
          type: r.type,
          country_code: address.country_code,
        }
      })

    return NextResponse.json({ results })
  } catch (error) {
    console.error("City search error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to search cities" },
      { status: 500 },
    )
  }
}


