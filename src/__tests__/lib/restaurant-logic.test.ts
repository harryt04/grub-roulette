import { describe, it, expect, vi, afterEach } from 'vitest'
import { filterOpenPlaces, selectRandomUnusedPlace } from '@/lib/restaurant-logic'
import type { RawPlace } from '@/lib/restaurant-logic'
import type { GetRestaurantResponse } from '@/app/types/location'

// Helpers
const openOperational = (name: string, place_id = name): RawPlace => ({
  name,
  place_id,
  opening_hours: { open_now: true },
  business_status: 'OPERATIONAL',
})

const closedPlace = (name: string): RawPlace => ({
  name,
  place_id: name,
  opening_hours: { open_now: false },
  business_status: 'OPERATIONAL',
})

const closedBusiness = (name: string): RawPlace => ({
  name,
  place_id: name,
  opening_hours: { open_now: true },
  business_status: 'CLOSED_TEMPORARILY',
})

describe('filterOpenPlaces', () => {
  it('returns only open and operational places', () => {
    const input = [
      openOperational('Pizza A'),
      closedPlace('Burger B'),
      closedBusiness('Sushi C'),
      openOperational('Taco D'),
    ]
    const result = filterOpenPlaces(input)
    expect(result.map((r) => r.name)).toEqual(['Pizza A', 'Taco D'])
  })

  it('returns all places when all are open and operational', () => {
    const input = [openOperational('A'), openOperational('B')]
    expect(filterOpenPlaces(input)).toHaveLength(2)
  })

  it('returns [] when no places are open', () => {
    expect(filterOpenPlaces([closedPlace('A'), closedPlace('B')])).toEqual([])
  })

  it('returns [] for empty input', () => {
    expect(filterOpenPlaces([])).toEqual([])
  })

  it('returns [] for null input', () => {
    expect(filterOpenPlaces(null)).toEqual([])
  })

  it('returns [] for undefined input', () => {
    expect(filterOpenPlaces(undefined)).toEqual([])
  })

  it('excludes places with no opening_hours field', () => {
    const noHours: RawPlace = { name: 'X', place_id: 'X', business_status: 'OPERATIONAL' }
    expect(filterOpenPlaces([noHours])).toEqual([])
  })
})

describe('selectRandomUnusedPlace', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const makeMap = (names: string[]): Map<string, GetRestaurantResponse> => {
    const m = new Map<string, GetRestaurantResponse>()
    names.forEach((n) => m.set(n, { name: n, place_id: n }))
    return m
  }

  it('returns a place that is not in usedPlaces and not blacklisted', () => {
    const map = makeMap(['A', 'B', 'C'])
    const result = selectRandomUnusedPlace(map, ['A'], [])
    expect(result).toBeDefined()
    expect(['B', 'C']).toContain(result!.name)
  })

  it('returns undefined when all places are used', () => {
    const map = makeMap(['A', 'B'])
    expect(selectRandomUnusedPlace(map, ['A', 'B'], [])).toBeUndefined()
  })

  it('returns undefined when all remaining places are blacklisted by place_id', () => {
    const map = makeMap(['A', 'B'])
    const blacklist: GetRestaurantResponse[] = [
      { place_id: 'A', name: 'A' },
      { place_id: 'B', name: 'B' },
    ]
    expect(selectRandomUnusedPlace(map, [], blacklist)).toBeUndefined()
  })

  it('excludes places blacklisted by name even if place_id differs', () => {
    const map = new Map<string, GetRestaurantResponse>([
      ['Cafe X', { name: 'Cafe X', place_id: 'id_x' }],
    ])
    const blacklist: GetRestaurantResponse[] = [
      { place_id: 'different_id', name: 'Cafe X' },
    ]
    expect(selectRandomUnusedPlace(map, [], blacklist)).toBeUndefined()
  })

  it('excludes places blacklisted by place_id even if name differs', () => {
    const map = new Map<string, GetRestaurantResponse>([
      ['Cafe Y', { name: 'Cafe Y', place_id: 'shared_id' }],
    ])
    const blacklist: GetRestaurantResponse[] = [
      { place_id: 'shared_id', name: 'Different Name' },
    ]
    expect(selectRandomUnusedPlace(map, [], blacklist)).toBeUndefined()
  })

  it('returns the only unused, non-blacklisted place deterministically', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const map = makeMap(['A', 'B'])
    const result = selectRandomUnusedPlace(map, ['A'], [])
    expect(result?.name).toBe('B')
  })

  it('uses Math.random to select from multiple eligible places', () => {
    // With random = 0.9, Math.floor(0.9 * 2) = 1, so second item is returned
    vi.spyOn(Math, 'random').mockReturnValue(0.9)
    const map = makeMap(['A', 'B'])
    const result = selectRandomUnusedPlace(map, [], [])
    expect(result?.name).toBe('B')
  })

  it('returns undefined for an empty map', () => {
    expect(selectRandomUnusedPlace(new Map(), [], [])).toBeUndefined()
  })
})
