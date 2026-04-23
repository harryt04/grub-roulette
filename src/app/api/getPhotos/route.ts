import { NextRequest, NextResponse } from 'next/server'
import { fetchGooglePhoto } from '@/lib/google-maps'
import { createTTLCache } from '../_utils/cache'

interface CachedPhotoData {
  buffer: ArrayBuffer
  contentType: string
}

const photoCache = createTTLCache<CachedPhotoData>(3600000)

export function clearCache() {
  photoCache.clear()
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 },
    )
  }

  const searchParams = req.nextUrl.searchParams
  const photoReference = searchParams.get('reference')

  if (!photoReference || photoReference === 'null') {
    return NextResponse.json(
      { error: 'Missing required parameter: reference' },
      { status: 400 },
    )
  }

  // Check cache first
  const cachedPhoto = photoCache.get(photoReference)
  if (cachedPhoto) {
    return new NextResponse(cachedPhoto.buffer, {
      status: 200,
      headers: {
        'Content-Type': cachedPhoto.contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  }

  try {
    const response = await fetchGooglePhoto(photoReference, apiKey)

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch photo from Google Maps API' },
        { status: response.status },
      )
    }

    const buffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    // Cache the photo
    photoCache.set(photoReference, { buffer, contentType })

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Error fetching photo:', error)
    return NextResponse.json(
      { error: 'Failed to proxy photo' },
      { status: 500 },
    )
  }
}
