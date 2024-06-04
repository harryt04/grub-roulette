import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { place_id } = body

  if (!place_id) {
    return NextResponse.json(
      { error: 'Missing required parameter: place_id' },
      { status: 400 },
    )
  }

  try {
    const endpoint = `https://maps.googleapis.com/maps/api/place/details/json`
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || ''

    const url = new URL(endpoint)
    url.searchParams.append('place_id', place_id)
    url.searchParams.append('key', apiKey)

    const response = await fetch(url.toString(), {
      next: {
        revalidate: 3600, // Cache for 1 hour
        tags: ['place-details'], // Tag for cache invalidation
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      const errorMessage =
        errorData.error_message || 'Error fetching place details'
      return NextResponse.json({ error: errorMessage }, { status: 500 })
    }

    const responseData = await response.json()

    // Trigger revalidation for the 'place-details' tag
    revalidateTag('place-details')

    return NextResponse.json(responseData.result, { status: 200 })
  } catch (error) {
    console.error('Error fetching place details:', error)
    return NextResponse.json(
      { error: 'Error fetching place details' },
      { status: 500 },
    )
  }
}
