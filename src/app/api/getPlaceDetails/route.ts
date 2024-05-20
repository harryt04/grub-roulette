import axios from 'axios'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { place_id } = body

  if (!place_id) {
    return NextResponse.json(
      { error: 'Missing required parameter: place_id' },
      { status: 400 },
    )
  }

  const endpoint = `https://maps.googleapis.com/maps/api/place/details/json`
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  try {
    const response = await axios.get(endpoint, {
      params: {
        place_id: place_id,
        key: apiKey,
      },
    })

    if (response.data.status !== 'OK') {
      return NextResponse.json(
        {
          error: response.data.error_message || 'Error fetching place details',
        },
        { status: 500 },
      )
    }

    return NextResponse.json(response.data.result, { status: 200 })
  } catch (error) {
    console.error('Error fetching place details:', error)
    return NextResponse.json(
      { error: 'Error fetching place details' },
      { status: 500 },
    )
  }
}
