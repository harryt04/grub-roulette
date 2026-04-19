'use client'

import Image from 'next/image'

type PhotoProps = {
  url: string
  onClick?: () => void
}

export function Photo({ url, onClick }: PhotoProps) {
  return (
    <div
      className="cursor-pointer overflow-hidden rounded"
      onClick={onClick}
    >
      <Image
        src={url}
        alt="Place photo"
        width={400}
        height={300}
        loading="lazy"
        unoptimized
        className="w-full h-auto object-cover"
      />
    </div>
  )
}
