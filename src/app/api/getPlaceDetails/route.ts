import { NextRequest, NextResponse } from 'next/server'
import { GetPlaceDetailsSchema } from '../_utils/validate'
import { createTTLCache } from '../_utils/cache'

const placeDetailsCache = createTTLCache<unknown>(3600000)

export function clearCache() {
  placeDetailsCache.clear()
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON in request body' },
      { status: 400 },
    )
  }

  const validationResult = GetPlaceDetailsSchema.safeParse(body)
  if (!validationResult.success) {
    const errors = validationResult.error.issues
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join('; ')
    return NextResponse.json(
      { error: `Validation failed: ${errors}` },
      { status: 400 },
    )
  }

  const { place_id } = validationResult.data
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  const endpoint = `https://maps.googleapis.com/maps/api/place/details/json`

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing required environment variable: GOOGLE_MAPS_API_KEY' },
      { status: 500 },
    )
  }

  // Check cache first
  const cachedData = placeDetailsCache.get(place_id)
  if (cachedData) {
    return NextResponse.json(cachedData, { status: 200 })
  }

  try {
    const response = await fetch(
      `${endpoint}?place_id=${encodeURIComponent(place_id)}&key=${apiKey}`,
      {
        next: { revalidate: 3600 }, // Revalidate cache every hour
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        {
          error: errorData.error_message || 'Error fetching place details',
        },
        { status: 500 },
      )
    }
    const data = await response.json()
    const result = data.result

    // Cache the result
    placeDetailsCache.set(place_id, result)

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Error fetching place details:', error)
    return NextResponse.json(
      { error: 'Error fetching place details' },
      { status: 500 },
    )
  }
}
