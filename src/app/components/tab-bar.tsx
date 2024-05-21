'use client'
import React from 'react'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import RefreshIcon from '@mui/icons-material/Refresh'

import useGeolocation, {
  GeoLocationError,
  LatLong,
} from '../hooks/useGeoLocation'
import { getPlaceDetails, getRestaurants } from '../client-utils/getRestaurants'
import { buildGoogleMapsUrl, GetRestaurantResponse } from '../types/location'
import { PlaceDetails } from './placeDetails'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const NOT_FOUND = '404'

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

export default function TabBar() {
  const [currentTab, setCurrentTab] = React.useState(0)
  const { location, geoLocationError } = useGeolocation()

  const [keywords, setKeywords] = React.useState('')
  const [radius, setRadius] = React.useState(5)
  const [currentPlace, setCurrentPlace] =
    React.useState<GetRestaurantResponse>()

  const getNewRestaurants = async (location: LatLong) => {
    getRestaurants({
      latitude: location.latitude,
      longitude: location.longitude,
      radius,
      radiusUnits: 'miles',
      keywords,
    }).then(async (restaurants) => {
      const openPlaces = restaurants.filter(
        (r: any) =>
          r.opening_hours?.open_now && r.place_id !== currentPlace?.place_id,
      )

      if (openPlaces.length === 0) {
        setCurrentPlace({
          name: NOT_FOUND,
          place_id: '',
        })
      }

      // select random openPlace and set to currentPlace
      const randomIndex = Math.floor(Math.random() * openPlaces.length)
      const places = openPlaces.map((place: any) => ({
        name: place.name,
        directionsUrl: buildGoogleMapsUrl(place.vicinity),
        rating: place.rating,
        totalRatings: place.user_ratings_total,
        place_id: place.place_id,
      }))
      const place = places[randomIndex]
      const placeDetails = await getPlaceDetails(place.place_id)
      if (placeDetails) {
        const thePlaceToBe = {
          ...place,
          description: placeDetails.editorial_summary.overview,
          address: placeDetails.formatted_address,
          phone: placeDetails.formatted_phone_number,
          website: placeDetails.website,
        } as GetRestaurantResponse
        setCurrentPlace(thePlaceToBe)
      } else {
        setCurrentPlace(place)
      }
    })
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
          />

          <TextField
            id="radius"
            label="Search radius (miles)"
            variant="outlined"
            type="number"
            value={radius}
            onChange={(event) => setRadius(Number(event.target.value))}
          />
        </div>

        {geoLocationError &&
          geoLocationError === GeoLocationError.PERMISSION_DENIED && (
            <>Please allow geolocation permissions and refresh this page</>
          )}

        {location && (
          <div className="get-restaurant-container">
            <Button
              onClick={() => {
                getNewRestaurants(location)
              }}
              variant="outlined"
              startIcon={<RefreshIcon />}
            >
              {getNewRestaurantString}
            </Button>
            {currentPlace && currentPlace.name !== NOT_FOUND && (
              <PlaceDetails place={currentPlace} />
            )}
            {currentPlace && currentPlace.name === NOT_FOUND && (
              <>
                <div className="spacer"></div>
                <Typography variant="h5">
                  Sorry, no (open) places found.
                </Typography>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
