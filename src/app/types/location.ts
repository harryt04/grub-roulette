export type GetRestaurantRequest = {
  latitude: number
  longitude: number
  radius: number
  radiusUnits?: 'miles' | 'kilometers'
  keywords?: string
}

export type GetRestaurantResponse = {
  directionsUrl: string
  name: string
}
