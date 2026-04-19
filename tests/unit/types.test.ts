import { describe, it, expect } from 'vitest'
import {
  DEFAULT_KEYWORDS,
  RADIUS_DEFAULT,
  RADIUS_UNITS_DEFAULT,
  LS_BLACKLIST_KEY,
  LS_CACHE_KEY,
  CACHE_TTL_MS,
} from '@/lib/constants'

describe('constants', () => {
  it('DEFAULT_KEYWORDS has exactly 14 items', () => {
    expect(DEFAULT_KEYWORDS).toHaveLength(14)
  })

  it('DEFAULT_KEYWORDS contains expected values', () => {
    const expected = [
      'bakery','bar','bistro','buffet','burger','cafe','café',
      'diner','dining','grill','restaurant','sandwich','seafood','steakhouse',
    ]
    expect([...DEFAULT_KEYWORDS]).toEqual(expected)
  })

  it('RADIUS_DEFAULT is 1', () => {
    expect(RADIUS_DEFAULT).toBe(1)
  })

  it('RADIUS_UNITS_DEFAULT is miles', () => {
    expect(RADIUS_UNITS_DEFAULT).toBe('miles')
  })

  it('LS_BLACKLIST_KEY is correct', () => {
    expect(LS_BLACKLIST_KEY).toBe('grubroulette_blacklist')
  })

  it('LS_CACHE_KEY is correct', () => {
    expect(LS_CACHE_KEY).toBe('placeDetailsCache')
  })

  it('CACHE_TTL_MS is 3600000', () => {
    expect(CACHE_TTL_MS).toBe(3_600_000)
  })
})
