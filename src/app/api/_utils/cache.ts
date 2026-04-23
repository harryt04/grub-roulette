interface CacheEntry<T> {
  value: T
  ts: number
}

interface TTLCache<T> {
  get(key: string): T | undefined
  set(key: string, value: T): void
  has(key: string): boolean
  clear(): void
}

export function createTTLCache<T>(ttlMs: number = 3600000): TTLCache<T> {
  const map = new Map<string, CacheEntry<T>>()

  return {
    get(key: string): T | undefined {
      const entry = map.get(key)
      if (!entry) {
        return undefined
      }

      const isExpired = Date.now() - entry.ts >= ttlMs
      if (isExpired) {
        map.delete(key)
        return undefined
      }

      return entry.value
    },

    set(key: string, value: T): void {
      map.set(key, { value, ts: Date.now() })
    },

    has(key: string): boolean {
      const entry = map.get(key)
      if (!entry) {
        return false
      }

      const isExpired = Date.now() - entry.ts >= ttlMs
      if (isExpired) {
        map.delete(key)
        return false
      }

      return true
    },

    clear(): void {
      map.clear()
    },
  }
}
