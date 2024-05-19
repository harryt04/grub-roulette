import { useState, useEffect } from 'react'

export type LatLong = {
  latitude: number
  longitude: number
}

export enum GeoLocationError {
  PERMISSION_DENIED = 'Geolocation permission denied',
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<LatLong | null>(null)
  const [geoLocationError, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    const success = (position: GeolocationPosition) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      })
    }

    const error = (err: GeolocationPositionError) => {
      console.log('err: ', err)
      switch (err.code) {
        case err.PERMISSION_DENIED:
          setError('Geolocation permission denied')
          break
        case err.POSITION_UNAVAILABLE:
          setError('Position unavailable')
          break
        case err.TIMEOUT:
          setError('Geolocation request timed out')
          break
        default:
          setError('An unknown error occurred')
          break
      }
    }

    // Request geolocation access directly
    navigator.geolocation.getCurrentPosition(success, error)
  }, [])

  return { location, geoLocationError }
}

export default useGeolocation
