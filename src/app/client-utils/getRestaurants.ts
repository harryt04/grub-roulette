import { GetRestaurantRequest } from '../types/location'

type RawPlace = {
  name: string
  place_id: string
  [key: string]: unknown
}

export const getRestaurants = async (
  options: GetRestaurantRequest,
): Promise<RawPlace[] | null> => {
  if ((!options.latitude || !options.longitude) && !options.zip) return null
  if (!options.radius) return null

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10_000)

  try {
    const response = await fetch('/api/getRestaurants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude: options.latitude,
        longitude: options.longitude,
        zip: options.zip,
        radius: options.radius,
        radiusUnits: options.radiusUnits,
        keywords: options.keywords,
      }),
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    return data.results
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return null
  } finally {
    clearTimeout(timeoutId)
  }
}

export const getPlaceDetails = async (
  placeId: string,
): Promise<unknown | null> => {
  if (!placeId) return null

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10_000)

  try {
    const response = await fetch('/api/getPlaceDetails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ place_id: placeId }),
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error('Error fetching place details:', error)
    return null
  } finally {
    clearTimeout(timeoutId)
  }
}

export const getPhotos = async (
  photoReferences: string[],
): Promise<string[] | null> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10_000)

  try {
    const response = await fetch('/api/getPhotos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photos: photoReferences }),
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error('Error fetching photos:', error)
    return null
  } finally {
    clearTimeout(timeoutId)
  }
}
