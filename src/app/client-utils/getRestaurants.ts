import axios from 'axios'
import { GetRestaurantRequest } from '../types/location'

export const getRestaurants = async (options: GetRestaurantRequest) => {
  if (!options.latitude || !options.longitude || !options.radius) return null

  try {
    const response = await axios.post('/api/getRestaurants', {
      latitude: options.latitude,
      longitude: options.longitude,
      radius: options.radius,
      radiusUnits: options.radiusUnits,
      keywords: options.keywords,
    })

    const restaurants = response.data.results
    return restaurants
  } catch (error) {
    console.error('Error fetching restaurants:', JSON.stringify(error))
    return []
  }
}

export function buildGoogleMapsUrl(address: string): string {
  const baseUrl = 'https://www.google.com/maps/dir/?api=1'
  const destination = encodeURIComponent(address)
  return `${baseUrl}&destination=${destination}`
}
