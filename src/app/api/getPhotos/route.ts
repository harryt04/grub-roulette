import { NextRequest, NextResponse } from 'next/server'
import { buildGoogleMapsPhotoUrl } from '@/lib/google-maps'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { photos } = body

  if (!photos || !Array.isArray(photos) || photos.length === 0) {
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
