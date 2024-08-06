import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { place_id }: { place_id: string } = await req.json()
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  const endpoint = `https://maps.googleapis.com/maps/api/place/details/json`

  if (!place_id) {
    return NextResponse.json(
      { error: 'Missing required parameter: place_id' },
      { status: 400 },
    )
  }
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing required environment variable: GOOGLE_MAPS_API_KEY' },
      { status: 400 },
    )
  }

  try {
    const response = await fetch(
      `${endpoint}?place_id=${place_id}&key=${apiKey}`,
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
    return NextResponse.json(data.result, { status: 200 })
  } catch (error) {
    console.error('Error fetching place details:', error)
    return NextResponse.json(
      { error: 'Error fetching place details' },
      { status: 500 },
    )
  }
}
