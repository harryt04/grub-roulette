export async function POST(request: Request) {
  try {
    const { place_id } = await request.json()

    if (!place_id) {
      return Response.json({ error: 'place_id is required' }, { status: 400 })
    }

    const key = process.env.GOOGLE_MAPS_API_KEY
    if (!key) {
      return Response.json({ error: 'GOOGLE_MAPS_API_KEY is not set' }, { status: 500 })
    }

    const fields = [
      'formatted_address',
      'formatted_phone_number',
      'website',
      'url',
      'editorial_summary',
      'current_opening_hours',
      'price_level',
      'photos',
    ].join(',')

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=${fields}&key=${key}`
    const response = await fetch(url, { next: { revalidate: 3600 } })
    const data = await response.json()

    if (!data.result) {
      return Response.json({ error: 'Place not found' }, { status: 404 })
    }

    return Response.json(data.result, { status: 200 })
  } catch (error) {
    console.error('Error fetching place details', error)
    return Response.json({ error: 'Failed to fetch place details' }, { status: 500 })
  }
}
