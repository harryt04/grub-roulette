export const DEFAULT_KEYWORDS = [
  'bakery',
  'bar',
  'bistro',
  'buffet',
  'burger',
  'cafe',
  'café',
  'diner',
  'dining',
  'grill',
  'restaurant',
  'sandwich',
  'seafood',
  'steakhouse',
] as const

export const RADIUS_DEFAULT = 1
export const RADIUS_UNITS_DEFAULT: 'miles' | 'kilometers' = 'miles'

export const LS_BLACKLIST_KEY = 'grubroulette_blacklist'
export const LS_CACHE_KEY = 'placeDetailsCache'
export const CACHE_TTL_MS = 3_600_000

export const NOT_FOUND_MSG =
  'No restaurants found matching your criteria. Try adjusting your search radius or keywords.'
export const SEEN_ALL_MSG =
  'You have seen all available restaurants in this area. Click again to start over.'
