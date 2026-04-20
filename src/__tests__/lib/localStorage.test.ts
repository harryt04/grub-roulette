import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  loadBlacklistFromLocalStorage,
  saveBlacklistToLocalStorage,
  loadPlaceDetailsCacheFromLocalStorage,
  savePlaceDetailsCacheToLocalStorage,
} from '@/lib/localStorage'

beforeEach(() => {
  localStorage.clear()
})

describe('loadBlacklistFromLocalStorage', () => {
  it('returns an empty array when key is absent', () => {
    expect(loadBlacklistFromLocalStorage()).toEqual([])
  })

  it('returns the parsed array when valid JSON is stored', () => {
    localStorage.setItem(
      'grubroulette_blacklist',
      JSON.stringify([{ place_id: 'abc', name: 'Pizza Palace' }]),
    )
    expect(loadBlacklistFromLocalStorage()).toEqual([
      { place_id: 'abc', name: 'Pizza Palace' },
    ])
  })

  it('returns [] for corrupted JSON', () => {
    localStorage.setItem('grubroulette_blacklist', 'not-valid-json{{')
    expect(loadBlacklistFromLocalStorage()).toEqual([])
  })

  it('returns [] when stored value is not an array', () => {
    localStorage.setItem('grubroulette_blacklist', JSON.stringify({ foo: 'bar' }))
    expect(loadBlacklistFromLocalStorage()).toEqual([])
  })

  it('returns [] for an empty stored array', () => {
    localStorage.setItem('grubroulette_blacklist', '[]')
    expect(loadBlacklistFromLocalStorage()).toEqual([])
  })
})

describe('saveBlacklistToLocalStorage', () => {
  it('writes the blacklist as JSON to localStorage', () => {
    const blacklist = [{ place_id: 'x1', name: 'Burger Barn' }]
    saveBlacklistToLocalStorage(blacklist as any)
    const stored = localStorage.getItem('grubroulette_blacklist')
    expect(JSON.parse(stored!)).toEqual(blacklist)
  })

  it('writes an empty array correctly', () => {
    saveBlacklistToLocalStorage([])
    expect(localStorage.getItem('grubroulette_blacklist')).toBe('[]')
  })
})

describe('loadPlaceDetailsCacheFromLocalStorage', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns an empty Map when key is absent', () => {
    const cache = loadPlaceDetailsCacheFromLocalStorage()
    expect(cache.size).toBe(0)
  })

  it('returns populated Map when cache is within 1 hour', () => {
    vi.useFakeTimers()
    const now = new Date('2024-01-08T12:00:00').getTime()
    vi.setSystemTime(now)

    const data = [['place1', { name: 'Test Place' }]]
    localStorage.setItem(
      'placeDetailsCache',
      JSON.stringify({ data, timestamp: now - 1000 }), // 1 second old
    )

    const cache = loadPlaceDetailsCacheFromLocalStorage()
    expect(cache.size).toBe(1)
    expect(cache.get('place1')).toEqual({ name: 'Test Place' })
  })

  it('returns empty Map and removes key when cache is older than 1 hour', () => {
    vi.useFakeTimers()
    const now = new Date('2024-01-08T12:00:00').getTime()
    vi.setSystemTime(now)

    const staleTimestamp = now - 3_601_000 // more than 1 hour ago
    localStorage.setItem(
      'placeDetailsCache',
      JSON.stringify({ data: [['p1', {}]], timestamp: staleTimestamp }),
    )

    const cache = loadPlaceDetailsCacheFromLocalStorage()
    expect(cache.size).toBe(0)
    expect(localStorage.getItem('placeDetailsCache')).toBeNull()
  })

  it('returns empty Map for corrupted JSON', () => {
    localStorage.setItem('placeDetailsCache', '{not:valid}')
    expect(loadPlaceDetailsCacheFromLocalStorage().size).toBe(0)
  })
})

describe('savePlaceDetailsCacheToLocalStorage', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('writes cache entries and timestamp to localStorage', () => {
    vi.useFakeTimers()
    const now = new Date('2024-01-08T12:00:00').getTime()
    vi.setSystemTime(now)

    const cache = new Map<string, unknown>([['place1', { name: 'Test' }]])
    savePlaceDetailsCacheToLocalStorage(cache)

    const stored = JSON.parse(localStorage.getItem('placeDetailsCache')!)
    expect(stored.timestamp).toBe(now)
    expect(stored.data).toEqual([['place1', { name: 'Test' }]])
  })

  it('writes empty data array for an empty Map', () => {
    savePlaceDetailsCacheToLocalStorage(new Map())
    const stored = JSON.parse(localStorage.getItem('placeDetailsCache')!)
    expect(stored.data).toEqual([])
  })
})
