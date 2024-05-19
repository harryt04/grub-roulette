import { useState, useEffect } from 'react'

export type LatLong = {
  latitude: number
  longitude: number
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<LatLong>()
  const [error, setError] = useState<string>()

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

    const error = () => {
      setError('Unable to retrieve your location')
    }

    navigator.geolocation.getCurrentPosition(success, error)
  }, [])

  return { location, error }
}

export default useGeolocation
