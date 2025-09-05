export type GetRestaurantRequest = {
  latitude?: number
  longitude?: number
  zip?: string
  radius: number
  radiusUnits?: 'miles' | 'kilometers'
  keywords?: string
}

export type GetRestaurantResponse = {
  address?: string
  closingTime?: string
  description?: string
  directionsUrl?: string
  googleMapsUrl?: string
  name: string
  place_id: string
  phone?: string
  photos?: string[]
  priceLevel?: number
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

export function getClosingTime(schedule: string[]): string {
  if (!schedule) return ''
  // Get today's day of the week
  const today = new Date().getDay() // Sunday is 0, Monday is 1, ..., Saturday is 6

  // Map the day of the week to the corresponding string in the array
  const dayMap = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ]

  // Find the closing time for today's day
  for (const entry of schedule) {
    if (entry.startsWith(dayMap[today])) {
      const parts = entry.split('–')
      if (parts.length > 1) {
        const closingTime = parts[1].trim().replace(':00', '')
        return closingTime
      }
    }
  }

  return ''
}
