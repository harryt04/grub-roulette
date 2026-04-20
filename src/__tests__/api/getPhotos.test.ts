import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/getPhotos/route'

const makeRequest = (body: object) =>
  new Request('http://localhost/api/getPhotos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as NextRequest

beforeEach(() => {
  vi.stubEnv('GOOGLE_MAPS_API_KEY', 'TEST_KEY')
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('POST /api/getPhotos', () => {
  it('returns 400 when photos field is missing', async () => {
    const req = makeRequest({})
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain('photos')
  })

  it('returns 400 when photos is null', async () => {
    const req = makeRequest({ photos: null })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 for an empty photos array (bug fix)', async () => {
    const req = makeRequest({ photos: [] })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 200 with an array of photo URLs for valid references', async () => {
    const req = makeRequest({ photos: ['REF_A', 'REF_B'] })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body: string[] = await res.json()
    expect(body).toHaveLength(2)
    expect(body[0]).toContain('REF_A')
    expect(body[1]).toContain('REF_B')
  })

  it('returns a single-element array for a single photo reference', async () => {
    const req = makeRequest({ photos: ['ONLY_REF'] })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body: string[] = await res.json()
    expect(body).toHaveLength(1)
    expect(body[0]).toContain('ONLY_REF')
  })

  it('includes maxwidth=400 in each returned URL', async () => {
    const req = makeRequest({ photos: ['ANY_REF'] })
    const res = await POST(req)
    const body: string[] = await res.json()
    expect(body[0]).toContain('maxwidth=400')
  })

  it('returns "" for an empty string reference in the array', async () => {
    const req = makeRequest({ photos: [''] })
    const res = await POST(req)
    const body: string[] = await res.json()
    expect(body[0]).toBe('')
  })

  it('each URL contains the API key', async () => {
    const req = makeRequest({ photos: ['REF_KEY_TEST'] })
    const res = await POST(req)
    const body: string[] = await res.json()
    expect(body[0]).toContain('key=TEST_KEY')
  })

  it('returned URLs do not contain trailing whitespace', async () => {
    const req = makeRequest({ photos: ['TRIM_TEST'] })
    const res = await POST(req)
    const body: string[] = await res.json()
    expect(body[0]).toBe(body[0].trim())
  })
})
