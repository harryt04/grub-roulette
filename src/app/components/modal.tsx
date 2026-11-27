'use client'
import Image from 'next/image'
import { useEffect, useRef, useState, useCallback } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'

const ZOOM_IN = 3
const MIN_ZOOM = 1
const MAX_ZOOM = 6

interface Point {
  x: number
  y: number
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val))
}

/** Clamp pan so the zoomed image never shows empty space around it */
function clampPan(
  pan: Point,
  zoom: number,
  containerW: number,
  containerH: number,
): Point {
  if (zoom <= 1) return { x: 0, y: 0 }
  const maxX = (containerW * (zoom - 1)) / 2
  const maxY = (containerH * (zoom - 1)) / 2
  return {
    x: clamp(pan.x, -maxX, maxX),
    y: clamp(pan.y, -maxY, maxY),
  }
}

const ImageModal = ({
  src,
  isOpen,
  onClose,
  finalFocus,
}: {
  src: string | null
  isOpen: boolean
  onClose: () => void
  /** Where focus goes after the viewer closes, such as the photo that opened it. */
  finalFocus?: () => HTMLElement | null
}) => {
  const [zoom, setZoom] = useState(MIN_ZOOM)
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Pointer / touch tracking refs — no re-renders during drag
  const pointerDown = useRef(false)
  const lastPointer = useRef<Point>({ x: 0, y: 0 })
  const lastPinchDist = useRef<number | null>(null)
  const didMove = useRef(false) // distinguish tap from drag
  const [isInteracting, setIsInteracting] = useState(false)

  // Keep the last photo on screen while the dialog animates out.
  const [shownSrc, setShownSrc] = useState(src)
  if (src && src !== shownSrc) setShownSrc(src)

  // ─── open lifecycle ───────────────────────────────────────────────────────
  // Every opening starts unzoomed. Focus, Escape, outside presses, scroll
  // locking and focus return belong to the UI SDK Dialog.
  useEffect(() => {
    if (isOpen) {
      setZoom(MIN_ZOOM)
      setPan({ x: 0, y: 0 })
    }
  }, [isOpen])

  // ─── zoom helpers ─────────────────────────────────────────────────────────
  const containerSize = useCallback((): { w: number; h: number } => {
    const el = containerRef.current
    if (!el) return { w: window.innerWidth, h: window.innerHeight }
    return { w: el.clientWidth, h: el.clientHeight }
  }, [])

  const applyZoom = useCallback(
    (
      nextZoom: number,
      focalX: number,
      focalY: number,
      currentPan: Point,
      currentZoom: number,
    ) => {
      const clamped = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM)
      const { w, h } = containerSize()
      // Shift pan so the focal point stays under the finger/cursor
      const scaleChange = clamped / currentZoom
      const rawPan: Point = {
        x: focalX + (currentPan.x - focalX) * scaleChange,
        y: focalY + (currentPan.y - focalY) * scaleChange,
      }
      const clampedPan = clampPan(rawPan, clamped, w, h)
      return { zoom: clamped, pan: clampedPan }
    },
    [containerSize],
  )

  // ─── mouse events ─────────────────────────────────────────────────────────
  const onWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      e.preventDefault()
      const rect = containerRef.current!.getBoundingClientRect()
      const focalX = e.clientX - rect.left - rect.width / 2
      const focalY = e.clientY - rect.top - rect.height / 2
      const factor = 1 - e.deltaY * 0.001
      setZoom((currentZoom) => {
        const nextZoom = clamp(currentZoom * factor, MIN_ZOOM, MAX_ZOOM)
        setPan((currentPan) => {
          const scaleChange = nextZoom / currentZoom
          const { w, h } = containerSize()
          const rawPan = {
            x: focalX + (currentPan.x - focalX) * scaleChange,
            y: focalY + (currentPan.y - focalY) * scaleChange,
          }
          return clampPan(rawPan, nextZoom, w, h)
        })
        return nextZoom
      })
    },
    [containerSize],
  )

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    pointerDown.current = true
    didMove.current = false
    setIsInteracting(true)
    lastPointer.current = { x: e.clientX, y: e.clientY }
  }, [])

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!pointerDown.current) return
      const dx = e.clientX - lastPointer.current.x
      const dy = e.clientY - lastPointer.current.y
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) didMove.current = true
      lastPointer.current = { x: e.clientX, y: e.clientY }
      setZoom((currentZoom) => {
        if (currentZoom <= 1) return currentZoom
        setPan((p) => {
          const { w, h } = containerSize()
          return clampPan({ x: p.x + dx, y: p.y + dy }, currentZoom, w, h)
        })
        return currentZoom
      })
    },
    [containerSize],
  )

  const onMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (!pointerDown.current) return
      pointerDown.current = false
      setIsInteracting(false)
      if (!didMove.current) {
        // It was a tap — toggle zoom
        setZoom((currentZoom) => {
          if (currentZoom > 1) {
            setPan({ x: 0, y: 0 })
            return MIN_ZOOM
          }
          const rect = containerRef.current!.getBoundingClientRect()
          const focalX = e.clientX - rect.left - rect.width / 2
          const focalY = e.clientY - rect.top - rect.height / 2
          setPan((p) => {
            const { zoom: nz, pan: np } = applyZoom(
              ZOOM_IN,
              focalX,
              focalY,
              p,
              currentZoom,
            )
            setZoom(nz)
            return np
          })
          return ZOOM_IN
        })
      }
    },
    [applyZoom],
  )

  // ─── touch events ─────────────────────────────────────────────────────────
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    didMove.current = false
    setIsInteracting(true)
    if (e.touches.length === 1) {
      lastPointer.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      lastPinchDist.current = null
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      lastPinchDist.current = Math.hypot(dx, dy)
    }
  }, [])

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      didMove.current = true
      if (e.touches.length === 1 && lastPinchDist.current === null) {
        const dx = e.touches[0].clientX - lastPointer.current.x
        const dy = e.touches[0].clientY - lastPointer.current.y
        lastPointer.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        }
        setZoom((currentZoom) => {
          if (currentZoom <= 1) return currentZoom
          setPan((p) => {
            const { w, h } = containerSize()
            return clampPan({ x: p.x + dx, y: p.y + dy }, currentZoom, w, h)
          })
          return currentZoom
        })
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        const dist = Math.hypot(dx, dy)
        if (lastPinchDist.current !== null) {
          const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2
          const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2
          const rect = containerRef.current!.getBoundingClientRect()
          const focalX = midX - rect.left - rect.width / 2
          const focalY = midY - rect.top - rect.height / 2
          const factor = dist / lastPinchDist.current
          setZoom((currentZoom) => {
            const nextZoom = clamp(currentZoom * factor, MIN_ZOOM, MAX_ZOOM)
            setPan((currentPan) => {
              const scaleChange = nextZoom / currentZoom
              const { w, h } = containerSize()
              const rawPan = {
                x: focalX + (currentPan.x - focalX) * scaleChange,
                y: focalY + (currentPan.y - focalY) * scaleChange,
              }
              return clampPan(rawPan, nextZoom, w, h)
            })
            return nextZoom
          })
        }
        lastPinchDist.current = dist
      }
    },
    [containerSize],
  )

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 0 && !didMove.current) {
        // Single tap — toggle zoom
        const touch = e.changedTouches[0]
        setZoom((currentZoom) => {
          if (currentZoom > 1) {
            setPan({ x: 0, y: 0 })
            return MIN_ZOOM
          }
          const rect = containerRef.current!.getBoundingClientRect()
          const focalX = touch.clientX - rect.left - rect.width / 2
          const focalY = touch.clientY - rect.top - rect.height / 2
          const nextZoom = ZOOM_IN
          setPan((p) =>
            clampPan(
              {
                x: focalX + (p.x - focalX) * (nextZoom / currentZoom),
                y: focalY + (p.y - focalY) * (nextZoom / currentZoom),
              },
              nextZoom,
              containerSize().w,
              containerSize().h,
            ),
          )
          return nextZoom
        })
      }
      if (e.touches.length < 2) lastPinchDist.current = null
      if (e.touches.length === 0) setIsInteracting(false)
    },
    [containerSize],
  )

  const isZoomed = zoom > 1

  return (
    <Dialog
      open={isOpen && !!src}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent
        showCloseButton={false}
        initialFocus="[data-photo-viewer-close]"
        finalFocus={finalFocus}
        data-photo-viewer=""
        className="block h-dvh max-h-none w-screen max-w-none gap-0 overflow-hidden rounded-none border-0 bg-black/95 p-0 ring-0 duration-300 sm:max-w-none"
        style={{ touchAction: 'none' }}
      >
        <DialogTitle className="sr-only">Photo viewer</DialogTitle>

        <DialogClose
          data-photo-viewer-close=""
          aria-label="Close"
          className="absolute top-4 right-4 z-10 flex size-10 cursor-pointer items-center justify-center rounded-full border-none bg-black/45 backdrop-blur-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 2l14 14M16 2L2 16"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </DialogClose>

        {/* Image container — full screen */}
        <div
          ref={containerRef}
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={() => {
            pointerDown.current = false
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{
            position: 'relative',
            width: '100vw',
            height: '100dvh',
            overflow: 'hidden',
            cursor: isZoomed ? 'grab' : 'zoom-in',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transformOrigin: 'center center',
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              // Only animate on zoom toggles, not during drag/pinch
              transition: isInteracting
                ? 'none'
                : 'transform 300ms cubic-bezier(0.4,0,0.2,1)',
              willChange: 'transform',
            }}
          >
            {shownSrc && (
              <Image
                src={shownSrc}
                alt="photo"
                fill
                style={{ objectFit: 'contain' }}
                draggable={false}
                className="select-none pointer-events-none"
                priority
              />
            )}
          </div>
        </div>

        {/* Tap hint — hidden once zoomed */}
        {!isZoomed && (
          <DialogDescription className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 text-[13px] tracking-[0.02em] text-white/45">
            Tap to zoom · Pinch to zoom
          </DialogDescription>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ImageModal
