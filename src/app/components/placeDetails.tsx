'use client'
import { useState } from 'react'
import { GetRestaurantResponse } from '../types/location'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import Link from 'next/link'
import { MapPin, Share, RotateCcw, Ban } from 'lucide-react'
import { PhotoComponent } from './photo'
import ImageModal from './modal'
import Masonry from 'react-masonry-css'
import { getMainDomain, priceLevelString } from '@/lib/domain-utils'

export type PlaceDetailsProps = {
  place: GetRestaurantResponse
  isMobile: boolean
  onResetBlacklist?: () => void
  onAddToBlacklist?: () => void
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
      <div className="placeDetails rounded-2xl bg-card ring-1 ring-border shadow-[var(--shadow-soft)] overflow-hidden">
        {place.photos && place.photos.length > 0 && (
          <div className="relative -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 mb-2 lg:-mx-4 lg:-mt-4">
            <div className="h-40 sm:h-48 overflow-hidden rounded-t-2xl">
              <PhotoComponent photoUrl={place.photos[0]} />
            </div>
            <div className="absolute top-3 right-3 flex gap-2">
              {props.onResetBlacklist && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={props.onResetBlacklist}
                  aria-label="Reset blocked places"
                  className="rounded-full bg-card/80 backdrop-blur"
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
              )}
              {props.onAddToBlacklist && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={props.onAddToBlacklist}
                  aria-label="Don't show me this place again"
                  className="rounded-full bg-card/80 backdrop-blur text-destructive hover:text-destructive"
                >
                  <Ban className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        )}
        <h2 className="font-heading text-xl font-bold sm:text-2xl">
          {place.name}
        </h2>
        <p className="text-sm text-muted-foreground caption">
          {place.description}
        </p>
        <div className="flex flex-wrap justify-center gap-2 py-1">
          <Badge variant="rating">⭐ {ratingString}</Badge>
          {priceLevelString(place.priceLevel) && (
            <Badge variant="price">{priceLevelString(place.priceLevel)}</Badge>
          )}
          <Badge variant="status">
            {place.closingTime ? `Closes at: ${place.closingTime}` : 'Open now'}
          </Badge>
        </div>
        <div className="place-details-spacer"></div>
        {place.phone && (
          <Link className="text-primary" href={`tel:${place.phone}`}>
            {place.phone}
          </Link>
        )}
        <div className="place-details-spacer"></div>
        {place.website && (
          <Link className="text-primary" href={place.website} target="_blank">
            {getMainDomain(place.website)}
          </Link>
        )}
        <div className="place-details-spacer"></div>
        <p className="text-sm font-medium">{place.address}</p>
        <div className="button-group">
          <a
            href={googleMapsUrl || ''}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
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
        {place.photos && place.photos.length > 1 && (
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="imageGallery"
            columnClassName="imageGalleryColumn"
          >
            {place.photos.slice(1).map((photo) => (
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
