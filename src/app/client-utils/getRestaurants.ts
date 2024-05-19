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
      type: options.type,
    })

    const restaurants = response.data.results
    return restaurants
  } catch (error) {
    console.error('Error fetching restaurants:', JSON.stringify(error))
    return []
  }
}
