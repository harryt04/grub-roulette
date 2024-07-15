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
    const response = await fetch(
      `${endpoint}?place_id=${place_id}&key=${apiKey}`,
      {
        next: { revalidate: 86400 }, // Revalidate cache every day
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
