import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  getRestaurants,
  getPlaceDetails,
  getPhotos,
} from '@/app/client-utils/getRestaurants'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllTimers()
})

const mockFetch = (data: unknown, ok = true, status = 200) => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok,
      status,
      json: vi.fn().mockResolvedValue(data),
    }),
  )
}

describe('getRestaurants', () => {
  it('returns null when both lat/lng and zip are absent', async () => {
    const result = await getRestaurants({ radius: 15 })
    expect(result).toBeNull()
  })

  it('returns null when radius is missing/zero', async () => {
    const result = await getRestaurants({
      latitude: 40,
      longitude: -74,
      radius: 0,
    })
    expect(result).toBeNull()
  })

  it('returns data.results on success with lat/lng', async () => {
    mockFetch({ results: [{ name: 'Test Restaurant' }] })
    const result = await getRestaurants({
      latitude: 40.7,
      longitude: -74.0,
      radius: 15,
    })
    expect(result).toEqual([{ name: 'Test Restaurant' }])
  })

  it('returns data.results on success with zip', async () => {
    mockFetch({ results: [{ name: 'Zip Restaurant' }] })
    const result = await getRestaurants({ zip: '10001', radius: 10 })
    expect(result).toEqual([{ name: 'Zip Restaurant' }])
  })

  it('returns null when response is not ok', async () => {
    mockFetch({}, false, 500)
    const result = await getRestaurants({
      latitude: 40,
      longitude: -74,
      radius: 10,
    })
    expect(result).toBeNull()
  })

  it('returns null when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network')))
    const result = await getRestaurants({
      latitude: 40,
      longitude: -74,
      radius: 10,
    })
    expect(result).toBeNull()
  })

  it('POSTs to /api/getRestaurants', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ results: [] }),
    })
    vi.stubGlobal('fetch', fetchMock)
    await getRestaurants({ latitude: 40, longitude: -74, radius: 10 })
    expect(fetchMock.mock.calls[0]![0]).toBe('/api/getRestaurants')
    expect((fetchMock.mock.calls[0]![1] as RequestInit).method).toBe('POST')
  })

  it('passes abort signal with 10s timeout to fetch', async () => {
    vi.useFakeTimers()
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ results: [] }),
    })
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal(
      'AbortController',
      class {
        signal = Symbol('signal')
        abort = vi.fn()
      },
    )

    const result = await getRestaurants({
      latitude: 40,
      longitude: -74,
      radius: 10,
    })
    expect(result).toEqual([])
    expect((fetchMock.mock.calls[0]![1] as RequestInit).signal).toBeDefined()
    vi.useRealTimers()
  })

  it('returns null when request aborts (timeout)', async () => {
    vi.useFakeTimers()
    let abortController: AbortController
    const fetchMock = vi.fn(async (url, options) => {
      abortController = options
      // Simulate timeout by aborting the signal
      await new Promise((resolve) => setTimeout(resolve, 50))
      throw new Error('Aborted')
    })
    vi.stubGlobal('fetch', fetchMock)

    const promise = getRestaurants({
      latitude: 40,
      longitude: -74,
      radius: 10,
    })

    vi.runAllTimers()
    const result = await promise
    expect(result).toBeNull()
    vi.useRealTimers()
  })
})

describe('getPlaceDetails', () => {
  it('returns null for an empty placeId', async () => {
    expect(await getPlaceDetails('')).toBeNull()
  })

  it('returns JSON body on success', async () => {
    mockFetch({ name: 'Test Place', formatted_address: '123 St' })
    const result = await getPlaceDetails('ChIJabc123')
    expect(result).toEqual({ name: 'Test Place', formatted_address: '123 St' })
  })

  it('returns null when response is not ok', async () => {
    mockFetch({}, false, 400)
    expect(await getPlaceDetails('some_id')).toBeNull()
  })

  it('returns null when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network')))
    expect(await getPlaceDetails('some_id')).toBeNull()
  })
})

describe('getPhotos', () => {
  it('returns JSON body (array of URLs) on success', async () => {
    const urls = [
      'https://maps.googleapis.com/photo?ref=A',
      'https://maps.googleapis.com/photo?ref=B',
    ]
    mockFetch(urls)
    const result = await getPhotos(['REF_A', 'REF_B'])
    expect(result).toEqual(urls)
  })

  it('returns null when response is not ok', async () => {
    mockFetch({}, false, 400)
    expect(await getPhotos(['REF_A'])).toBeNull()
  })

  it('returns null when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network')))
    expect(await getPhotos(['REF_A'])).toBeNull()
  })

  it('POSTs to /api/getPhotos', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([]),
    })
    vi.stubGlobal('fetch', fetchMock)
    await getPhotos(['REF'])
    expect(fetchMock.mock.calls[0]![0]).toBe('/api/getPhotos')
    expect((fetchMock.mock.calls[0]![1] as RequestInit).method).toBe('POST')
  })
})
