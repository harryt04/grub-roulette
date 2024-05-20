import React from 'react'
import { GetRestaurantResponse } from '../types/location'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

export type PlaceDetailsProps = {
  place: GetRestaurantResponse
}

export const PlaceDetails = (props: PlaceDetailsProps) => {
  return (
    <>
      <Typography variant="h6">{props.place.name}</Typography>
      <Button
        variant="contained"
        color="primary"
        href={props.place.directionsUrl}
        target="_blank"
      >
        Directions
      </Button>
    </>
  )
}
