import { describe, it, expect } from 'vitest'
import { getMainDomain, priceLevelString } from '@/lib/domain-utils'

describe('getMainDomain', () => {
  it('returns the apex domain for a standard URL with www subdomain', () => {
    expect(getMainDomain('https://www.example.com/path?q=1')).toBe(
      'example.com',
    )
  })

  it('returns the apex domain for a URL without subdomain', () => {
    expect(getMainDomain('https://example.com')).toBe('example.com')
  })

  it('returns last two segments for a multi-level subdomain', () => {
    expect(getMainDomain('https://blog.foo.example.com')).toBe('example.com')
  })

  it('returns "" for an invalid URL', () => {
    expect(getMainDomain('not-a-url')).toBe('')
  })

  it('returns "" for an empty string', () => {
    expect(getMainDomain('')).toBe('')
  })

  it('handles a URL with a port number', () => {
    expect(getMainDomain('https://example.com:8080/page')).toBe('example.com')
  })

  it('handles a URL with a path and no trailing slash', () => {
    expect(getMainDomain('https://pizza.com/menu/italian')).toBe('pizza.com')
  })
})

describe('priceLevelString', () => {
  it('returns "" for undefined', () => {
    expect(priceLevelString(undefined)).toBe('')
  })

  it('returns "(Free)" for 0', () => {
    expect(priceLevelString(0)).toBe('(Free)')
  })

  it('returns "($)" for count 1', () => {
    expect(priceLevelString(1)).toBe('($)')
  })

  it('returns "($$)" for count 2', () => {
    expect(priceLevelString(2)).toBe('($$)')
  })

  it('returns "($$$)" for count 3', () => {
    expect(priceLevelString(3)).toBe('($$$)')
  })

  it('returns "($$$$)" for count 4', () => {
    expect(priceLevelString(4)).toBe('($$$$)')
  })
})
