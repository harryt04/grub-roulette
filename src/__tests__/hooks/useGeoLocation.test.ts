import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useGeolocation } from '@/app/hooks/useGeoLocation'

// Helper to create a fake GeolocationPositionError
const makeGeoError = (code: number): GeolocationPositionError => ({
  code,
  message: '',
  PERMISSION_DENIED: 1,
  POSITION_UNAVAILABLE: 2,
  TIMEOUT: 3,
})

describe('useGeolocation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('starts with geoLoading=true, location=null, geoLocationError=null', () => {
    Object.defineProperty(global.navigator, 'geolocation', {
      value: { getCurrentPosition: vi.fn() },
      configurable: true,
    })
    const { result } = renderHook(() => useGeolocation())
    expect(result.current.geoLoading).toBe(true)
    expect(result.current.location).toBeNull()
    expect(result.current.geoLocationError).toBeNull()
  })

  it('sets location on success and geoLoading becomes false', async () => {
    const mockPosition = {
      coords: { latitude: 40.7128, longitude: -74.006 },
    } as GeolocationPosition

    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: vi.fn((success) => success(mockPosition)),
      },
      configurable: true,
    })

    const { result } = renderHook(() => useGeolocation())

    await waitFor(() => expect(result.current.geoLoading).toBe(false))
    expect(result.current.location).toEqual({
      latitude: 40.7128,
      longitude: -74.006,
    })
    expect(result.current.geoLocationError).toBeNull()
  })

  it('sets geoLocationError="Geolocation permission denied" on PERMISSION_DENIED', async () => {
    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: vi.fn((_, error) => error(makeGeoError(1))),
      },
      configurable: true,
    })

    const { result } = renderHook(() => useGeolocation())
    await waitFor(() => expect(result.current.geoLoading).toBe(false))
    expect(result.current.geoLocationError).toBe(
      'Geolocation permission denied',
    )
    expect(result.current.location).toBeNull()
  })

  it('sets geoLocationError="Position unavailable" on POSITION_UNAVAILABLE', async () => {
    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: vi.fn((_, error) => error(makeGeoError(2))),
      },
      configurable: true,
    })

    const { result } = renderHook(() => useGeolocation())
    await waitFor(() => expect(result.current.geoLoading).toBe(false))
    expect(result.current.geoLocationError).toBe('Position unavailable')
  })

  it('sets geoLocationError="Geolocation request timed out" on TIMEOUT', async () => {
    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: vi.fn((_, error) => error(makeGeoError(3))),
      },
      configurable: true,
    })

    const { result } = renderHook(() => useGeolocation())
    await waitFor(() => expect(result.current.geoLoading).toBe(false))
    expect(result.current.geoLocationError).toBe(
      'Geolocation request timed out',
    )
  })

  it('sets geoLocationError="An unknown error occurred" for unknown error code', async () => {
    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: vi.fn((_, error) => error(makeGeoError(99))),
      },
      configurable: true,
    })

    const { result } = renderHook(() => useGeolocation())
    await waitFor(() => expect(result.current.geoLoading).toBe(false))
    expect(result.current.geoLocationError).toBe('An unknown error occurred')
  })

  it('sets error when geolocation is not supported', async () => {
    Object.defineProperty(global.navigator, 'geolocation', {
      value: undefined,
      configurable: true,
    })

    const { result } = renderHook(() => useGeolocation())
    await waitFor(() => expect(result.current.geoLoading).toBe(false))
    expect(result.current.geoLocationError).toBe(
      'Geolocation is not supported by your browser',
    )
  })
})
