import React, { useState } from 'react'
import { GetRestaurantResponse } from '../types/location'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Snackbar from '@mui/material/Snackbar'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import Link from 'next/link'
import DirectionsIcon from '@mui/icons-material/Directions'
import { PhotoComponent } from './photo'
import ImageModal from './modal'
import Masonry from 'react-masonry-css'
import IosShareIcon from '@mui/icons-material/IosShare'

export type PlaceDetailsProps = {
  place: GetRestaurantResponse
  isMobile: boolean
}

export const PlaceDetails = (props: PlaceDetailsProps) => {
  const { place } = props
  const ratingString = `${place.rating} stars (${place.totalRatings} reviews)`

  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')

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
    navigator.clipboard
      .writeText(googleMapsUrl)
      .then(() => {
        setSnackbarMessage('Share link copied to clipboard!')
        setSnackbarOpen(true)
      })
      .catch((err) => {
        console.error('Could not copy text: ', err)
      })
  }

  const handleCloseSnackbar = (
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') {
      return
    }
    setSnackbarOpen(false)
  }

  const breakpointColumnsObj = {
    // screen width thresholds for image grid columns
    default: 3, // web
    1100: 2, // tablet
    700: 1, // mobile
  }

  const priceLevelString = (count?: number) => {
    if (!count) return ''
    return '('.padEnd(count + 1, '$') + ')'
  }

  return (
    <>
      <div className="placeDetails">
        <Typography variant={props.isMobile ? 'h5' : 'h4'}>
          {place.name}
        </Typography>
        <Typography variant="caption" className="caption">
          {place.description}
        </Typography>
        <Typography variant="caption">
          {priceLevelString(place.priceLevel)}
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
            startIcon={<IosShareIcon />}
            className="copy-button"
          >
            Share
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
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
        className="centeredSnackbar"
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={handleCloseSnackbar}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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
