'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAppStore } from '@/store/app-store'
import { useGeolocation } from '@/hooks/use-geolocation'
import {
  DEFAULT_KEYWORDS,
  RADIUS_DEFAULT,
  RADIUS_UNITS_DEFAULT,
  LS_CACHE_KEY,
  CACHE_TTL_MS,
  NOT_FOUND_MSG,
  SEEN_ALL_MSG,
} from '@/lib/constants'
import { safeJsonParse, getClosingTime } from '@/lib/utils'
import type { GetRestaurantResponse } from '@/lib/types'
import { PlaceDetails } from './place-details'
import { DarkModeToggle } from './dark-mode-toggle'
import { OnlyOpenPlaces } from './only-open-places'

type PlaceDetailsCache = Map<string, GetRestaurantResponse>

export function RestaurantFinder() {
  // Geolocation
  const { location: geoLocation, geoError } = useGeolocation()
  const setLocation = useAppStore((s) => s.setLocation)
  const setGeoError = useAppStore((s) => s.setGeoError)

  useEffect(() => {
    if (geoLocation) {
      setLocation({
        type: 'latlong',
        latitude: geoLocation.latitude,
        longitude: geoLocation.longitude,
      })
    }
  }, [geoLocation, setLocation])

  useEffect(() => {
    if (geoError) {
      setGeoError(geoError)
    }
  }, [geoError, setGeoError])

  // Store state
  const location = useAppStore((s) => s.location)
  const radius = useAppStore((s) => s.radius)
  const radiusUnits = useAppStore((s) => s.radiusUnits)
  const keywords = useAppStore((s) => s.keywords)
  const currentRestaurant = useAppStore((s) => s.currentRestaurant)
  const seenPlaceIds = useAppStore((s) => s.seenPlaceIds)
  const placesPool = useAppStore((s) => s.placesPool)
  const blacklist = useAppStore((s) => s.blacklist)
  const isLoading = useAppStore((s) => s.isLoading)
  const error = useAppStore((s) => s.error)
  const isAllSeen = useAppStore((s) => s.isAllSeen)

  // Actions
  const setRadius = useAppStore((s) => s.setRadius)
  const setRadiusUnits = useAppStore((s) => s.setRadiusUnits)
  const setKeywords = useAppStore((s) => s.setKeywords)
  const setCurrentRestaurant = useAppStore((s) => s.setCurrentRestaurant)
  const addSeenPlaceId = useAppStore((s) => s.addSeenPlaceId)
  const clearSessionCache = useAppStore((s) => s.clearSessionCache)
  const setPlacesPool = useAppStore((s) => s.setPlacesPool)
  const addToBlacklist = useAppStore((s) => s.addToBlacklist)
  const clearBlacklist = useAppStore((s) => s.clearBlacklist)
  const setLoading = useAppStore((s) => s.setLoading)
  const setError = useAppStore((s) => s.setError)
  const setIsAllSeen = useAppStore((s) => s.setIsAllSeen)

  // Cache management
  const cacheRef = useRef<PlaceDetailsCache>(new Map())

  useEffect(() => {
    const raw = localStorage.getItem(LS_CACHE_KEY)
    const parsed = safeJsonParse<{
      data: [string, GetRestaurantResponse][]
      timestamp: number
    } | null>(raw, null)

    if (parsed && Date.now() - parsed.timestamp < CACHE_TTL_MS) {
      cacheRef.current = new Map(parsed.data)
    } else if (parsed) {
      localStorage.removeItem(LS_CACHE_KEY)
    }
  }, [])

  const saveCache = () => {
    const serialized = {
      data: [...cacheRef.current.entries()],
      timestamp: Date.now(),
    }
    localStorage.setItem(LS_CACHE_KEY, JSON.stringify(serialized))
  }

  // Config change handlers
  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius)
    clearSessionCache()
  }

  const handleRadiusUnitsChange = () => {
    setRadiusUnits(radiusUnits === 'miles' ? 'kilometers' : 'miles')
    clearSessionCache()
  }

  const handleKeywordToggle = (kw: string) => {
    const next = keywords.includes(kw)
      ? keywords.filter((k) => k !== kw)
      : [...keywords, kw]
    setKeywords(next)
    clearSessionCache()
  }

  // Main find food handler
  const handleFindFood = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const state = useAppStore.getState()
      let pool = state.placesPool

      if (pool.length === 0) {
        // Fetch from all keywords in parallel
        const selectedKeywords = state.keywords
        const results = await Promise.all(
          selectedKeywords.map((kw) =>
            fetch('/api/getRestaurants', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...(state.location?.type === 'latlong'
                  ? { latitude: state.location.latitude, longitude: state.location.longitude }
                  : { zip: state.location?.zip }),
                radius: state.radius,
                radiusUnits: state.radiusUnits,
                keywords: kw,
              }),
            }).then((r) => r.json())
          )
        )

        // Merge, deduplicate, filter
        const seen = new Set<string>()
        const merged: any[] = []
        for (const res of results) {
          if (res.results) {
            for (const place of res.results) {
              if (
                !seen.has(place.place_id) &&
                place.opening_hours?.open_now === true &&
                place.business_status === 'OPERATIONAL'
              ) {
                seen.add(place.place_id)
                merged.push(place)
              }
            }
          }
        }

        pool = merged
        setPlacesPool(pool)
      }

      if (pool.length === 0) {
        setError(NOT_FOUND_MSG)
        setLoading(false)
        return
      }

      // Get unused places
      const currentState = useAppStore.getState()
      const unusedPlaces = pool.filter(
        (p) =>
          !currentState.seenPlaceIds.has(p.place_id) &&
          !currentState.blacklist.some((b) => b.place_id === p.place_id)
      )

      if (unusedPlaces.length === 0) {
        setIsAllSeen(true)
        setLoading(false)
        return
      }

      // Random selection
      const idx = Math.floor(Math.random() * unusedPlaces.length)
      const selected = unusedPlaces[idx]

      // Check cache or fetch
      let details: GetRestaurantResponse
      if (cacheRef.current.has(selected.place_id)) {
        details = cacheRef.current.get(selected.place_id)!
      } else {
        const detailsRes = await fetch('/api/getPlaceDetails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ place_id: selected.place_id }),
        })
        const detailsData = await detailsRes.json()

        // Fetch photos if available
        let photos: string[] = []
        if (detailsData.photos && detailsData.photos.length > 0) {
          const refs = detailsData.photos.map((p: any) => p.photo_reference)
          const photosRes = await fetch('/api/getPhotos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ photos: refs }),
          })
          photos = await photosRes.json()
        }

        details = {
          name: selected.name,
          place_id: selected.place_id,
          address: detailsData.formatted_address,
          phone: detailsData.formatted_phone_number,
          website: detailsData.website,
          googleMapsUrl: detailsData.url,
          directionsUrl: detailsData.url,
          description: detailsData.editorial_summary?.overview,
          closingTime: detailsData.current_opening_hours?.weekday_text
            ? getClosingTime(detailsData.current_opening_hours.weekday_text)
            : undefined,
          priceLevel: detailsData.price_level,
          rating: selected.rating,
          totalRatings: detailsData.user_ratings_total,
          photos,
        }

        cacheRef.current.set(selected.place_id, details)
        saveCache()
      }

      setCurrentRestaurant(details)
      addSeenPlaceId(selected.place_id)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, setPlacesPool, setCurrentRestaurant, addSeenPlaceId, setIsAllSeen])

  // Block handler
  const handleBlock = () => {
    if (currentRestaurant) {
      addToBlacklist({
        place_id: currentRestaurant.place_id,
        name: currentRestaurant.name,
      })
      clearSessionCache()
      handleFindFood()
    }
  }

  // Reset blacklist handler
  const handleResetBlacklist = () => {
    clearBlacklist()
    clearSessionCache()
    handleFindFood()
  }

  const cn = (...classes: any[]) => classes.filter(Boolean).join(' ')

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Find Your Next Meal</h2>
        <DarkModeToggle />
      </div>

      {/* Radius input */}
      <div className="space-y-2">
        <label>Search radius: {radius} {radiusUnits}</label>
        <input
          type="range"
          min="0.5"
          max="10"
          step="0.5"
          value={radius}
          onChange={(e) => handleRadiusChange(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Radius units toggle */}
      <button
        onClick={handleRadiusUnitsChange}
        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded"
      >
        {radiusUnits === 'miles' ? 'Switch to km' : 'Switch to miles'}
      </button>

      {/* Keywords */}
      <div className="space-y-2">
        <label>Cuisines:</label>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_KEYWORDS.map((kw) => (
            <button
              key={kw}
              onClick={() => handleKeywordToggle(kw)}
              className={cn(
                'px-3 py-1 rounded-full text-sm border transition-colors',
                keywords.includes(kw)
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300'
              )}
            >
              {kw}
            </button>
          ))}
        </div>
      </div>

      {/* ZIP input */}
      {geoError && (
        <input
          type="text"
          placeholder="Enter ZIP code"
          onChange={(e) =>
            setLocation({ type: 'zip', zip: e.target.value.trim() })
          }
          className="w-full px-3 py-2 border rounded dark:bg-gray-800"
        />
      )}

      {/* Main button */}
      <button
        onClick={() => {
          if (isAllSeen) {
            clearSessionCache()
            setIsAllSeen(false)
            handleFindFood()
          } else {
            handleFindFood()
          }
        }}
        disabled={isLoading}
        className="w-full px-4 py-3 bg-primary text-white rounded font-bold hover:opacity-90 disabled:opacity-50"
      >
        {isAllSeen ? 'Start Over' : isLoading ? 'Finding...' : 'Find Me Food'}
      </button>

      {/* Loading + error */}
      {isLoading && <p className="text-center text-gray-500">Searching...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      <OnlyOpenPlaces />

      {/* Place details */}
      {currentRestaurant && (
        <PlaceDetails restaurant={currentRestaurant} />
      )}

      {/* Blacklist controls */}
      {currentRestaurant && (
        <div className="flex gap-2">
          <button
            onClick={handleBlock}
            disabled={isAllSeen}
            className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
          >
            Block
          </button>
          {blacklist.length > 0 && (
            <button
              onClick={handleResetBlacklist}
              className="px-4 py-2 bg-yellow-500 text-white rounded"
            >
              Reset Blacklist
            </button>
          )}
        </div>
      )}
    </div>
  )
}
