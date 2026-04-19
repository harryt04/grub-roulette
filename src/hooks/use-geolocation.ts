'use client'

import { useState, useEffect } from 'react'
import type { LatLong } from '@/lib/types'

export function useGeolocation() {
  const [location, setLocation] = useState<LatLong | null>(null)
  const [geoError, setGeoError] = useState<string | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setGeoError(null)
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError('Geolocation permission denied')
            break
          case error.POSITION_UNAVAILABLE:
            setGeoError('Position unavailable')
            break
          case error.TIMEOUT:
            setGeoError('Geolocation request timed out')
            break
          default:
            setGeoError('An unknown error occurred')
        }
      }
    )
  }, [])

  return { location, geoError }
}
