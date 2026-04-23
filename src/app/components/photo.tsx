import Image from 'next/image'

export const PhotoComponent = ({
  photoReference,
  alt,
}: {
  photoReference: string
  alt: string
}) => {
  const proxyUrl = `/api/getPhotos?reference=${encodeURIComponent(photoReference)}`

  return (
    <div>
      <Image
        src={proxyUrl}
        alt={alt}
        width={400}
        height={300}
        style={{ width: '100%', height: 'auto' }}
        loading="lazy"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
    </div>
  )
}
