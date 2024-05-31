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

export const getPlaceDetails = async (placeId: string) => {
  if (!placeId) return null

  try {
    const response = await axios.post('/api/getPlaceDetails', {
      place_id: placeId,
    })

    const placeDetails = response.data
    return placeDetails
  } catch (error) {
    console.error('Error fetching place details:', JSON.stringify(error))
    return null
  }
}

export const getPhotos = async (photoReferences: string[]) => {
  try {
    const response = await axios.post('/api/getPhotos', {
      photos: photoReferences,
    })

    const photos = response.data
    return photos
  } catch (error) {
    console.error('Error fetching place details:', JSON.stringify(error))
    return null
  }
}
