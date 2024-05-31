export type GetRestaurantRequest = {
  latitude: number
  longitude: number
  radius: number
  radiusUnits?: 'miles' | 'kilometers'
  keywords?: string
}

export type GetRestaurantResponse = {
  address?: string
  description?: string
  directionsUrl?: string
  name: string
  place_id: string
  phone?: string
  photos?: string[]
  rating?: number
  totalRatings?: number
  website?: string
}

export const mapRestaurantResponse = (
  restaurants: any,
): GetRestaurantResponse => {
  return restaurants.map((r: any) => ({
    directionsUrl: buildGoogleMapsUrl(r.vicinity),
    name: r.name,
    rating: r.rating,
    totalRatings: r.user_ratings_total,
  }))
}

export const buildGoogleMapsUrl = (address: string): string => {
  const baseUrl = 'https://www.google.com/maps/dir/?api=1'
  const destination = encodeURIComponent(address)
  return `${baseUrl}&destination=${destination}`
}
