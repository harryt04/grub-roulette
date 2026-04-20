import { GetRestaurantRequest } from '../types/location'

export const getRestaurants = async (options: GetRestaurantRequest) => {
  if ((!options.latitude || !options.longitude) && !options.zip) return null
  if (!options.radius) return null

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
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    return data.results
  } catch (error) {
    console.error('Error fetching restaurants:', JSON.stringify(error))
    return []
  }
}

export const getPlaceDetails = async (placeId: string) => {
  if (!placeId) return null

  try {
    const response = await fetch('/api/getPlaceDetails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ place_id: placeId }),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error('Error fetching place details:', JSON.stringify(error))
    return null
  }
}

export const getPhotos = async (photoReferences: string[]) => {
  try {
    const response = await fetch('/api/getPhotos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photos: photoReferences }),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error('Error fetching place details:', JSON.stringify(error))
    return null
  }
}
