import Image from 'next/image'
import React from 'react'

const ImageModal = ({ src, isOpen, onClose }: any) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={onClose}>
        <Image
          src={src}
          alt="modal photo"
          layout="fill"
          objectFit="contain"
          className="modal-image"
          unoptimized
        />
      </div>
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          max-width: 90%;
          max-height: 90%;
          overflow: hidden;
        }
        .modal-image {
          width: auto;
          height: auto;
        }
      `}</style>
    </div>
  )
}

export default ImageModal
