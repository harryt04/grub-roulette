import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  buildGoogleMapsPhotoUrl,
  convertRadiusToMeters,
} from '@/lib/google-maps'

describe('buildGoogleMapsPhotoUrl', () => {
  beforeEach(() => {
    vi.stubEnv('GOOGLE_MAPS_API_KEY', 'TEST_API_KEY')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('builds a correct photo URL for a valid reference', () => {
    const url = buildGoogleMapsPhotoUrl('ABC123')
    expect(url).toBe(
      'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=ABC123&key=TEST_API_KEY',
    )
  })

  it('returns "" for an empty string reference', () => {
    expect(buildGoogleMapsPhotoUrl('')).toBe('')
  })

  it('does not include trailing whitespace or newlines in the URL', () => {
    const url = buildGoogleMapsPhotoUrl('REF456')
    expect(url).toBe(url.trim())
    expect(url).not.toContain('\n')
  })

  it('includes maxwidth=400 in the URL', () => {
    const url = buildGoogleMapsPhotoUrl('REF789')
    expect(url).toContain('maxwidth=400')
  })

  it('includes the photo reference verbatim in the URL', () => {
    const url = buildGoogleMapsPhotoUrl('MY_PHOTO_REF')
    expect(url).toContain('photoreference=MY_PHOTO_REF')
  })
})

describe('convertRadiusToMeters', () => {
  it('converts 1 mile to 1609.34 metres', () => {
    expect(convertRadiusToMeters(1, 'miles')).toBeCloseTo(1609.34)
  })

  it('converts 5 miles to 8046.7 metres', () => {
    expect(convertRadiusToMeters(5, 'miles')).toBeCloseTo(8046.7)
  })

  it('converts 1 kilometer to 1000 metres', () => {
    expect(convertRadiusToMeters(1, 'kilometers')).toBe(1000)
  })

  it('converts 10 kilometers to 10000 metres', () => {
    expect(convertRadiusToMeters(10, 'kilometers')).toBe(10000)
  })

  it('defaults to miles formula for an unrecognised units string', () => {
    expect(convertRadiusToMeters(1, 'furlongs')).toBeCloseTo(1609.34)
  })

  it('handles 0 radius', () => {
    expect(convertRadiusToMeters(0, 'miles')).toBe(0)
  })
})
