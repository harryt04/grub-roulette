'use client'
import React, { useEffect } from 'react'
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
const usedPlaces: string[] = [] // an array of place_ids that have been ignored by thse user

export default function RestaurantFinder() {
  const { location, geoLocationError } = useGeolocation()

  const [keywords, setKeywords] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [radius, setRadius] = React.useState(15)
  const [currentPlace, setCurrentPlace] =
    React.useState<GetRestaurantResponse>()

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

  const fillPlacesMap = async () => {
    if (!location) throw new Error('No location found')
    const restaurants = await getRestaurants({
      latitude: location.latitude,
      longitude: location.longitude,
      radius,
      radiusUnits: 'miles',
      keywords,
    })

    const openPlaces = restaurants?.filter(
      (r: any) =>
        r.opening_hours?.open_now && r.business_status === 'OPERATIONAL',
    )
    if (!openPlaces || openPlaces.length === 0) {
      return
    }

    openPlaces.forEach((place: any) => {
      if (placesMap.has(place.name)) return
      placesMap.set(place.name, {
        name: place.name,
        directionsUrl: buildGoogleMapsUrl(place.vicinity),
        rating: place.rating,
        totalRatings: place.user_ratings_total,
        place_id: place.place_id,
      })
    })
  }

  const getRestaurant = async (): Promise<void> => {
    setLoading(true)
    if (placesMap.size === 0) await fillPlacesMap()

    // if no places were found, show the not found message
    if (placesMap.size === 0) {
      clearCurrentPlace(NOT_FOUND)
      return
    }
    if (placesMap.size === usedPlaces.length) {
      clearCurrentPlace(SEEN_ALL_PLACES)
      return
    }

    const unusedPlaces = Array.from(placesMap.values()).filter((place) => {
      return !usedPlaces.includes(place.name)
    })

    // get an unusedPlace randomly
    const randomIndex = Math.floor(Math.random() * unusedPlaces.length)
    const place = unusedPlaces[randomIndex]

    if (!place) {
      clearCurrentPlace(SEEN_ALL_PLACES)
      return
    }

    const placeDetails = await getPlaceDetails(place.place_id)
    if (!placeDetails) {
      setCurrentPlace(place)
      usedPlaces.push(place.name)
      return
    }

    const photoReferences = placeDetails.photos?.map(
      (photo: any) => photo?.photo_reference,
    )

    const photos =
      !!photoReferences && photoReferences.length > 0
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
  }

  const getNewRestaurantString = !!currentPlace
    ? 'Get a different restaurant'
    : 'Get a random restaurant'

  return (
    <Card className="center card padding-override">
      <CardContent>
        <div className="form-container">
          <TextField
            id="keywords"
            label="Search (optional) i.e. 'sushi'"
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
              <Typography variant="caption">
                Remaining places: {placesMap.size - usedPlaces.length}
              </Typography>
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
