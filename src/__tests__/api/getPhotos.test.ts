import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, clearCache } from '@/app/api/getPhotos/route'

const makeRequest = (reference: string) => {
  const url = new URL(
    `http://localhost/api/getPhotos?reference=${encodeURIComponent(reference)}`,
  )
  return new NextRequest(url, { method: 'GET' })
}

beforeEach(() => {
  vi.stubEnv('GOOGLE_MAPS_API_KEY', 'TEST_KEY')
  clearCache()
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.clearAllMocks()
})

describe('GET /api/getPhotos', () => {
  it('returns 500 when API key is missing', async () => {
    vi.stubEnv('GOOGLE_MAPS_API_KEY', '')
    const req = makeRequest('REF_A')
    const res = await GET(req)
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toContain('API key')
  })

  it('returns 400 when reference parameter is missing', async () => {
    const url = new URL('http://localhost/api/getPhotos')
    const req = new NextRequest(url, { method: 'GET' })
    const res = await GET(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain('reference')
  })

  it('returns 400 when reference is null', async () => {
    const url = new URL('http://localhost/api/getPhotos?reference=null')
    const req = new NextRequest(url, { method: 'GET' })
    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it('includes Cache-Control: public, max-age=3600 in response headers', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('image bytes', {
          status: 200,
          headers: {
            'content-type': 'image/jpeg',
          },
        }),
      ),
    )

    const req = makeRequest('REF_A')
    const res = await GET(req)
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=3600')
    expect(res.headers.get('Content-Type')).toBe('image/jpeg')
  })

  it('returns 200 with image/jpeg content-type on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('fake image data', {
          status: 200,
          headers: {
            'content-type': 'image/jpeg',
          },
        }),
      ),
    )

    const req = makeRequest('VALID_REF')
    const res = await GET(req)
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('image/jpeg')
    const body = await res.text()
    expect(body).toBe('fake image data')
  })

  it('forwards status code from Google API on failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('Invalid reference', {
          status: 404,
        }),
      ),
    )

    const req = makeRequest('INVALID_REF')
    const res = await GET(req)
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toContain('Failed to fetch photo')
  })

  it('includes maxwidth=400 in the Google API request', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('image', {
          status: 200,
          headers: { 'content-type': 'image/jpeg' },
        }),
      ),
    )

    const req = makeRequest('REF_WITH_MAXWIDTH')
    await GET(req)

    const fetchFn = vi.mocked(global.fetch)
    expect(fetchFn).toHaveBeenCalledWith(
      expect.stringContaining('maxwidth=400'),
    )
    expect(fetchFn).toHaveBeenCalledWith(
      expect.stringContaining('photoreference=REF_WITH_MAXWIDTH'),
    )
    expect(fetchFn).toHaveBeenCalledWith(
      expect.stringContaining('key=TEST_KEY'),
    )
  })

  it('returns 500 on fetch error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network error')),
    )

    const req = makeRequest('REF_ERROR')
    const res = await GET(req)
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toContain('proxy')
  })

  it('handles empty reference parameter as missing', async () => {
    const url = new URL('http://localhost/api/getPhotos?reference=')
    const req = new NextRequest(url, { method: 'GET' })
    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it('decodes URL-encoded reference parameter', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('image', {
          status: 200,
          headers: { 'content-type': 'image/jpeg' },
        }),
      ),
    )

    const encodedRef = encodeURIComponent('REF/WITH+SPECIAL')
    const url = new URL(
      `http://localhost/api/getPhotos?reference=${encodedRef}`,
    )
    const req = new NextRequest(url, { method: 'GET' })
    await GET(req)

    const fetchFn = vi.mocked(global.fetch)
    expect(fetchFn).toHaveBeenCalledWith(
      expect.stringContaining('REF%2FWITH%2BSPECIAL'),
    )
  })

  it('returns cached photo buffer for identical requests', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response('fake image data', {
        status: 200,
        headers: {
          'content-type': 'image/jpeg',
        },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const req1 = makeRequest('REF_PHOTO')
    const res1 = await GET(req1)
    expect(res1.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    // Second identical request should use cache
    const req2 = makeRequest('REF_PHOTO')
    const res2 = await GET(req2)
    expect(res2.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(1) // Still 1, not 2
    expect(res2.headers.get('Content-Type')).toBe('image/jpeg')
  })
})
