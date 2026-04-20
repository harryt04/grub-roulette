'use client'
import { useState } from 'react'
import { GetRestaurantResponse } from '../types/location'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { MapPin, Share } from 'lucide-react'
import { PhotoComponent } from './photo'
import ImageModal from './modal'
import Masonry from 'react-masonry-css'
import { getMainDomain, priceLevelString } from '@/lib/domain-utils'

export type PlaceDetailsProps = {
  place: GetRestaurantResponse
  isMobile: boolean
}

export const PlaceDetails = (props: PlaceDetailsProps) => {
  const { resolvedTheme } = useTheme()
  const isDarkMode = resolvedTheme === 'dark'
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

  // if the user is in safari, use the directionsUrl instead of googleMapsUrl
  const isSafari =
    typeof window !== 'undefined' &&
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  const googleMapsUrl = isSafari
    ? place.directionsUrl || place.googleMapsUrl
    : place.googleMapsUrl || place.directionsUrl

  const shareUrl = place.googleMapsUrl || place.directionsUrl

  const copyToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => {
          toast('Share link copied to clipboard!')
        })
        .catch((err) => {
          console.error('Could not copy text: ', err)
        })
    }
  }

  const breakpointColumnsObj = {
    default: 3,
    1100: 2,
    700: 1,
  }

  return (
    <>
      <div className="placeDetails">
        <h2 className="text-xl font-bold sm:text-2xl">{place.name}</h2>
        <p className="text-sm text-muted-foreground caption">
          {place.description}
        </p>
        <p className="text-sm">{priceLevelString(place.priceLevel)}</p>
        <div className="place-details-spacer"></div>

        <p className="text-base">{ratingString}</p>
        <div className="place-details-spacer"></div>
        {place.phone && (
          <Link
            className={isDarkMode ? 'primary-text' : ''}
            href={`tel:${place.phone}`}
          >
            {place.phone}
          </Link>
        )}
        <div className="place-details-spacer"></div>
        {place.website && (
          <Link
            className={isDarkMode ? 'primary-text' : ''}
            href={place.website}
            target="_blank"
          >
            {getMainDomain(place.website)}
          </Link>
        )}
        <div className="place-details-spacer"></div>
        <p className="text-sm font-medium">{place.address}</p>
        <div className="button-group">
          {place.closingTime && (
            <p className="text-xs text-muted-foreground">
              Closes at: {place.closingTime}
            </p>
          )}
          <a
            href={googleMapsUrl || ''}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: 'secondary' }), 'w-full')}
          >
            <MapPin className="mr-2 h-4 w-4" />
            Directions
          </a>
          <Button
            variant="default"
            onClick={copyToClipboard}
            className="w-full"
          >
            <Share className="mr-2 h-4 w-4" />
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
    </>
  )
}
