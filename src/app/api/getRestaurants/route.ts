import { NextRequest, NextResponse } from 'next/server'
import { convertRadiusToMeters } from '@/lib/google-maps'
import { GetRestaurantsSchema } from '../_utils/validate'
import { createTTLCache } from '../_utils/cache'

interface CachedRestaurantResponse {
  results: unknown[]
  status: string
}

const restaurantCache = createTTLCache<CachedRestaurantResponse>(3600000)

export function clearCache() {
  restaurantCache.clear()
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

  const validationResult = GetRestaurantsSchema.safeParse(body)
  if (!validationResult.success) {
    const errors = validationResult.error.issues
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join('; ')
    return NextResponse.json(
      { error: `Validation failed: ${errors}` },
      { status: 400 },
    )
  }

  const { latitude, longitude, zip, radius, radiusUnits, keywords } =
    validationResult.data

  let finalLatitude = latitude
  let finalLongitude = longitude

  // If ZIP is provided but lat/lng are not, geocode the ZIP
  if (zip && (!latitude || !longitude)) {
    try {
      const geocodeEndpoint = `https://geocode.googleapis.com/v4beta/geocode/address`
      const apiKey = process.env.GOOGLE_MAPS_API_KEY

      if (!apiKey) {
        return NextResponse.json(
          {
            error: 'Missing required environment variable: GOOGLE_MAPS_API_KEY',
          },
          { status: 500 },
        )
      }

      const geocodeResponse = await fetch(
        `${geocodeEndpoint}?address.postalCode=${encodeURIComponent(zip)}&key=${apiKey}`,
        {
          next: { revalidate: 3600 },
        },
      )

      const geocodeData = await geocodeResponse.json()

      if (!geocodeResponse.ok || geocodeData.status === 'ZERO_RESULTS') {
        return NextResponse.json(
          { error: geocodeData.error_message || 'Unable to geocode ZIP code' },
          { status: 400 },
        )
      }

      const location = geocodeData.results?.[0]?.location

      if (!location) {
        return NextResponse.json(
          { error: 'Unable to determine coordinates for ZIP code' },
          { status: 400 },
        )
      }

      finalLatitude = location.latitude
      finalLongitude = location.longitude
    } catch (error) {
      console.error('Error geocoding ZIP code:', error)
      return NextResponse.json(
        { error: 'Error geocoding ZIP code' },
        { status: 500 },
      )
    }
  }

  if (!finalLatitude || !finalLongitude || !radius) {
    return NextResponse.json(
      {
        error:
          'Missing required parameters (latitude/longitude or ZIP code, and radius)',
      },
      { status: 400 },
    )
  }

  const defaultKeywordsList = [
    'bakery',
    'bar',
    'bistro',
    'buffet',
    'burger',
    'cafe',
    'café',
    'diner',
    'dining',
    'grill',
    'restaurant',
    'sandwich',
    'seafood',
    'steakhouse',
  ]

  const defaultKeywords = defaultKeywordsList.join('|')

  const searchKeywords = keywords || defaultKeywords

  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  const radiusInMeters = convertRadiusToMeters(radius, radiusUnits ?? 'miles')

  if (!apiKey) {
    return NextResponse.json(
      {
        error: 'Missing required environment variable: GOOGLE_MAPS_API_KEY',
      },
      { status: 500 },
    )
  }

  // Build cache key from request parameters
  const cacheKey = `${finalLatitude},${finalLongitude},${radiusInMeters},${searchKeywords}`

  // Check cache first
  const cachedData = restaurantCache.get(cacheKey)
  if (cachedData) {
    return NextResponse.json(cachedData, { status: 200 })
  }

  try {
    const endpoint = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`
    const response = await fetch(
      `${endpoint}?location=${finalLatitude},${finalLongitude}&radius=${radiusInMeters}&type=restaurant&keyword=${encodeURIComponent(searchKeywords)}&key=${apiKey}`,
      {
        next: { revalidate: 3600 }, // Revalidate cache every hour
      },
    )

    const data = await response.json()
    if (!response.ok || data.error_message) {
      return NextResponse.json(
        {
          error: data.error_message || 'Error fetching restaurants',
        },
        { status: 500 },
      )
    }

    // Cache the successful response
    restaurantCache.set(cacheKey, data)

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return NextResponse.json(
      { error: 'Error fetching restaurants' },
      { status: 500 },
    )
  }
}
