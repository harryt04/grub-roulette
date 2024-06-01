import React, { useState } from 'react'
import { GetRestaurantResponse } from '../types/location'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Image from 'next/image'
import Link from 'next/link'
import DirectionsIcon from '@mui/icons-material/Directions'
import { PhotoComponent } from './photo'
import ImageModal from './modal'

export type PlaceDetailsProps = {
  place: GetRestaurantResponse
}

export const PlaceDetails = (props: PlaceDetailsProps) => {
  const { place } = props
  const ratingString = `${place.rating} stars (${place.totalRatings} reviews)`

  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = (image: string) => {
    setSelectedImage(image)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setSelectedImage(null)
    setIsModalOpen(false)
  }

  return (
    <>
      <div className="placeDetails">
        <Typography variant="h5">{place.name}</Typography>
        <Typography variant="caption" className="caption">
          {place.description}
        </Typography>
        <div className="place-details-spacer"></div>
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
            href={place.directionsUrl as string}
            target="_blank"
            startIcon={<DirectionsIcon />}
            className="directions-button"
          >
            Directions
          </Button>
        </div>
        {place.photos && (
          <div className="imageGallery">
            {place.photos.map((photo) => (
              <div key={photo} onClick={() => openModal(photo)}>
                <PhotoComponent photoUrl={photo} />
              </div>
            ))}
          </div>
        )}
      </div>
      <ImageModal
        src={selectedImage}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
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
