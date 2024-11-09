import { GetRestaurantRequest } from '../../types/location'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body: GetRestaurantRequest = await req.json()
  const { latitude, longitude, radius, radiusUnits = 'miles', keywords } = body

  if (!latitude || !longitude || !radius) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 },
    )
  }

  const defaultKeywords = 'restaurant|dining|eatery|food|cafe|bistro'
  const searchKeywords = keywords || defaultKeywords

  const endpoint = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  const radiusInMeters =
    radiusUnits === 'kilometers' ? radius * 1000 : radius * 1609.34

  try {
    const response = await fetch(
      `${endpoint}?location=${latitude},${longitude}&radius=${radiusInMeters}&type=restaurant&keyword=${encodeURIComponent(searchKeywords)}&key=${apiKey}`,
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
