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
import Switch from '@mui/material/Switch'

import useGeolocation, { GeoLocationError } from '../hooks/useGeoLocation'
import { getPlaceDetails, getRestaurants } from '../client-utils/getRestaurants'
import { buildGoogleMapsUrl, GetRestaurantResponse } from '../types/location'
import { PlaceDetails } from './placeDetails'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

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
  const [allPlaces, setAllPlaces] = React.useState<GetRestaurantResponse[]>()

  const handleTabChanged = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue)
  }
  return (
    <Card className="center card">
      <CardContent>
        <div className="form-container">
          <TextField
            id="keywords"
            label="Keywords i.e. 'sushi'"
            variant="outlined"
            value={keywords}
            onChange={(event) => setKeywords(event.target.value)}
          />

          <TextField
            id="radius"
            label="Search radius (miles)"
            variant="outlined"
            value={radius}
            onChange={(event) => setRadius(Number(event.target.value))}
          />
        </div>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChanged}
            aria-label="GrubRoulette Spinner Options"
          >
            <Tab label="Current location" />
            <Tab label="Zipcode" />
            {/* <Tab label="Address" /> */}
          </Tabs>
        </Box>
        <CustomTabPanel value={currentTab} index={0}>
          {geoLocationError &&
            geoLocationError === GeoLocationError.PERMISSION_DENIED && (
              <>Please allow geolocation permissions</>
            )}

          {location && (
            <>
              <Button
                onClick={() => {
                  getRestaurants({
                    latitude: location.latitude,
                    longitude: location.longitude,
                    radius,
                    radiusUnits: 'miles',
                    keywords,
                  }).then(async (restaurants) => {
                    const openPlaces = restaurants.filter(
                      (r: any) => r.opening_hours?.open_now,
                    )

                    if (openPlaces.length === 0) {
                      setCurrentPlace({
                        name: 'No places found',
                        place_id: '',
                      })
                    }

                    // select random openPlace and set to currentPlace
                    const randomIndex = Math.floor(
                      Math.random() * openPlaces.length,
                    )
                    const places = openPlaces.map((place: any) => ({
                      name: place.name,
                      directionsUrl: buildGoogleMapsUrl(place.vicinity),
                      rating: place.rating,
                      totalRatings: place.user_ratings_total,
                      icon: place.icon,
                      place_id: place.place_id,
                    }))
                    setAllPlaces(places)
                    const place = places[randomIndex]
                    const placeDetails = await getPlaceDetails(place.place_id)
                    const thePlaceToBe = {
                      ...place,
                      description: placeDetails.editorial_summary.overview,
                      address: placeDetails.formatted_address,
                      phone: placeDetails.formatted_phone_number,
                    }
                    setCurrentPlace(thePlaceToBe)
                  })
                }}
              >
                Get new restaurant
              </Button>
              {currentPlace && <PlaceDetails place={currentPlace} />}
            </>
          )}
        </CustomTabPanel>
        <CustomTabPanel value={currentTab} index={1}>
          zipcode support coming soon
        </CustomTabPanel>
        {/* <CustomTabPanel value={value} index={2}>
          Address
        </CustomTabPanel> */}
      </CardContent>
    </Card>
  )
}
