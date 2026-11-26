import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

import ImageModal from '@/app/components/modal'

// The viewer is a UI SDK Dialog, which opens in the top layer. jsdom lacks the
// Popover API and the scroll-lock helpers it uses, so add the stubs from
// node_modules/@ui-sdk/core/skills/ui-sdk/references/testing.md. Placement,
// focus trapping and focus return run in Chromium in e2e/photoViewer.spec.ts.
beforeAll(() => {
  HTMLElement.prototype.showPopover = function () {}
  HTMLElement.prototype.hidePopover = function () {}
  Element.prototype.getAnimations = () => []
  Element.prototype.scrollIntoView = function () {}
  Element.prototype.checkVisibility = () => true
  Element.prototype.getClientRects = () => [] as unknown as DOMRectList
  document.elementFromPoint = () => null
  document.elementsFromPoint = () => []
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  if (typeof CSS.supports !== 'function') {
    Object.assign(CSS, { supports: () => false })
  }
  document.head.append(
    Object.assign(document.createElement('style'), {
      textContent: '[popover] { display: block !important }',
    }),
  )
})

const SRC = 'https://example.com/img.jpg'

describe('ImageModal', () => {
  it('does not render when isOpen is false', () => {
    render(<ImageModal src={SRC} isOpen={false} onClose={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders a modal dialog named "Photo viewer" when isOpen is true', async () => {
    render(<ImageModal src={SRC} isOpen={true} onClose={vi.fn()} />)
    const dialog = await screen.findByRole('dialog', { name: 'Photo viewer' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAccessibleDescription('Tap to zoom · Pinch to zoom')
  })

  it('does not render when there is no photo', () => {
    render(<ImageModal src={null} isOpen={true} onClose={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders an image with the correct src', async () => {
    render(<ImageModal src={SRC} isOpen={true} onClose={vi.fn()} />)
    await screen.findByRole('dialog', { name: 'Photo viewer' })
    expect(screen.getByRole('img')).toHaveAttribute('src', SRC)
  })

  it('image has alt text "photo"', () => {
    render(<ImageModal src={SRC} isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByAltText('photo')).toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn()
    render(<ImageModal src={SRC} isOpen={true} onClose={onClose} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when the Escape key is pressed', async () => {
    const onClose = vi.fn()
    render(<ImageModal src={SRC} isOpen={true} onClose={onClose} />)
    const dialog = await screen.findByRole('dialog', { name: 'Photo viewer' })
    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose for other keys', async () => {
    const onClose = vi.fn()
    render(<ImageModal src={SRC} isOpen={true} onClose={onClose} />)
    const dialog = await screen.findByRole('dialog', { name: 'Photo viewer' })
    fireEvent.keyDown(dialog, { key: 'Enter' })
    fireEvent.keyDown(dialog, { key: 'ArrowLeft' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('does not call onClose on Escape when modal is closed', () => {
    const onClose = vi.fn()
    render(<ImageModal src={SRC} isOpen={false} onClose={onClose} />)
    fireEvent.keyDown(document.body, { key: 'Escape' })
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })
})
