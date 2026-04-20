import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  buildGoogleMapsUrl,
  getClosingTime,
  mapRestaurantResponse,
} from '@/app/types/location'

describe('buildGoogleMapsUrl', () => {
  it('builds a correct URL for a simple address', () => {
    const url = buildGoogleMapsUrl('123 Main St, Springfield')
    expect(url).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=123%20Main%20St%2C%20Springfield',
    )
  })

  it('encodes special characters in the address', () => {
    const url = buildGoogleMapsUrl('Café & Bar, New York')
    expect(url).toContain('destination=')
    expect(url).not.toContain(' ') // spaces must be encoded
    expect(url).not.toContain('&Bar') // & must be encoded
  })

  it('handles an empty string address', () => {
    const url = buildGoogleMapsUrl('')
    expect(url).toBe('https://www.google.com/maps/dir/?api=1&destination=')
  })
})

describe('getClosingTime', () => {
  // Use fake timers to control "today"
  // new Date().getDay() — Sunday=0, Monday=1, ..., Saturday=6
  // We'll pin the date to a Monday (getDay() === 1)

  beforeEach(() => {
    // Pin to a Monday: 2024-01-08 is a Monday
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-08T10:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the closing time for today when schedule uses en-dash', () => {
    const schedule = [
      'Sunday: 10:00 AM \u2013 9:00 PM',
      'Monday: 9:00 AM \u2013 10:00 PM',
      'Tuesday: 9:00 AM \u2013 10:00 PM',
    ]
    // NOTE: replace(':00', '') replaces FIRST occurrence, so "10:00 PM" → "10 PM"
    expect(getClosingTime(schedule)).toBe('10 PM')
  })

  it('strips :00 from the closing time minutes', () => {
    const schedule = ['Monday: 9:00 AM \u2013 10:00 PM']
    // replace(':00', '') replaces FIRST occurrence: "10:00 PM" -> "10 PM"
    expect(getClosingTime(schedule)).toBe('10 PM')
  })

  it('returns "" when schedule is undefined', () => {
    expect(getClosingTime(undefined as unknown as string[])).toBe('')
  })

  it('returns "" when schedule is an empty array', () => {
    expect(getClosingTime([])).toBe('')
  })

  it('returns "" when today is not in the schedule', () => {
    // Only has Sunday entry; today is Monday
    const schedule = ['Sunday: 10:00 AM \u2013 9:00 PM']
    expect(getClosingTime(schedule)).toBe('')
  })

  it('documents the known bug: returns "" when hyphen is used instead of en-dash', () => {
    // BUG: function splits on en-dash U+2013, not regular hyphen U+002D
    const schedule = ['Monday: 9:00 AM - 10:00 PM'] // regular hyphen
    expect(getClosingTime(schedule)).toBe('') // returns empty because split on – finds no separator
  })

  it('returns the closing time for midnight', () => {
    const schedule = ['Monday: 9:00 AM \u2013 12:00 AM']
    // replace(':00', '') replaces FIRST occurrence: "12:00 AM" → "12 AM"
    expect(getClosingTime(schedule)).toBe('12 AM')
  })
})

describe('mapRestaurantResponse', () => {
  it('maps a single raw place to GetRestaurantResponse shape', () => {
    const raw = [
      {
        name: 'Pizza Palace',
        vicinity: '10 High Street, Springfield',
        rating: 4.5,
        user_ratings_total: 200,
      },
    ]
    const result = mapRestaurantResponse(raw)
    expect(result[0].name).toBe('Pizza Palace')
    expect(result[0].directionsUrl).toContain('maps/dir')
    expect(result[0].rating).toBe(4.5)
    expect(result[0].totalRatings).toBe(200)
  })

  it('maps multiple items', () => {
    const raw = [
      { name: 'A', vicinity: 'Addr A', rating: 4.0, user_ratings_total: 100 },
      { name: 'B', vicinity: 'Addr B', rating: 3.5, user_ratings_total: 50 },
    ]
    const result = mapRestaurantResponse(raw)
    expect(result).toHaveLength(2)
    expect(result[1].name).toBe('B')
  })

  it('handles missing optional fields gracefully', () => {
    const raw = [{ name: 'Minimal', vicinity: 'Somewhere' }]
    const result = mapRestaurantResponse(raw)
    expect(result[0].name).toBe('Minimal')
    expect(result[0].rating).toBeUndefined()
    expect(result[0].totalRatings).toBeUndefined()
  })

  it('returns an empty array for empty input', () => {
    expect(mapRestaurantResponse([])).toEqual([])
  })
})
