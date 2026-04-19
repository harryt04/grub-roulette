'use client'

import { useState } from 'react'
import type { GetRestaurantResponse } from '@/lib/types'
import { priceLevelString, getMainDomain, getClosingTime } from '@/lib/utils'
import { Photo } from './photo'
import { ImageModal } from './image-modal'
import Masonry from 'react-masonry-css'
import { useAppStore } from '@/store/app-store'
import { toast } from 'sonner'

type PlaceDetailsProps = {
  restaurant: GetRestaurantResponse
}

export function PlaceDetails({ restaurant }: PlaceDetailsProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleShare = () => {
    const shareUrl = restaurant.googleMapsUrl ?? restaurant.directionsUrl ?? ''
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast('Share link copied to clipboard!', { duration: 6000 })
    })
  }

  const handleBlacklist = () => {
    const store = useAppStore.getState()
    store.addToBlacklist({ place_id: restaurant.place_id, name: restaurant.name })
  }

  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  const directionsTarget = isSafari
    ? (restaurant.directionsUrl ?? restaurant.googleMapsUrl)
    : (restaurant.googleMapsUrl ?? restaurant.directionsUrl)

  return (
    <div className="space-y-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h4 className="text-2xl md:text-3xl font-bold fade-in-container">{restaurant.name}</h4>

      {restaurant.rating && (
        <p>{restaurant.rating} stars ({restaurant.totalRatings} reviews)</p>
      )}

      {restaurant.priceLevel && (
        <p>{priceLevelString(restaurant.priceLevel)}</p>
      )}

      {restaurant.address && (
        <p>{restaurant.address}</p>
      )}

      {restaurant.phone && (
        <a href={`tel:${restaurant.phone}`}>{restaurant.phone}</a>
      )}

      {restaurant.website && (
        <a href={restaurant.website} target="_blank" rel="noopener noreferrer">
          {getMainDomain(restaurant.website)}
        </a>
      )}

      {restaurant.closingTime && (
        <p>Closes at: {restaurant.closingTime}</p>
      )}

      {restaurant.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300">{restaurant.description}</p>
      )}

      <div className="flex gap-2 mt-4">
        {directionsTarget && (
          <a
            href={directionsTarget}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-primary text-white rounded hover:opacity-90 transition-opacity"
          >
            Directions
          </a>
        )}
        <button
          onClick={handleShare}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:opacity-90 transition-opacity"
        >
          Share
        </button>
        <button
          onClick={handleBlacklist}
          className="px-4 py-2 bg-red-500 text-white rounded hover:opacity-90 transition-opacity"
        >
          Block
        </button>
      </div>

      {restaurant.photos && restaurant.photos.length > 0 && (
        <Masonry
          breakpointCols={{ default: 3, 1100: 2, 700: 1 }}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {restaurant.photos.map((url, i) => (
            <Photo
              key={i}
              url={url}
              onClick={() => {
                setSelectedImage(url)
                setIsModalOpen(true)
              }}
            />
          ))}
        </Masonry>
      )}

      <ImageModal
        isOpen={isModalOpen}
        src={selectedImage}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
