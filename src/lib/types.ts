// Request sent to POST /api/getRestaurants
export type GetRestaurantRequest = {
  latitude?: number
  longitude?: number
  zip?: string
  radius: number
  radiusUnits?: 'miles' | 'kilometers'
  keywords?: string
}

// Shape of a single restaurant returned from any API route
export type GetRestaurantResponse = {
  name: string               // required
  place_id: string           // required
  address?: string
  closingTime?: string
  description?: string
  directionsUrl?: string
  googleMapsUrl?: string
  phone?: string
  photos?: string[]          // fully-formed photo URLs (no trailing newline)
  priceLevel?: number        // 0–4
  rating?: number
  totalRatings?: number
  website?: string
}

// Minimal entry stored in the blacklist
export type BlacklistEntry = {
  place_id: string
  name: string
}

// User location resolved from geolocation OR zip geocoding
export type LatLong = {
  latitude: number
  longitude: number
}

export type LocationState =
  | { type: 'latlong'; latitude: number; longitude: number }
  | { type: 'zip'; zip: string }
  | null
