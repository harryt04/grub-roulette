import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/getRestaurants/route'

const makeRequest = (body: object) =>
  new Request('http://localhost/api/getRestaurants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as NextRequest

const mockFetchSuccess = (data: object, ok = true) => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok,
      json: vi.fn().mockResolvedValue(data),
    }),
  )
}

beforeEach(() => {
  vi.stubEnv('GOOGLE_MAPS_API_KEY', 'TEST_KEY')
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('POST /api/getRestaurants', () => {
  it('returns 400 when latitude, longitude, and zip are all missing', async () => {
    const req = makeRequest({ radius: 15, radiusUnits: 'miles' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when radius is missing', async () => {
    const req = makeRequest({ latitude: 40, longitude: -74 })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 for an unknown radiusUnits value', async () => {
    const req = makeRequest({
      latitude: 40,
      longitude: -74,
      radius: 5,
      radiusUnits: 'furlongs',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain('radiusUnits')
  })

  it('returns 200 with data for valid lat/lng request', async () => {
    mockFetchSuccess({ results: [{ name: 'Pizza Place' }], status: 'OK' })
    const req = makeRequest({
      latitude: 40.7,
      longitude: -74.0,
      radius: 15,
      radiusUnits: 'miles',
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.results[0].name).toBe('Pizza Place')
  })

  it('returns 500 when Google Places API returns an error_message', async () => {
    mockFetchSuccess({ error_message: 'Invalid key', results: [] })
    const req = makeRequest({
      latitude: 40,
      longitude: -74,
      radius: 10,
      radiusUnits: 'miles',
    })
    const res = await POST(req)
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBe('Invalid key')
  })

  it('returns 500 when fetch throws', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network error')),
    )
    const req = makeRequest({
      latitude: 40,
      longitude: -74,
      radius: 10,
      radiusUnits: 'miles',
    })
    const res = await POST(req)
    expect(res.status).toBe(500)
  })

  it('geocodes ZIP when lat/lng are absent and returns 200', async () => {
    // First fetch call = geocode, second = Places API
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          results: [{ location: { latitude: 40.7, longitude: -74.0 } }],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: vi
          .fn()
          .mockResolvedValue({ results: [{ name: 'Burger Joint' }] }),
      })
    vi.stubGlobal('fetch', fetchMock)

    const req = makeRequest({ zip: '10001', radius: 10, radiusUnits: 'miles' })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('returns 400 when ZIP geocoding returns ZERO_RESULTS', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi
          .fn()
          .mockResolvedValue({ status: 'ZERO_RESULTS', results: [] }),
      }),
    )
    const req = makeRequest({ zip: '00000', radius: 10, radiusUnits: 'miles' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 500 when GOOGLE_MAPS_API_KEY is missing during ZIP geocoding', async () => {
    vi.unstubAllEnvs()
    vi.stubEnv('GOOGLE_MAPS_API_KEY', '')
    const req = makeRequest({ zip: '10001', radius: 10, radiusUnits: 'miles' })
    const res = await POST(req)
    expect(res.status).toBe(500)
  })

  it('uses custom keywords when provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ results: [] }),
    })
    vi.stubGlobal('fetch', fetchMock)
    const req = makeRequest({
      latitude: 40,
      longitude: -74,
      radius: 10,
      radiusUnits: 'miles',
      keywords: 'sushi',
    })
    await POST(req)
    const calledUrl: string = fetchMock.mock.calls[0][0]
    expect(calledUrl).toContain('sushi')
  })
})
