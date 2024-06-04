import React, { useState } from 'react'
import { GetRestaurantResponse } from '../types/location'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Image from 'next/image'
import Link from 'next/link'
import DirectionsIcon from '@mui/icons-material/Directions'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { PhotoComponent } from './photo'
import ImageModal from './modal'
import Masonry from 'react-masonry-css'

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

  const googleMapsUrl = (place.googleMapsUrl || place.directionsUrl) as string

  const copyToClipboard = () => {
    navigator.clipboard.writeText(googleMapsUrl).catch((err) => {
      console.error('Could not copy text: ', err)
    })
  }

  const breakpointColumnsObj = {
    // screen width thresholds for image grid columns
    default: 3, // web
    1100: 2, // tablet
    700: 1, // mobile
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
        <div className="button-group">
          <Button
            variant="contained"
            color="secondary"
            href={googleMapsUrl}
            target="_blank"
            startIcon={<DirectionsIcon />}
            className="directions-button"
          >
            Directions
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={copyToClipboard}
            startIcon={<ContentCopyIcon />}
            className="copy-button"
          >
            Copy Address
          </Button>
        </div>
        {place.photos && (
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="imageGallery"
            columnClassName="imageGalleryColumn"
          >
            {place.photos.map((photo) => (
              <div key={photo} onClick={() => openModal(photo)}>
                <PhotoComponent photoUrl={photo} />
              </div>
            ))}
          </Masonry>
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

    const domainPattern = /[^.]+\.[^.]+$/
    const match = hostname.match(domainPattern)

    return match ? match[0] : ''
  } catch (error) {
    console.error('Invalid URL:', error)
    return ''
  }
}
