import { describe, it, expect, vi } from 'vitest'
import { createTTLCache } from '@/app/api/_utils/cache'

describe('createTTLCache', () => {
  it('stores and retrieves a value within TTL', () => {
    const cache = createTTLCache<string>(1000)
    cache.set('key1', 'value1')
    expect(cache.get('key1')).toBe('value1')
  })

  it('returns undefined for non-existent key', () => {
    const cache = createTTLCache<string>()
    expect(cache.get('nonexistent')).toBeUndefined()
  })

  it('returns undefined for expired entry', () => {
    vi.useFakeTimers()
    const cache = createTTLCache<string>(1000)
    cache.set('key1', 'value1')

    // Advance time past TTL
    vi.advanceTimersByTime(1001)
    expect(cache.get('key1')).toBeUndefined()

    vi.useRealTimers()
  })

  it('has() returns true for valid entry', () => {
    const cache = createTTLCache<string>(1000)
    cache.set('key1', 'value1')
    expect(cache.has('key1')).toBe(true)
  })

  it('has() returns false for expired entry', () => {
    vi.useFakeTimers()
    const cache = createTTLCache<string>(1000)
    cache.set('key1', 'value1')

    vi.advanceTimersByTime(1001)
    expect(cache.has('key1')).toBe(false)

    vi.useRealTimers()
  })

  it('clear() removes all entries', () => {
    const cache = createTTLCache<string>()
    cache.set('key1', 'value1')
    cache.set('key2', 'value2')

    cache.clear()
    expect(cache.get('key1')).toBeUndefined()
    expect(cache.get('key2')).toBeUndefined()
  })

  it('uses default TTL of 1 hour when not specified', () => {
    vi.useFakeTimers()
    const cache = createTTLCache<string>()
    cache.set('key1', 'value1')

    // 1 hour - 1 ms should still be valid
    vi.advanceTimersByTime(3600000 - 1)
    expect(cache.get('key1')).toBe('value1')

    // Advance 1 more ms to exceed TTL
    vi.advanceTimersByTime(1)
    expect(cache.get('key1')).toBeUndefined()

    vi.useRealTimers()
  })

  it('caches different types of values', () => {
    const cache = createTTLCache<{ name: string; age: number }>()
    const obj = { name: 'Alice', age: 30 }
    cache.set('user', obj)
    expect(cache.get('user')).toEqual(obj)
  })

  it('overwrites previous value for same key', () => {
    const cache = createTTLCache<string>()
    cache.set('key1', 'value1')
    cache.set('key1', 'value2')
    expect(cache.get('key1')).toBe('value2')
  })
})
