import type { GetRestaurantResponse } from '@/app/types/location'

const BLACKLIST_KEY = 'grubroulette_blacklist'
const CACHE_KEY = 'placeDetailsCache'
const ONE_HOUR = 3_600_000

export function loadBlacklistFromLocalStorage(): GetRestaurantResponse[] {
  const data = localStorage.getItem(BLACKLIST_KEY)
  if (!data) return []
  try {
    const parsed = JSON.parse(data)
    return Array.isArray(parsed)
      ? parsed.filter(
          (item) =>
            typeof item?.place_id === 'string' &&
            typeof item?.name === 'string',
        )
      : []
  } catch {
    return []
  }
}

export function saveBlacklistToLocalStorage(
  blacklist: GetRestaurantResponse[],
): void {
  localStorage.setItem(BLACKLIST_KEY, JSON.stringify(blacklist))
}

export function loadPlaceDetailsCacheFromLocalStorage(): Map<string, unknown> {
  try {
    const cacheData = localStorage.getItem(CACHE_KEY)
    if (!cacheData) return new Map()
    const parsed = JSON.parse(cacheData)
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !('data' in parsed) ||
      !('timestamp' in parsed)
    ) {
      return new Map()
    }
    const { data, timestamp } = parsed
    if (!Array.isArray(data) || typeof timestamp !== 'number') {
      return new Map()
    }
    if (Date.now() - timestamp < ONE_HOUR) {
      return new Map<string, unknown>(data)
    }
    localStorage.removeItem(CACHE_KEY)
    return new Map()
  } catch {
    return new Map()
  }
}

export function savePlaceDetailsCacheToLocalStorage(
  cache: Map<string, unknown>,
): void {
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      data: Array.from(cache.entries()),
      timestamp: Date.now(),
    }),
  )
}
