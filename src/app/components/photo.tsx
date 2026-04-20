import Image from 'next/image'

export const PhotoComponent = ({ photoUrl }: { photoUrl: string }) => {
  return (
    <div>
      <Image
        src={photoUrl.trim()}
        alt="Place photo"
        width={400}
        height={300}
        style={{ width: '100%', height: 'auto' }}
        loading="lazy"
        unoptimized
      />
    </div>
  )
}
