import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/getPlaceDetails/route'

const makeRequest = (body: object) =>
  new Request('http://localhost/api/getPlaceDetails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as NextRequest

beforeEach(() => {
  vi.stubEnv('GOOGLE_MAPS_API_KEY', 'TEST_KEY')
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('POST /api/getPlaceDetails', () => {
  it('returns 400 when place_id is missing', async () => {
    const req = makeRequest({})
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain('place_id')
  })

  it('returns 400 when GOOGLE_MAPS_API_KEY is missing', async () => {
    vi.unstubAllEnvs()
    vi.stubEnv('GOOGLE_MAPS_API_KEY', '')
    const req = makeRequest({ place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4' })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain('GOOGLE_MAPS_API_KEY')
  })

  it('returns 200 with result for a valid place_id', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          result: { name: 'Test Restaurant', formatted_address: '123 Main St' },
        }),
      }),
    )
    const req = makeRequest({ place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4' })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.name).toBe('Test Restaurant')
  })

  it('returns 500 when Google API responds with non-ok status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({ error_message: 'REQUEST_DENIED' }),
      }),
    )
    const req = makeRequest({ place_id: 'bad_id' })
    const res = await POST(req)
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBe('REQUEST_DENIED')
  })

  it('returns 500 when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network')))
    const req = makeRequest({ place_id: 'some_id' })
    const res = await POST(req)
    expect(res.status).toBe(500)
  })
})
