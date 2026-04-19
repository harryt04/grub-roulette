import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GetRestaurantResponse, BlacklistEntry, LocationState } from '@/lib/types'
import { DEFAULT_KEYWORDS, LS_BLACKLIST_KEY, RADIUS_DEFAULT, RADIUS_UNITS_DEFAULT } from '@/lib/constants'

type AppState = {
  // Location
  location: LocationState
  geoError: string | null

  // Search config
  radius: number
  radiusUnits: 'miles' | 'kilometers'
  keywords: string[]

  // Session state (not persisted — resets on page reload)
  currentRestaurant: GetRestaurantResponse | null
  seenPlaceIds: Set<string>
  placesPool: GetRestaurantResponse[]
  remainingCount: number

  // Persistent state (synced to localStorage)
  blacklist: BlacklistEntry[]

  // UI state
  isDarkMode: boolean      // NOT persisted; OS pref on reload
  isLoading: boolean
  error: string | null
  shareSnackbarOpen: boolean
  isAllSeen: boolean

  // Actions
  setLocation: (loc: LocationState) => void
  setGeoError: (err: string | null) => void
  setRadius: (r: number) => void
  setRadiusUnits: (u: 'miles' | 'kilometers') => void
  setKeywords: (kw: string[]) => void
  setCurrentRestaurant: (r: GetRestaurantResponse | null) => void
  addSeenPlaceId: (id: string) => void
  clearSessionCache: () => void
  setPlacesPool: (pool: GetRestaurantResponse[]) => void
  addToBlacklist: (entry: BlacklistEntry) => void
  clearBlacklist: () => void
  toggleDarkMode: () => void
  setLoading: (v: boolean) => void
  setError: (e: string | null) => void
  setShareSnackbar: (v: boolean) => void
  setIsAllSeen: (v: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      location: null,
      geoError: null,
      radius: RADIUS_DEFAULT,
      radiusUnits: RADIUS_UNITS_DEFAULT,
      keywords: [...DEFAULT_KEYWORDS],
      currentRestaurant: null,
      seenPlaceIds: new Set<string>(),
      placesPool: [],
      remainingCount: 0,
      blacklist: [],
      isDarkMode: false,
      isLoading: false,
      error: null,
      shareSnackbarOpen: false,
      isAllSeen: false,

      setLocation: (loc) => set({ location: loc }),
      setGeoError: (err) => set({ geoError: err }),
      setRadius: (r) => set({ radius: r }),
      setRadiusUnits: (u) => set({ radiusUnits: u }),
      setKeywords: (kw) => set({ keywords: kw }),
      setCurrentRestaurant: (r) => set({ currentRestaurant: r }),
      addSeenPlaceId: (id) => set((state) => ({ seenPlaceIds: new Set(state.seenPlaceIds).add(id) })),
      clearSessionCache: () => set({ seenPlaceIds: new Set<string>(), placesPool: [] }),
      setPlacesPool: (pool) => set({ placesPool: pool }),
      addToBlacklist: (entry) => set((state) => ({ blacklist: [...state.blacklist, entry] })),
      clearBlacklist: () => set({ blacklist: [] }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setLoading: (v) => set({ isLoading: v }),
      setError: (e) => set({ error: e }),
      setShareSnackbar: (v) => set({ shareSnackbarOpen: v }),
      setIsAllSeen: (v) => set({ isAllSeen: v }),
    }),
    {
      name: LS_BLACKLIST_KEY,  // 'grubroulette_blacklist'
      partialize: (state) => ({ blacklist: state.blacklist }),
    }
  )
)
