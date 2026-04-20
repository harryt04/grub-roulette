import type { GetRestaurantResponse } from '@/app/types/location'

export interface RawPlace {
  name: string
  place_id: string
  vicinity?: string
  rating?: number
  user_ratings_total?: number
  opening_hours?: { open_now?: boolean }
  business_status?: string
}

/**
 * Filters a raw Google Places API result array to only open, operational places.
 */
export function filterOpenPlaces(
  restaurants: RawPlace[] | null | undefined,
): RawPlace[] {
  if (!restaurants) return []
  return restaurants.filter(
    (r) =>
      r.opening_hours?.open_now === true && r.business_status === 'OPERATIONAL',
  )
}

/**
 * Selects a random place from placesMap that is not in usedPlaces and not blacklisted.
 * Blacklist matching is by place_id OR by name (either match excludes the place).
 * Returns undefined when no eligible places remain.
 */
export function selectRandomUnusedPlace(
  placesMap: Map<string, GetRestaurantResponse>,
  usedPlaces: string[],
  blacklist: GetRestaurantResponse[],
): GetRestaurantResponse | undefined {
  const unused = Array.from(placesMap.values()).filter(
    (place) =>
      !usedPlaces.includes(place.name) &&
      !blacklist.some(
        (b) => b.place_id === place.place_id || b.name === place.name,
      ),
  )
  if (unused.length === 0) return undefined
  return unused[Math.floor(Math.random() * unused.length)]
}
