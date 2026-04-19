import { DEFAULT_KEYWORDS } from '@/lib/constants'
import type { GetRestaurantRequest } from '@/lib/types'

type GooglePlace = {
  place_id: string
  name: string
  vicinity: string
  rating?: number
  user_ratings_total?: number
  opening_hours?: { open_now: boolean }
  business_status: string
  photos?: Array<{ photo_reference: string }>
}

export async function POST(request: Request) {
  // 1. Parse request body with try/catch
  let body: GetRestaurantRequest
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // 2. Check GOOGLE_MAPS_API_KEY env var
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    return Response.json(
      { error: 'GOOGLE_MAPS_API_KEY is not set' },
      { status: 500 }
    )
  }

  let latitude = body.latitude
  let longitude = body.longitude

  // 3. If zip provided and lat/lng missing: Geocode
  if (body.zip && (latitude === undefined || longitude === undefined)) {
    try {
      const geocodeUrl = `https://geocode.googleapis.com/v4beta/geocode/address?address.postalCode=${encodeURIComponent(body.zip)}&key=${apiKey}`
      const geocodeResponse = await fetch(geocodeUrl, {
        next: { revalidate: 3600 },
      })

      if (!geocodeResponse.ok) {
        return Response.json(
          { error: 'Could not geocode ZIP code' },
          { status: 400 }
        )
      }

      const geocodeData = await geocodeResponse.json()

      if (!geocodeData.results || geocodeData.results.length === 0) {
        return Response.json(
          { error: 'Could not geocode ZIP code' },
          { status: 400 }
        )
      }

      latitude = geocodeData.results[0].location.latitude
      longitude = geocodeData.results[0].location.longitude
    } catch {
      return Response.json(
        { error: 'Could not geocode ZIP code' },
        { status: 400 }
      )
    }
  }

  // 4. Validate: require either (latitude + longitude) or geocoded coords; require radius
  if (latitude === undefined || longitude === undefined) {
    return Response.json(
      { error: 'Missing latitude and longitude' },
      { status: 400 }
    )
  }

  if (!body.radius && body.radius !== 0) {
    return Response.json({ error: 'Missing radius' }, { status: 400 })
  }

  // 5. Radius conversion
  const radiusUnits = body.radiusUnits ?? 'miles'
  let radiusInMeters: number

  if (radiusUnits === 'miles') {
    radiusInMeters = body.radius * 1609.34
  } else if (radiusUnits === 'kilometers') {
    radiusInMeters = body.radius * 1000
  } else {
    radiusInMeters = body.radius * 1609.34 // Default to miles
  }

  // 6. Keywords: if provided, use directly; if not, join DEFAULT_KEYWORDS with |
  const keywordString = body.keywords || DEFAULT_KEYWORDS.join('|')

  // 7. Call Google Places Nearby Search
  const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radiusInMeters}&type=restaurant&keyword=${encodeURIComponent(keywordString)}&key=${apiKey}`

  try {
    const placesResponse = await fetch(placesUrl, {
      next: { revalidate: 3600 },
    })

    if (!placesResponse.ok) {
      return Response.json(
        { error: `Google Places API error: ${placesResponse.status}` },
        { status: 500 }
      )
    }

    // 8. On success: return raw Google JSON response with 200
    const googleData = await placesResponse.json()
    return Response.json(googleData, { status: 200 })
  } catch (error) {
    // 9. On fetch error: return 500 with { error: message }
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred'
    return Response.json({ error: message }, { status: 500 })
  }
}
