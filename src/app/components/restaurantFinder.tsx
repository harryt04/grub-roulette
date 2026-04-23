'use client'
import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { RefreshCw, Ban, RotateCcw, Loader2 } from 'lucide-react'

import useGeolocation from '../hooks/useGeoLocation'
import {
  getPhotos,
  getPlaceDetails,
  getRestaurants,
} from '../client-utils/getRestaurants'
import {
  buildGoogleMapsUrl,
  getClosingTime,
  GetRestaurantResponse,
} from '../types/location'
import { PlaceDetails } from './placeDetails'
import { OnlyOpenPlaces } from './onlyOpenPlaces'
import {
  loadBlacklistFromLocalStorage,
  saveBlacklistToLocalStorage,
  loadPlaceDetailsCacheFromLocalStorage,
  savePlaceDetailsCacheToLocalStorage,
} from '@/lib/localStorage'

const NOT_FOUND =
  'No (open) places were found. Try changing your search criteria, or resetting blocked places.'
const SEEN_ALL_PLACES = 'You have seen all the places!'
const placesMap = new Map<string, GetRestaurantResponse>()
const usedPlaces: string[] = []
let placeDetailsCache = new Map<string, unknown>()

export function resetModuleState() {
  placesMap.clear()
  usedPlaces.length = 0
  placeDetailsCache.clear()
}

export type RestaurantFinderProps = {
  isMobile: boolean
}

export default function RestaurantFinder(props: RestaurantFinderProps) {
  const { location, geoLocationError, geoLoading } = useGeolocation()
  const [zip, setZip] = useState('')
  const [keywords, setKeywords] = useState('')
  const [loading, setLoading] = useState(false)
  const [isAwaitingRestaurantResponse, setIsAwaitingRestaurantResponse] =
    useState(false)
  const [radius, setRadius] = useState(15)
  const [remainingPlacesCount, setRemainingPlacesCount] = useState(0)
  const [currentPlace, setCurrentPlace] = useState<GetRestaurantResponse>()
  const [blacklist, setBlacklist] = useState<GetRestaurantResponse[]>([])

  useEffect(() => {
    setBlacklist(loadBlacklistFromLocalStorage())
    placeDetailsCache = loadPlaceDetailsCacheFromLocalStorage()
  }, [])

  useEffect(() => {
    resetUI()
  }, [radius, keywords, location, zip])

  const resetUI = useCallback(() => {
    placesMap.clear()
    usedPlaces.length = 0
  }, [])

  const clearCurrentPlace = (name?: string) => {
    setCurrentPlace({
      name: name || NOT_FOUND,
      place_id: '',
    })
    placesMap.clear()
    usedPlaces.length = 0
  }

  const getRestaurant = useCallback(async () => {
    setLoading(true)

    if (placesMap.size === 0) {
      const restaurants = await getRestaurants({
        latitude: location?.latitude,
        longitude: location?.longitude,
        zip: zip || undefined,
        radius,
        radiusUnits: 'miles',
        keywords,
      })

      const openPlaces = restaurants?.filter(
        (r: any) =>
          r.opening_hours?.open_now && r.business_status === 'OPERATIONAL',
      )

      openPlaces?.forEach((place: any) => {
        if (!placesMap.has(place.name)) {
          placesMap.set(place.name, {
            name: place.name,
            directionsUrl: buildGoogleMapsUrl(place.vicinity),
            rating: place.rating,
            totalRatings: place.user_ratings_total,
            place_id: place.place_id,
          })
        }
      })
    }

    if (placesMap.size === 0) {
      clearCurrentPlace(NOT_FOUND)
      return
    }

    if (placesMap.size === usedPlaces.length) {
      clearCurrentPlace(SEEN_ALL_PLACES)
      return
    }

    const unusedPlaces = Array.from(placesMap.values()).filter(
      (place) =>
        !usedPlaces.includes(place.place_id) &&
        !blacklist.some(
          (blacklisted: GetRestaurantResponse) =>
            blacklisted.place_id === place.place_id ||
            blacklisted.name === place.name,
        ),
    )

    const randomIndex = Math.floor(Math.random() * unusedPlaces.length)
    const place = unusedPlaces[randomIndex]
    setRemainingPlacesCount(unusedPlaces.length - 1)

    if (!place) {
      clearCurrentPlace(SEEN_ALL_PLACES)
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let placeDetails: any = placeDetailsCache.get(place.place_id)

    if (!placeDetails) {
      placeDetails = await getPlaceDetails(place.place_id)
      placeDetailsCache.set(place.place_id, placeDetails)
      savePlaceDetailsCacheToLocalStorage(placeDetailsCache)
    }

    if (!placeDetails) {
      setCurrentPlace(place)
      usedPlaces.push(place.place_id)
      return
    }

    const photoReferences = placeDetails.photos?.map(
      (photo: any) => photo?.photo_reference,
    )

    const photos =
      photoReferences && photoReferences.length > 0
        ? await getPhotos(photoReferences)
        : []

    const thePlaceToBe = {
      ...place,
      address: placeDetails.formatted_address || '',
      description: placeDetails.editorial_summary?.overview || '',
      closingTime: getClosingTime(
        placeDetails?.current_opening_hours?.weekday_text,
      ),
      googleMapsUrl: placeDetails.url,
      phone: placeDetails.formatted_phone_number || '',
      photos,
      priceLevel: placeDetails.price_level,
      website: placeDetails.website || '',
    } as GetRestaurantResponse

    setCurrentPlace(thePlaceToBe)
    usedPlaces.push(thePlaceToBe.place_id)
  }, [location, radius, keywords, blacklist, zip])

  useEffect(() => {
    // Don't attempt a fetch until geolocation has either resolved or failed
    if (isAwaitingRestaurantResponse && !geoLoading) {
      if (!location && !zip) {
        // Geolocation finished but we have neither a location nor a ZIP — nothing to fetch
        setLoading(false)
        setIsAwaitingRestaurantResponse(false)
        return
      }

      let isCancelled = false
      getRestaurant().finally(() => {
        if (!isCancelled) {
          setLoading(false)
          setIsAwaitingRestaurantResponse(false)
        }
      })

      return () => {
        isCancelled = true
      }
    }
  }, [
    blacklist,
    getRestaurant,
    isAwaitingRestaurantResponse,
    geoLoading,
    location,
    zip,
    resetUI,
  ])

  const handleAddToBlacklist = () => {
    if (currentPlace) {
      const newBlacklist = [
        ...blacklist,
        { place_id: currentPlace.place_id, name: currentPlace.name },
      ]
      saveBlacklistToLocalStorage(newBlacklist)
      setBlacklist(newBlacklist)
      setIsAwaitingRestaurantResponse(true)
    }
  }

  const handleResetBlacklist = () => {
    resetUI()
    saveBlacklistToLocalStorage([])
    setBlacklist([])
    setIsAwaitingRestaurantResponse(true)
  }

  const getNewRestaurantString = currentPlace
    ? 'Get a different restaurant'
    : 'Find a place to eat'

  return (
    <Card className="w-full max-w-md padding-override">
      <CardContent className="px-4 py-4">
        <div className="form-container">
          <Input
            id="keywords"
            placeholder="Search (optional) e.g. 'sushi' or 'italian'"
            value={keywords}
            onChange={(event) => setKeywords(event.target.value)}
            className="w-full"
          />
          {(geoLoading || geoLocationError) && (
            <Input
              id="zip"
              placeholder={
                geoLoading ? 'Detecting your location...' : 'ZIP code'
              }
              value={zip}
              onChange={(event) => setZip(event.target.value.trim())}
              className="w-full"
              disabled={geoLoading}
            />
          )}
          <Input
            id="radius"
            placeholder="Search radius (miles)"
            type="number"
            value={Number(radius).toString()}
            onChange={(event) => setRadius(Number(event.target.value))}
            className="w-full"
          />
        </div>

        {(location || zip) && (
          <div className="get-restaurant-container">
            {currentPlace && (
              <div className="blacklist-container">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleResetBlacklist}
                          aria-label="Reset blocked places"
                        >
                          <RotateCcw className="h-5 w-5" />
                        </Button>
                      }
                    />
                    <TooltipContent>Reset blocked places</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleAddToBlacklist}
                          disabled={
                            currentPlace.name === NOT_FOUND ||
                            currentPlace.name === SEEN_ALL_PLACES
                          }
                          aria-label="Don't show me this place again"
                          className="text-destructive hover:text-destructive"
                        >
                          <Ban className="h-5 w-5" />
                        </Button>
                      }
                    />
                    <TooltipContent>
                      Don&apos;t show me this place again
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}

            <Button
              disabled={loading}
              onClick={() => setIsAwaitingRestaurantResponse(true)}
              variant="default"
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {getNewRestaurantString}
            </Button>

            {currentPlace &&
              remainingPlacesCount >= 0 &&
              placesMap.size > 0 && (
                <p className="text-xs text-muted-foreground remaining-places-text">
                  Remaining places: {remainingPlacesCount}
                </p>
              )}

            {loading && (
              <div className="loading-spinner">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}

            {!loading &&
              currentPlace &&
              (currentPlace.name === NOT_FOUND ||
                currentPlace.name === SEEN_ALL_PLACES) && (
                <div className="placeDetails">
                  <div className="spacer"></div>
                  <h3 className="text-xl font-semibold sm:text-2xl">
                    {currentPlace.name}
                  </h3>
                  <OnlyOpenPlaces />
                </div>
              )}
            {currentPlace &&
              currentPlace.name !== NOT_FOUND &&
              currentPlace.name !== SEEN_ALL_PLACES && (
                <div key={currentPlace.place_id} className="fade-in-container">
                  <PlaceDetails
                    place={currentPlace}
                    isMobile={props.isMobile}
                  />
                </div>
              )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
