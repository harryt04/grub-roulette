import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { photos } = body

  if (!photos) {
    return NextResponse.json(
      { error: 'Missing required parameter: photos' },
      { status: 400 },
    )
  }

  const photoUrls = photos.map((photo: string) =>
    buildGoogleMapsPhotoUrl(photo),
  )

  return NextResponse.json(photoUrls, { status: 200 })
}

const buildGoogleMapsPhotoUrl = (photoReference: string): string => {
  if (!photoReference) return ''

  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${process.env.GOOGLE_MAPS_API_KEY}
  `
}
