export type GetRestaurantRequest = {
  latitude: number
  longitude: number
  radius: number
  radiusUnits?: 'miles' | 'kilometers'
  type?: string
}
