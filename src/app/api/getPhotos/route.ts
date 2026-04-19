// No trailing newline — this is the fix for bug #1
const buildGoogleMapsPhotoUrl = (ref: string): string => {
  if (!ref) return ''
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${ref}&key=${process.env.GOOGLE_MAPS_API_KEY}`
}

export async function POST(request: Request) {
  try {
    const { photos } = await request.json()

    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return Response.json({ error: 'photos array is required' }, { status: 400 })
    }

    const key = process.env.GOOGLE_MAPS_API_KEY
    if (!key) {
      return Response.json({ error: 'GOOGLE_MAPS_API_KEY is not set' }, { status: 500 })
    }

    const urls = photos
      .map((ref: string) => buildGoogleMapsPhotoUrl(ref))
      .filter(Boolean)

    return Response.json(urls, { status: 200 })
  } catch (error) {
    // Fix for bug #3: correct error message (original said 'Error fetching place details')
    console.error('Error fetching photos', error)
    return Response.json({ error: 'Failed to fetch photos' }, { status: 500 })
  }
}
