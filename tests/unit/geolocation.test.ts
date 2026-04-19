import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useGeolocation } from '@/hooks/use-geolocation'

describe('useGeolocation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns location on success', async () => {
    const mockGetCurrentPosition = vi.fn((onSuccess) => {
      onSuccess({
        coords: { latitude: 40.7128, longitude: -74.0060 },
      } as GeolocationPosition)
    })
    
    vi.stubGlobal('navigator', {
      geolocation: { getCurrentPosition: mockGetCurrentPosition },
    })

    const { result } = renderHook(() => useGeolocation())
    
    await waitFor(() => {
      expect(result.current.location).toEqual({ latitude: 40.7128, longitude: -74.0060 })
      expect(result.current.geoError).toBeNull()
    })
  })

  it('returns PERMISSION_DENIED error', async () => {
    const mockGetCurrentPosition = vi.fn((_, onError) => {
      const error = {
        code: 1, // PERMISSION_DENIED
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
        message: 'Permission denied',
      } as GeolocationPositionError
      onError(error)
    })
    
    vi.stubGlobal('navigator', {
      geolocation: { getCurrentPosition: mockGetCurrentPosition },
    })

    const { result } = renderHook(() => useGeolocation())
    
    await waitFor(() => {
      expect(result.current.location).toBeNull()
      expect(result.current.geoError).toBe('Geolocation permission denied')
    })
  })

  it('returns unsupported browser error', async () => {
    vi.stubGlobal('navigator', { geolocation: undefined })

    const { result } = renderHook(() => useGeolocation())
    
    expect(result.current.geoError).toBe('Geolocation is not supported by your browser')
  })

  it('returns POSITION_UNAVAILABLE error', async () => {
    const mockGetCurrentPosition = vi.fn((_, onError) => {
      const error = {
        code: 2, // POSITION_UNAVAILABLE
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
        message: 'Position unavailable',
      } as GeolocationPositionError
      onError(error)
    })
    
    vi.stubGlobal('navigator', {
      geolocation: { getCurrentPosition: mockGetCurrentPosition },
    })

    const { result } = renderHook(() => useGeolocation())
    
    await waitFor(() => {
      expect(result.current.geoError).toBe('Position unavailable')
    })
  })

  it('returns TIMEOUT error', async () => {
    const mockGetCurrentPosition = vi.fn((_, onError) => {
      const error = {
        code: 3, // TIMEOUT
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
        message: 'Request timeout',
      } as GeolocationPositionError
      onError(error)
    })
    
    vi.stubGlobal('navigator', {
      geolocation: { getCurrentPosition: mockGetCurrentPosition },
    })

    const { result } = renderHook(() => useGeolocation())
    
    await waitFor(() => {
      expect(result.current.geoError).toBe('Geolocation request timed out')
    })
  })
})
