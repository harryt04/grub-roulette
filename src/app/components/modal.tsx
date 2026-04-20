'use client'
import Image from 'next/image'
import { Dialog, DialogContent } from '@/components/ui/dialog'

const ImageModal = ({ src, isOpen, onClose }: any) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden bg-black/80 border-0">
        <div className="relative w-[80vw] h-[80vh]" onClick={onClose}>
          <Image
            src={src}
            alt="modal photo"
            fill
            style={{ objectFit: 'contain' }}
            className="modal-image"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ImageModal
