import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  buildGoogleMapsUrl,
  getClosingTime,
  priceLevelString,
  getMainDomain,
  safeJsonParse,
} from '@/lib/utils'

describe('buildGoogleMapsUrl', () => {
  it('returns a URL starting with the maps base', () => {
    const result = buildGoogleMapsUrl('123 Main St')
    expect(result).toMatch(/^https:\/\/www\.google\.com\/maps\/dir\/\?api=1&destination=/)
  })

  it('URL-encodes spaces as %20', () => {
    const result = buildGoogleMapsUrl('123 Main St')
    expect(result).toContain('%20')
    expect(result).not.toContain(' ')
  })
})

describe('getClosingTime', () => {
  beforeEach(() => {
    // Mock Date to always return Monday (day index 1)
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-21')) // Monday
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns closing time for today', () => {
    const schedule = [
      'Monday: 10:00 AM – 9:00 PM',
      'Tuesday: 10:00 AM – 9:00 PM',
    ]
    expect(getClosingTime(schedule)).toBe('9 PM')
  })

  it('strips :00 suffix', () => {
    const schedule = ['Monday: 8:00 AM – 10:00 PM']
    expect(getClosingTime(schedule)).toBe('10 PM')
  })

  it('returns empty string for empty array', () => {
    expect(getClosingTime([])).toBe('')
  })

  it('returns empty string for null without throwing', () => {
    expect(getClosingTime(null as any)).toBe('')
  })

  it('returns empty string when today is not in schedule', () => {
    expect(getClosingTime(['Tuesday: 9:00 AM – 8:00 PM'])).toBe('')
  })
})

describe('priceLevelString', () => {
  it('returns ($) for 1', () => {
    expect(priceLevelString(1)).toBe('($)')
  })

  it('returns ($$) for 2', () => {
    expect(priceLevelString(2)).toBe('($$)')
  })

  it('returns empty string for undefined', () => {
    expect(priceLevelString(undefined)).toBe('')
  })

  it('returns empty string for 0', () => {
    expect(priceLevelString(0)).toBe('')
  })
})

describe('getMainDomain', () => {
  it('extracts main domain from full URL', () => {
    expect(getMainDomain('https://www.example.com/path')).toBe('example.com')
  })

  it('returns empty string for invalid URL', () => {
    expect(getMainDomain('not-a-url')).toBe('')
  })
})

describe('safeJsonParse', () => {
  it('parses valid JSON', () => {
    expect(safeJsonParse('{"a":1}', {})).toEqual({ a: 1 })
  })

  it('returns fallback for invalid JSON', () => {
    expect(safeJsonParse('INVALID', [])).toEqual([])
  })

  it('returns fallback for null input', () => {
    expect(safeJsonParse(null, [])).toEqual([])
  })

  it('does not throw on bad input', () => {
    expect(() => safeJsonParse('{{bad}}', null)).not.toThrow()
  })
})
