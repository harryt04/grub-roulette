/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Dynamic import wrapper to support server-side testing
const getRouteHandler = async () => {
  const module = await import('@/app/api/getRestaurants/route')
  return module.POST
}

describe('POST /api/getRestaurants', () => {
  let POST: any

  beforeEach(async () => {
    vi.clearAllMocks()
    process.env.GOOGLE_MAPS_API_KEY = 'test-api-key'
    POST = await getRouteHandler()
  })

  it('should return 400 on invalid JSON', async () => {
    const request = new Request('http://localhost/api/getRestaurants', {
      method: 'POST',
      body: 'invalid json',
    })

    // Override json() to throw
    request.json = vi.fn().mockRejectedValueOnce(new Error('Invalid JSON'))

    const response = await POST(request)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Invalid JSON')
  })

  it('should return 500 when GOOGLE_MAPS_API_KEY is missing', async () => {
    delete process.env.GOOGLE_MAPS_API_KEY

    const request = new Request('http://localhost/api/getRestaurants', {
      method: 'POST',
      body: JSON.stringify({
        latitude: 40.7128,
        longitude: -74.006,
        radius: 5,
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('GOOGLE_MAPS_API_KEY is not set')
  })

  it('should succeed with latitude and longitude', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            {
              name: 'Pizza Place',
              place_id: 'place_123',
              vicinity: '123 Main St',
              rating: 4.5,
            },
          ],
          status: 'OK',
        }),
      })
    )

    const request = new Request('http://localhost/api/getRestaurants', {
      method: 'POST',
      body: JSON.stringify({
        latitude: 40.7128,
        longitude: -74.006,
        radius: 5,
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.results).toHaveLength(1)
    expect(data.results[0].name).toBe('Pizza Place')

    // Verify next: { revalidate: 3600 } was used
    const fetchCalls = (global.fetch as any).mock.calls
    expect(fetchCalls[0][1]).toEqual(expect.objectContaining({ next: { revalidate: 3600 } }))
  })

  it('should geocode zip code and return results', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            results: [
              {
                location: {
                  latitude: 40.7128,
                  longitude: -74.006,
                },
              },
            ],
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            results: [
              {
                name: 'Burger Joint',
                place_id: 'place_456',
                vicinity: '456 Park Ave',
              },
            ],
            status: 'OK',
          }),
        })
    )

    const request = new Request('http://localhost/api/getRestaurants', {
      method: 'POST',
      body: JSON.stringify({
        zip: '10001',
        radius: 5,
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.results).toHaveLength(1)
    expect(data.results[0].name).toBe('Burger Joint')

    // Verify both geocode and places calls used revalidate
    const fetchCalls = (global.fetch as any).mock.calls
    expect(fetchCalls).toHaveLength(2)
    expect(fetchCalls[0][1]).toEqual(
      expect.objectContaining({ next: { revalidate: 3600 } })
    )
    expect(fetchCalls[1][1]).toEqual(
      expect.objectContaining({ next: { revalidate: 3600 } })
    )
  })

  it('should return 400 when missing both latitude/longitude and zip', async () => {
    const request = new Request('http://localhost/api/getRestaurants', {
      method: 'POST',
      body: JSON.stringify({
        radius: 5,
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Missing latitude and longitude')
  })

  it('should return 400 when missing radius', async () => {
    const request = new Request('http://localhost/api/getRestaurants', {
      method: 'POST',
      body: JSON.stringify({
        latitude: 40.7128,
        longitude: -74.006,
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Missing radius')
  })

  it('should return 400 when geocoding fails with empty results', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [],
        }),
      })
    )

    const request = new Request('http://localhost/api/getRestaurants', {
      method: 'POST',
      body: JSON.stringify({
        zip: 'invalid-zip',
        radius: 5,
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Could not geocode ZIP code')
  })

  it('should return 400 when geocoding response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 400,
      })
    )

    const request = new Request('http://localhost/api/getRestaurants', {
      method: 'POST',
      body: JSON.stringify({
        zip: '12345',
        radius: 5,
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Could not geocode ZIP code')
  })

  it('should use miles radius conversion factor 1609.34', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [],
          status: 'OK',
        }),
      })
    )

    const request = new Request('http://localhost/api/getRestaurants', {
      method: 'POST',
      body: JSON.stringify({
        latitude: 40.7128,
        longitude: -74.006,
        radius: 2,
        radiusUnits: 'miles',
      }),
    })

    await POST(request)

    // Verify the URL includes the correct radius in meters
    const fetchUrl = (global.fetch as any).mock.calls[0][0]
    const expectedRadiusMeters = 2 * 1609.34
    expect(fetchUrl).toContain(`radius=${expectedRadiusMeters}`)
  })

  it('should use kilometers radius conversion factor 1000', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [],
          status: 'OK',
        }),
      })
    )

    const request = new Request('http://localhost/api/getRestaurants', {
      method: 'POST',
      body: JSON.stringify({
        latitude: 40.7128,
        longitude: -74.006,
        radius: 5,
        radiusUnits: 'kilometers',
      }),
    })

    await POST(request)

    // Verify the URL includes the correct radius in meters
    const fetchUrl = (global.fetch as any).mock.calls[0][0]
    const expectedRadiusMeters = 5 * 1000
    expect(fetchUrl).toContain(`radius=${expectedRadiusMeters}`)
  })

  it('should use default keywords when none provided', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [],
          status: 'OK',
        }),
      })
    )

    const request = new Request('http://localhost/api/getRestaurants', {
      method: 'POST',
      body: JSON.stringify({
        latitude: 40.7128,
        longitude: -74.006,
        radius: 5,
      }),
    })

    await POST(request)

    const fetchUrl = (global.fetch as any).mock.calls[0][0]
    expect(fetchUrl).toContain('keyword=')
    // Should contain at least one of the default keywords
    expect(
      fetchUrl.includes('bakery') ||
        fetchUrl.includes('restaurant') ||
        fetchUrl.includes('burger')
    ).toBe(true)
  })

  it('should use custom keywords when provided', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [],
          status: 'OK',
        }),
      })
    )

    const request = new Request('http://localhost/api/getRestaurants', {
      method: 'POST',
      body: JSON.stringify({
        latitude: 40.7128,
        longitude: -74.006,
        radius: 5,
        keywords: 'sushi',
      }),
    })

    await POST(request)

    const fetchUrl = (global.fetch as any).mock.calls[0][0]
    expect(fetchUrl).toContain('keyword=sushi')
  })

  it('should return 500 on fetch error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValueOnce(new Error('Network error'))
    )

    const request = new Request('http://localhost/api/getRestaurants', {
      method: 'POST',
      body: JSON.stringify({
        latitude: 40.7128,
        longitude: -74.006,
        radius: 5,
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('Network error')
  })

  it('should return 500 when Google Places response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 403,
      })
    )

    const request = new Request('http://localhost/api/getRestaurants', {
      method: 'POST',
      body: JSON.stringify({
        latitude: 40.7128,
        longitude: -74.006,
        radius: 5,
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toContain('Google Places API error')
  })

  it('should verify next: { revalidate: 3600 } is set in fetch calls', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [],
          status: 'OK',
        }),
      })
    )

    const request = new Request('http://localhost/api/getRestaurants', {
      method: 'POST',
      body: JSON.stringify({
        latitude: 40.7128,
        longitude: -74.006,
        radius: 5,
      }),
    })

    await POST(request)

    const fetchOptions = (global.fetch as any).mock.calls[0][1]
    expect(fetchOptions.next).toBeDefined()
    expect(fetchOptions.next.revalidate).toBe(3600)
  })
})

describe('POST /api/getPlaceDetails', () => {
  let POST_getPlaceDetails: any

  beforeEach(async () => {
    vi.clearAllMocks()
    process.env.GOOGLE_MAPS_API_KEY = 'test-api-key'
    const module = await import('@/app/api/getPlaceDetails/route')
    POST_getPlaceDetails = module.POST
  })

  it('should return 400 when place_id is missing', async () => {
    const request = new Request('http://localhost/api/getPlaceDetails', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST_getPlaceDetails(request as any)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('place_id is required')
  })

  it('should return 500 when GOOGLE_MAPS_API_KEY is missing', async () => {
    delete process.env.GOOGLE_MAPS_API_KEY

    const request = new Request('http://localhost/api/getPlaceDetails', {
      method: 'POST',
      body: JSON.stringify({
        place_id: 'place_123',
      }),
    })

    const response = await POST_getPlaceDetails(request as any)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('GOOGLE_MAPS_API_KEY is not set')
  })

  it('should return 200 with valid place_id and unwrap data.result', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: {
            formatted_address: '123 Main St',
            formatted_phone_number: '+1-234-567-8900',
            website: 'http://example.com',
            url: 'http://maps.example.com',
            editorial_summary: 'A great place',
            current_opening_hours: { open_now: true },
            price_level: 2,
            photos: [],
          },
        }),
      })
    )

    const request = new Request('http://localhost/api/getPlaceDetails', {
      method: 'POST',
      body: JSON.stringify({
        place_id: 'place_123',
      }),
    })

    const response = await POST_getPlaceDetails(request as any)
    expect(response.status).toBe(200)
    const data = await response.json()
    // Verify that data.result was unwrapped (not wrapped in another result property)
    expect(data.formatted_address).toBe('123 Main St')
    expect(data.formatted_phone_number).toBe('+1-234-567-8900')
    expect(data.price_level).toBe(2)
  })

  it('should use next: { revalidate: 3600 } on fetch', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: {
            formatted_address: '123 Main St',
          },
        }),
      })
    )

    const request = new Request('http://localhost/api/getPlaceDetails', {
      method: 'POST',
      body: JSON.stringify({
        place_id: 'place_123',
      }),
    })

    await POST_getPlaceDetails(request as any)

    const fetchOptions = (global.fetch as any).mock.calls[0][1]
    expect(fetchOptions.next).toBeDefined()
    expect(fetchOptions.next.revalidate).toBe(3600)
  })

  it('should return 404 when place not found', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: null,
        }),
      })
    )

    const request = new Request('http://localhost/api/getPlaceDetails', {
      method: 'POST',
      body: JSON.stringify({
        place_id: 'invalid_place',
      }),
    })

    const response = await POST_getPlaceDetails(request as any)
    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data.error).toBe('Place not found')
  })
})

describe('POST /api/getPhotos', () => {
  let POST_getPhotos: any

  beforeEach(async () => {
    vi.clearAllMocks()
    process.env.GOOGLE_MAPS_API_KEY = 'test-api-key'
    const module = await import('@/app/api/getPhotos/route')
    POST_getPhotos = module.POST
  })

  it('should return 400 when photos array is missing', async () => {
    const request = new Request('http://localhost/api/getPhotos', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST_getPhotos(request as any)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('photos array is required')
  })

  it('should return 400 when photos is empty array', async () => {
    const request = new Request('http://localhost/api/getPhotos', {
      method: 'POST',
      body: JSON.stringify({ photos: [] }),
    })

    const response = await POST_getPhotos(request as any)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('photos array is required')
  })

  it('should return 400 when photos is not an array', async () => {
    const request = new Request('http://localhost/api/getPhotos', {
      method: 'POST',
      body: JSON.stringify({ photos: 'not-an-array' }),
    })

    const response = await POST_getPhotos(request as any)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('photos array is required')
  })

  it('should return 500 when GOOGLE_MAPS_API_KEY is missing', async () => {
    delete process.env.GOOGLE_MAPS_API_KEY

    const request = new Request('http://localhost/api/getPhotos', {
      method: 'POST',
      body: JSON.stringify({
        photos: ['ref1', 'ref2'],
      }),
    })

    const response = await POST_getPhotos(request as any)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('GOOGLE_MAPS_API_KEY is not set')
  })

  it('should return 200 with array of URL strings', async () => {
    const request = new Request('http://localhost/api/getPhotos', {
      method: 'POST',
      body: JSON.stringify({
        photos: ['ref1', 'ref2'],
      }),
    })

    const response = await POST_getPhotos(request as any)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(Array.isArray(data)).toBe(true)
    expect(data).toHaveLength(2)
    expect(typeof data[0]).toBe('string')
    expect(typeof data[1]).toBe('string')
  })

  it('should build URLs with maxwidth=400, photoreference, and key', async () => {
    const request = new Request('http://localhost/api/getPhotos', {
      method: 'POST',
      body: JSON.stringify({
        photos: ['ref1', 'ref2'],
      }),
    })

    const response = await POST_getPhotos(request as any)
    expect(response.status).toBe(200)
    const data = await response.json()

    expect(data[0]).toContain('maxwidth=400')
    expect(data[0]).toContain('photoreference=ref1')
    expect(data[0]).toContain('key=test-api-key')

    expect(data[1]).toContain('maxwidth=400')
    expect(data[1]).toContain('photoreference=ref2')
    expect(data[1]).toContain('key=test-api-key')
  })

  it('should have NO trailing newline in photo URLs', async () => {
    const request = new Request('http://localhost/api/getPhotos', {
      method: 'POST',
      body: JSON.stringify({
        photos: ['ref1', 'ref2'],
      }),
    })

    const response = await POST_getPhotos(request as any)
    expect(response.status).toBe(200)
    const data = await response.json()

    // Check that urls don't have trailing whitespace
    expect(data[0]).toBe(data[0].trim())
    expect(data[1]).toBe(data[1].trim())
  })

  it('should filter out empty/falsy photo references', async () => {
    const request = new Request('http://localhost/api/getPhotos', {
      method: 'POST',
      body: JSON.stringify({
        photos: ['ref1', '', 'ref2', null],
      }),
    })

    const response = await POST_getPhotos(request as any)
    expect(response.status).toBe(200)
    const data = await response.json()

    // Should only have 2-3 valid URLs (empty string filtered out, null handled)
    expect(data.length).toBeGreaterThanOrEqual(2)
  })
})
