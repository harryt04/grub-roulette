import axios from 'axios'
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

  const endpoint = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  try {
    const response = await axios.get(endpoint, {
      params: {
        location: `${latitude},${longitude}`,
        radius: radiusUnits === 'kilometers' ? radius * 1000 : radius * 1609.34, // Convert radius to meters
        type: 'restaurant',
        keyword: keywords,
        key: apiKey,
      },
    })

    return NextResponse.json(response.data, { status: 200 })
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return NextResponse.json(
      { error: 'Error fetching restaurants' },
      { status: 500 },
    )
  }
}
