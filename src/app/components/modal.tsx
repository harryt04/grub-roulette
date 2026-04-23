'use client'
import Image from 'next/image'
import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'

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
}: {
  src: string | null
  isOpen: boolean
  onClose: () => void
}) => {
  const visibleRef = useRef(false) // controls mount without re-renders
  const [animating, setAnimating] = useState<'in' | 'out' | 'idle'>('idle')
  const [zoom, setZoom] = useState(MIN_ZOOM)
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Pointer / touch tracking refs — no re-renders during drag
  const pointerDown = useRef(false)
  const lastPointer = useRef<Point>({ x: 0, y: 0 })
  const lastPinchDist = useRef<number | null>(null)
  const didMove = useRef(false) // distinguish tap from drag
  const [isInteracting, setIsInteracting] = useState(false)

  // ─── open / close lifecycle ───────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setZoom(MIN_ZOOM)
      setPan({ x: 0, y: 0 })
      visibleRef.current = true
      // Let the element mount, then trigger enter animation and focus
      requestAnimationFrame(() => {
        setAnimating('in')
        containerRef.current?.focus()
      })
    } else if (visibleRef.current) {
      setAnimating('out')
    }
  }, [isOpen])

  useEffect(() => {
    if (!visibleRef.current) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const handleTransitionEnd = () => {
    if (animating === 'out') visibleRef.current = false
    setAnimating('idle')
  }

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
        const currentZoom = zoom
        if (currentZoom > 1) {
          setZoom(MIN_ZOOM)
          setPan({ x: 0, y: 0 })
        } else {
          const rect = containerRef.current!.getBoundingClientRect()
          const focalX = e.clientX - rect.left - rect.width / 2
          const focalY = e.clientY - rect.top - rect.height / 2
          const { zoom: nz, pan: np } = applyZoom(
            ZOOM_IN,
            focalX,
            focalY,
            pan,
            currentZoom,
          )
          setZoom(nz)
          setPan(np)
        }
      }
    },
    [applyZoom, zoom, pan],
  )

  // ─── touch events ─────────────────────────────────────────────────────────
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    didMove.current = false
    setIsInteracting(true)
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      if (touch) {
        lastPointer.current = { x: touch.clientX, y: touch.clientY }
        lastPinchDist.current = null
      }
    } else if (e.touches.length === 2) {
      const touch0 = e.touches[0]
      const touch1 = e.touches[1]
      if (touch0 && touch1) {
        const dx = touch0.clientX - touch1.clientX
        const dy = touch0.clientY - touch1.clientY
        lastPinchDist.current = Math.hypot(dx, dy)
      }
    }
  }, [])

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      didMove.current = true
      if (e.touches.length === 1 && lastPinchDist.current === null) {
        const touch0 = e.touches[0]
        if (touch0) {
          const dx = touch0.clientX - lastPointer.current.x
          const dy = touch0.clientY - lastPointer.current.y
          lastPointer.current = {
            x: touch0.clientX,
            y: touch0.clientY,
          }
          setZoom((currentZoom) => {
            if (currentZoom <= 1) return currentZoom
            setPan((p) => {
              const { w, h } = containerSize()
              return clampPan({ x: p.x + dx, y: p.y + dy }, currentZoom, w, h)
            })
            return currentZoom
          })
        }
      } else if (e.touches.length === 2) {
        const touch0 = e.touches[0]
        const touch1 = e.touches[1]
        if (touch0 && touch1) {
          const dx = touch0.clientX - touch1.clientX
          const dy = touch0.clientY - touch1.clientY
          const dist = Math.hypot(dx, dy)
          if (lastPinchDist.current !== null) {
            const midX = (touch0.clientX + touch1.clientX) / 2
            const midY = (touch0.clientY + touch1.clientY) / 2
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
      }
    },
    [containerSize],
  )

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 0 && !didMove.current) {
        // Single tap — toggle zoom
        const touch = e.changedTouches[0]
        if (touch) {
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
      }
      if (e.touches.length < 2) lastPinchDist.current = null
      if (e.touches.length === 0) setIsInteracting(false)
    },
    [containerSize],
  )

  // Block body scroll while open
  useEffect(() => {
    if (visibleRef.current) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  if (!visibleRef.current || !src) return null

  const proxyUrl = `/api/getPhotos?reference=${encodeURIComponent(src)}`
  const isZoomed = zoom > 1
  const overlayOpacity = animating === 'in' ? 1 : animating === 'out' ? 0 : 1
  const contentScale = animating === 'in' ? 1 : animating === 'out' ? 0.92 : 1
  const contentOpacity = animating === 'in' ? 1 : animating === 'out' ? 0 : 1

  return createPortal(
    <div
      aria-modal
      role="dialog"
      aria-label="Photo viewer"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: `rgba(0,0,0,${overlayOpacity * 0.95})`,
        transition: 'background-color 280ms cubic-bezier(0.4,0,0.2,1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'none',
      }}
      onTransitionEnd={handleTransitionEnd}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 10,
          background: 'rgba(0,0,0,0.45)',
          border: 'none',
          borderRadius: '50%',
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          opacity: contentOpacity,
          transition: 'opacity 280ms cubic-bezier(0.4,0,0.2,1)',
        }}
        aria-label="Close"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            d="M2 2l14 14M16 2L2 16"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Image container — full screen */}
      <div
        ref={containerRef}
        tabIndex={-1}
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
          opacity: contentOpacity,
          transform: `scale(${contentScale})`,
          transition:
            'opacity 280ms cubic-bezier(0.4,0,0.2,1), transform 280ms cubic-bezier(0.4,0,0.2,1)',
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
          <Image
            src={proxyUrl}
            alt="photo"
            fill
            style={{ objectFit: 'contain' }}
            draggable={false}
            className="select-none pointer-events-none"
            priority
          />
        </div>
      </div>

      {/* Tap hint — fades out once zoomed */}
      {!isZoomed && (
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'rgba(255,255,255,0.45)',
            fontSize: 13,
            pointerEvents: 'none',
            opacity: contentOpacity,
            transition: 'opacity 280ms',
            letterSpacing: '0.02em',
          }}
        >
          Tap to zoom · Pinch to zoom
        </div>
      )}
    </div>,
    document.body,
  )
}

export default ImageModal
