'use client'

import { useEffect, useState, type ComponentProps, type RefObject } from 'react'
import { createPortal } from 'react-dom'

type PortalProps = ComponentProps<'div'> & {
  container?: Element | RefObject<Element | null> | null
}

export function Portal({ container, ...props }: PortalProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const parent =
    container && 'current' in container ? container.current : container
  return createPortal(<div {...props} />, parent ?? document.body)
}
