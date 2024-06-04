import React, { useEffect, useMemo, useState } from 'react'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import RefreshIcon from '@mui/icons-material/Refresh'
import CircularProgress from '@mui/material/CircularProgress'

import useGeolocation, { GeoLocationError } from '../hooks/useGeoLocation'
import {
  getPhotos,
  getPlaceDetails,
  getRestaurants,
} from '../client-utils/getRestaurants'
import { buildGoogleMapsUrl, GetRestaurantResponse } from '../types/location'
import { PlaceDetails } from './placeDetails'

const NOT_FOUND = 'No places were found. Try changing your search criteria.'
const SEEN_ALL_PLACES = 'You have seen all the places!'
const placesMap = new Map<string, GetRestaurantResponse>()
const usedPlaces: string[] = [] // an array of place_ids that have been ignored by the user
let placeDetailsCache = new Map<string, any>()

const loadPlaceDetailsCacheFromLocalStorage = () => {
  const cacheData = localStorage.getItem('placeDetailsCache')
  const ONE_HOUR = 3600000
  if (cacheData) {
    const { data, timestamp } = JSON.parse(cacheData)
    if (Date.now() - timestamp < ONE_HOUR) {
      placeDetailsCache = new Map<string, any>(data)
    } else {
      localStorage.removeItem('placeDetailsCache')
    }
  }
}

const savePlaceDetailsCacheToLocalStorage = () => {
  localStorage.setItem(
    'placeDetailsCache',
    JSON.stringify({
      data: Array.from(placeDetailsCache.entries()),
      timestamp: Date.now(),
    }),
  )
}

export default function RestaurantFinder() {
  const { location, geoLocationError } = useGeolocation()
  const [keywords, setKeywords] = useState('')
  const [loading, setLoading] = useState(false)
  const [radius, setRadius] = useState(15)
  const [currentPlace, setCurrentPlace] = useState<GetRestaurantResponse>()

  useEffect(() => {
    loadPlaceDetailsCacheFromLocalStorage()
  }, [])

  useEffect(() => {
    // if the user changes the search criteria or enters a new location, clear the placesMap.
    // Otherwise, cache them so we dont have to call getRestaurants again
    placesMap.clear()
    usedPlaces.length = 0
  }, [radius, keywords, location])

  const clearCurrentPlace = (name?: string) => {
    setCurrentPlace({
      name: name || NOT_FOUND,
      place_id: '',
    })
    placesMap.clear()
    usedPlaces.length = 0
  }

  const getRestaurant = useMemo(
    () => async () => {
      setLoading(true)
      if (!location) throw new Error('No location found')

      if (placesMap.size === 0) {
        // Fetch restaurants if the placesMap is empty
        const restaurants = await getRestaurants({
          latitude: location.latitude,
          longitude: location.longitude,
          radius,
          radiusUnits: 'miles',
          keywords,
        })

        // Filter open places
        const openPlaces = restaurants?.filter(
          (r: any) =>
            r.opening_hours?.open_now && r.business_status === 'OPERATIONAL',
        )

        // Cache the open places in the placesMap
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
        (place) => !usedPlaces.includes(place.name),
      )

      const randomIndex = Math.floor(Math.random() * unusedPlaces.length)
      const place = unusedPlaces[randomIndex]

      if (!place) {
        clearCurrentPlace(SEEN_ALL_PLACES)
        return
      }

      // Check if place details are already cached
      let placeDetails = placeDetailsCache.get(place.place_id)

      if (!placeDetails) {
        // Fetch place details if not cached
        placeDetails = await getPlaceDetails(place.place_id)
        placeDetailsCache.set(place.place_id, placeDetails) // Cache the result
        savePlaceDetailsCacheToLocalStorage()
      }

      if (!placeDetails) {
        // Failed to get extra details for place, set the currentPlace and return
        setCurrentPlace(place)
        usedPlaces.push(place.name)
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
        description: placeDetails.editorial_summary?.overview || '',
        address: placeDetails.formatted_address || '',
        phone: placeDetails.formatted_phone_number || '',
        photos,
        website: placeDetails.website || '',
      } as GetRestaurantResponse

      setCurrentPlace(thePlaceToBe)
      usedPlaces.push(thePlaceToBe.name)
    },
    [location, radius, keywords],
  ) // end getRestaurant()

  const getNewRestaurantString = currentPlace
    ? 'Get a different restaurant'
    : 'Get a random restaurant'

  return (
    <Card className="center card padding-override">
      <CardContent>
        <div className="form-container">
          <TextField
            id="keywords"
            label="Search (optional) i.e. 'sushi' or 'italian'"
            variant="outlined"
            value={keywords}
            onChange={(event) => setKeywords(event.target.value)}
            className="textfield"
            color="secondary"
          />
          <TextField
            id="radius"
            label="Search radius (miles)"
            variant="outlined"
            type="number"
            value={Number(radius).toString()}
            onChange={(event) => setRadius(Number(event.target.value))}
            className="textfield"
            color="secondary"
          />
        </div>

        {geoLocationError &&
          geoLocationError === GeoLocationError.PERMISSION_DENIED && (
            <>
              <Typography variant="h6">
                Please allow geolocation permissions and refresh this page
              </Typography>

              <Typography variant="caption">
                Your location data is never stored by GrubRoulette anywhere.
                GrubRoulette respects your privacy.
              </Typography>
            </>
          )}

        {location && (
          <div className="get-restaurant-container">
            <Button
              disabled={loading}
              onClick={() => {
                getRestaurant().finally(() => {
                  setLoading(false)
                })
              }}
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
            >
              {getNewRestaurantString}
            </Button>

            {currentPlace && (
              <>
                <Typography variant="caption" className="remaining-places-text">
                  Remaining places: {placesMap.size - usedPlaces.length}
                </Typography>
              </>
            )}

            {loading && (
              <div className="loading-spinner">
                <CircularProgress />
              </div>
            )}

            {!loading &&
              currentPlace &&
              (currentPlace.name === NOT_FOUND ||
                currentPlace.name === SEEN_ALL_PLACES) && (
                <>
                  <div className="spacer"></div>
                  <Typography variant="h5">{currentPlace.name}</Typography>
                </>
              )}
            {!loading &&
              currentPlace &&
              currentPlace.name !== NOT_FOUND &&
              currentPlace.name !== SEEN_ALL_PLACES && (
                <>
                  <PlaceDetails place={currentPlace} />
                </>
              )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
