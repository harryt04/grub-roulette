'use client'
import React from 'react'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import CardContent from '@mui/material/CardContent'
import useGeolocation, { GeoLocationError } from '../hooks/useGeoLocation'
import { getRestaurants } from '../client-utils/getRestaurants'

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
  const [value, setValue] = React.useState(0)
  const { location, geoLocationError } = useGeolocation()
  console.log('location: ', location)
  console.log('geoLocationError: ', geoLocationError)

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }
  return (
    <Card className="center">
      <CardContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="GrubRoulette Spinner Options"
          >
            <Tab label="Current location" />
            <Tab label="Zipcode" />
            {/* <Tab label="Address" /> */}
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
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
                    radius: 1,
                    radiusUnits: 'miles',
                    type: 'restaurant',
                  }).then((restaurants) => {
                    console.log('restaurants: ', restaurants)
                  })
                }}
              >
                Get new restaurant
              </Button>
            </>
          )}
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          zipcode support coming soon
        </CustomTabPanel>
        {/* <CustomTabPanel value={value} index={2}>
          Address
        </CustomTabPanel> */}
      </CardContent>
    </Card>
  )
}
