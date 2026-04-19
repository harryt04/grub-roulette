'use client'

import Image from 'next/image'

type ImageModalProps = {
  isOpen: boolean
  src: string | null
  onClose: () => void
}

export function ImageModal({ isOpen, src, onClose }: ImageModalProps) {
  if (!isOpen || !src) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        className="modal-content relative w-full max-w-4xl max-h-screen p-4"
        onClick={onClose}
      >
        <div className="relative w-full h-[80vh]">
          <Image
            src={src}
            alt="Full size photo"
            fill
            style={{ objectFit: 'contain' }}
            unoptimized
          />
        </div>
      </div>
    </div>
  )
}
