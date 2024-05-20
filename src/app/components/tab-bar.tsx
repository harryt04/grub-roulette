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
import {
  buildGoogleMapsUrl,
  getRestaurants,
} from '../client-utils/getRestaurants'
import { GetRestaurantResponse } from '../types/location'

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
  console.log('location: ', location)
  console.log('geoLocationError: ', geoLocationError)

  const [keywords, setKeywords] = React.useState('')
  const [radius, setRadius] = React.useState(5)
  const [currentPlace, setCurrentPlace] =
    React.useState<GetRestaurantResponse>()

  const handleTabChanged = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue)
  }
  return (
    <Card className="center">
      <CardContent>
        <TextField
          id="keywords"
          label="Keywords i.e. 'sushi'"
          variant="outlined"
          value={keywords}
          onChange={(event) => setKeywords(event.target.value)}
        />

        <TextField
          id="radius"
          label="Search within radius (miles)"
          variant="outlined"
          value={radius}
          onChange={(event) => setRadius(Number(event.target.value))}
        />

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
                  console.log('radius: ', radius)
                  console.log('keywords: ', keywords)
                  getRestaurants({
                    latitude: location.latitude,
                    longitude: location.longitude,
                    radius,
                    radiusUnits: 'miles',
                    keywords,
                  }).then((restaurants) => {
                    const openPlaces = restaurants.filter(
                      (r) => r.opening_hours?.open_now,
                    )

                    if (openPlaces.length === 0) {
                      setCurrentPlace({
                        name: 'No places found',
                        directionsUrl: '',
                      })
                    }

                    // select random openPlace and set to currentPlace
                    const randomIndex = Math.floor(
                      Math.random() * openPlaces.length,
                    )
                    setCurrentPlace({
                      name: openPlaces[randomIndex].name,
                      directionsUrl: buildGoogleMapsUrl(
                        openPlaces[randomIndex].vicinity,
                      ),
                    })
                  })
                }}
              >
                Get new restaurant
              </Button>
              {currentPlace && (
                <div>
                  <Typography variant="h6">{currentPlace.name}</Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    href={currentPlace.directionsUrl}
                    target="_blank"
                  >
                    Directions
                  </Button>
                </div>
              )}
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
