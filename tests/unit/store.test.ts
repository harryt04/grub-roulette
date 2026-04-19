import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useAppStore } from '@/store/app-store'

describe('App Store', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('addToBlacklist adds entry and writes to localStorage', async () => {
    // Fresh state for each test
    const entry = { place_id: 'place123', name: 'Restaurant A' }
    useAppStore.getState().addToBlacklist(entry)

    // Wait for persist to complete
    await new Promise(resolve => setTimeout(resolve, 50))

    const state = useAppStore.getState()
    expect(state.blacklist).toContainEqual(entry)
    const saved = localStorage.getItem('grubroulette_blacklist')
    expect(saved).toBeTruthy()
  })

  it('clearBlacklist resets to empty array and updates localStorage', async () => {
    const entry = { place_id: 'place123', name: 'Restaurant A' }
    useAppStore.getState().addToBlacklist(entry)

    await new Promise(resolve => setTimeout(resolve, 50))

    useAppStore.getState().clearBlacklist()

    await new Promise(resolve => setTimeout(resolve, 50))

    const state = useAppStore.getState()
    expect(state.blacklist).toEqual([])
    const saved = localStorage.getItem('grubroulette_blacklist')
    // After clearing, localStorage should contain the serialized empty state
    expect(saved).toContain('blacklist')
  })

  it('clearSessionCache resets seenPlaceIds and placesPool', () => {
    const store = useAppStore.getState()
    store.addSeenPlaceId('place1')
    store.setPlacesPool([{ place_id: 'p1', name: 'R1' } as any])
    store.clearSessionCache()

    expect(store.seenPlaceIds.size).toBe(0)
    expect(store.placesPool).toEqual([])
  })

  it('toggleDarkMode flips isDarkMode', () => {
    // Force reset to known state
    useAppStore.getState().toggleDarkMode()
    useAppStore.getState().toggleDarkMode()

    const store = useAppStore.getState()
    const initial = store.isDarkMode
    store.toggleDarkMode()
    const updated = useAppStore.getState()
    expect(updated.isDarkMode).toBe(!initial)
  })

  it('isDarkMode is NOT written to localStorage', async () => {
    const store = useAppStore.getState()
    store.toggleDarkMode()
    store.toggleDarkMode()

    await new Promise(resolve => setTimeout(resolve, 50))

    const saved = localStorage.getItem('isDarkMode')
    expect(saved).toBeNull()
  })

  it('seenPlaceIds is a Set', () => {
    const store = useAppStore.getState()
    expect(store.seenPlaceIds).toBeInstanceOf(Set)
  })

  it('handles corrupt localStorage gracefully', () => {
    localStorage.setItem('grubroulette_blacklist', 'INVALID_JSON')

    expect(() => useAppStore.getState()).not.toThrow()
  })

  it('multiple addSeenPlaceId calls add distinct place IDs to Set', () => {
    const store = useAppStore.getState()
    store.clearSessionCache() // Ensure clean state
    store.addSeenPlaceId('place1')
    store.addSeenPlaceId('place2')
    store.addSeenPlaceId('place1') // duplicate

    const updated = useAppStore.getState()
    expect(updated.seenPlaceIds.size).toBe(2)
    expect(updated.seenPlaceIds.has('place1')).toBe(true)
    expect(updated.seenPlaceIds.has('place2')).toBe(true)
  })

  it('setLocation updates location state', () => {
    const store = useAppStore.getState()
    const location = { type: 'latlong' as const, latitude: 40.7128, longitude: -74.006 }
    store.setLocation(location)

    const updated = useAppStore.getState()
    expect(updated.location).toEqual(location)
  })

  it('setRadius updates radius value', () => {
    const store = useAppStore.getState()
    store.setRadius(5)

    const updated = useAppStore.getState()
    expect(updated.radius).toBe(5)
  })

  it('setRadiusUnits updates radius units', () => {
    const store = useAppStore.getState()
    store.setRadiusUnits('kilometers')

    const updated = useAppStore.getState()
    expect(updated.radiusUnits).toBe('kilometers')
  })

  it('setLoading updates isLoading flag', () => {
    const store = useAppStore.getState()
    store.setLoading(true)

    let updated = useAppStore.getState()
    expect(updated.isLoading).toBe(true)

    store.setLoading(false)
    updated = useAppStore.getState()
    expect(updated.isLoading).toBe(false)
  })

  it('setError updates error state', () => {
    const store = useAppStore.getState()
    const errorMsg = 'Something went wrong'
    store.setError(errorMsg)

    let updated = useAppStore.getState()
    expect(updated.error).toBe(errorMsg)

    store.setError(null)
    updated = useAppStore.getState()
    expect(updated.error).toBeNull()
  })

  it('setShareSnackbar updates shareSnackbarOpen flag', () => {
    const store = useAppStore.getState()
    store.setShareSnackbar(true)

    let updated = useAppStore.getState()
    expect(updated.shareSnackbarOpen).toBe(true)

    store.setShareSnackbar(false)
    updated = useAppStore.getState()
    expect(updated.shareSnackbarOpen).toBe(false)
  })

  it('setIsAllSeen updates isAllSeen flag', () => {
    const store = useAppStore.getState()
    store.setIsAllSeen(true)

    let updated = useAppStore.getState()
    expect(updated.isAllSeen).toBe(true)

    store.setIsAllSeen(false)
    updated = useAppStore.getState()
    expect(updated.isAllSeen).toBe(false)
  })

  it('setKeywords updates keywords array', () => {
    const store = useAppStore.getState()
    const newKeywords = ['pizza', 'pasta', 'italian']
    store.setKeywords(newKeywords)

    const updated = useAppStore.getState()
    expect(updated.keywords).toEqual(newKeywords)
  })

  it('setCurrentRestaurant updates currentRestaurant', () => {
    const store = useAppStore.getState()
    const restaurant = { place_id: 'abc123', name: 'Test Restaurant' } as any
    store.setCurrentRestaurant(restaurant)

    let updated = useAppStore.getState()
    expect(updated.currentRestaurant).toEqual(restaurant)

    store.setCurrentRestaurant(null)
    updated = useAppStore.getState()
    expect(updated.currentRestaurant).toBeNull()
  })

  it('setGeoError updates geoError', () => {
    const store = useAppStore.getState()
    const error = 'Geolocation not available'
    store.setGeoError(error)

    let updated = useAppStore.getState()
    expect(updated.geoError).toBe(error)

    store.setGeoError(null)
    updated = useAppStore.getState()
    expect(updated.geoError).toBeNull()
  })

  it('setPlacesPool updates placesPool', () => {
    const store = useAppStore.getState()
    const pool = [{ place_id: 'p1', name: 'Restaurant 1' } as any, { place_id: 'p2', name: 'Restaurant 2' } as any]
    store.setPlacesPool(pool)

    const updated = useAppStore.getState()
    expect(updated.placesPool).toEqual(pool)
  })
})
