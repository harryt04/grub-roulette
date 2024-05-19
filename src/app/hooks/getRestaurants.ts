import axios from 'axios'

export type GetRestaurantRequest = {
  latitude: number
  longitude: number
  radius: number
  radiusUnits?: 'miles' | 'kilometers'
  type?: string
}

export const getRestaurants = async (options: GetRestaurantRequest) => {
  if (!options.latitude || !options.longitude || !options.radius) return null
  const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY'
  const endpoint = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`

  try {
    const response = await axios.get(endpoint, {
      params: {
        location: `${options.latitude},${options.longitude}`,
        radius:
          options.radiusUnits === 'kilometers'
            ? options.radius
            : options.radius * 1609.34, // Convert miles to meters
        type: 'restaurant',
        keyword: options.type,
        key: apiKey,
      },
    })

    const restaurants = response.data.results
    return restaurants
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return []
  }
}

export default getRestaurants
