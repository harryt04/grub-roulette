import React from 'react'
import { GetRestaurantResponse } from '../types/location'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Image from 'next/image'
import Link from 'next/link'
import DirectionsIcon from '@mui/icons-material/Directions'

export type PlaceDetailsProps = {
  place: GetRestaurantResponse
}

export const PlaceDetails = (props: PlaceDetailsProps) => {
  const { place } = props
  const ratingString = `${place.rating} stars (${place.totalRatings} reviews)`
  return (
    <>
      <div className="placeDetails">
        <Typography variant="h5">{place.name}</Typography>
        <Typography variant="caption">{place.description}</Typography>
        <Typography variant="subtitle1">{ratingString}</Typography>
        <div className="place-details-spacer"></div>
        <Link href={`tel:${place.phone}`}>{place.phone}</Link>
        <div className="place-details-spacer"></div>

        <Link href={place.website as string} target="_blank">
          {getMainDomain(place.website as string)}
        </Link>
        <div className="place-details-spacer"></div>
        <Typography variant="subtitle2">{place.address}</Typography>
        <div className="directions-button">
          <Button
            variant="contained"
            color="primary"
            href={place.directionsUrl}
            target="_blank"
            startIcon={<DirectionsIcon />}
            className="directions-button"
          >
            Directions
          </Button>
        </div>
      </div>
    </>
  )
}

function getMainDomain(url: string): string {
  try {
    const parsedUrl = new URL(url)
    const hostname = parsedUrl.hostname

    // Regular expression to capture the last two segments of the hostname
    const domainPattern = /[^.]+\.[^.]+$/
    const match = hostname.match(domainPattern)

    return match ? match[0] : ''
  } catch (error) {
    console.error('Invalid URL:', error)
    return ''
  }
}
