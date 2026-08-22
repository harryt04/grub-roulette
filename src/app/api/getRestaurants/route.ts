import { GetRestaurantRequest } from '../../types/location'
import { NextRequest, NextResponse } from 'next/server'
import { convertRadiusToMeters } from '@/lib/google-maps'

export async function POST(req: NextRequest) {
  const body: GetRestaurantRequest = await req.json()
  const {
    latitude,
    longitude,
    locationQuery,
    radius,
    radiusUnits = 'miles',
    keywords,
  } = body
  if (radiusUnits && radiusUnits !== 'miles' && radiusUnits !== 'kilometers') {
    return NextResponse.json(
      { error: 'Invalid radiusUnits value. Must be "miles" or "kilometers".' },
      { status: 400 },
    )
  }

  let finalLatitude = latitude
  let finalLongitude = longitude

  // A manual location always overrides browser-provided coordinates.
  if (locationQuery?.trim()) {
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
        `${geocodeEndpoint}?address.addressLines=${encodeURIComponent(locationQuery.trim())}&key=${apiKey}`,
        {
          next: { revalidate: 3600 },
        },
      )

      const geocodeData = await geocodeResponse.json()

      if (!geocodeResponse.ok || geocodeData.status === 'ZERO_RESULTS') {
        return NextResponse.json(
          {
            error:
              geocodeData.error_message ||
              'Unable to determine the supplied location',
          },
          { status: 400 },
        )
      }

      const location = geocodeData.results?.[0]?.location

      if (!location) {
        return NextResponse.json(
          {
            error: 'Unable to determine coordinates for the supplied location',
          },
          { status: 400 },
        )
      }

      finalLatitude = location.latitude
      finalLongitude = location.longitude
    } catch (error) {
      console.error('Error geocoding location:', error)
      return NextResponse.json(
        { error: 'Error geocoding location' },
        { status: 500 },
      )
    }
  }

  if (!finalLatitude || !finalLongitude || !radius) {
    return NextResponse.json(
      {
        error:
          'Missing required parameters (latitude/longitude or location query, and radius)',
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

  const endpoint = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  const radiusInMeters = convertRadiusToMeters(radius, radiusUnits ?? 'miles')

  try {
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

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return NextResponse.json(
      { error: 'Error fetching restaurants' },
      { status: 500 },
    )
  }
}
