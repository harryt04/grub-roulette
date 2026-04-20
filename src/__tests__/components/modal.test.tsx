import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}))

// Mock createPortal to render inline in tests
vi.mock('react-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-dom')>()
  return {
    ...actual,
    createPortal: (node: React.ReactNode) => node,
  }
})

import ImageModal from '@/app/components/modal'

describe('ImageModal', () => {
  it('does not render when isOpen is false', () => {
    render(
      <ImageModal
        src="https://example.com/img.jpg"
        isOpen={false}
        onClose={vi.fn()}
      />,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders when isOpen is true', () => {
    render(
      <ImageModal
        src="https://example.com/img.jpg"
        isOpen={true}
        onClose={vi.fn()}
      />,
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('renders an image with the correct src', () => {
    render(
      <ImageModal
        src="https://example.com/img.jpg"
        isOpen={true}
        onClose={vi.fn()}
      />,
    )
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'https://example.com/img.jpg',
    )
  })

  it('image has alt text "photo"', () => {
    render(
      <ImageModal
        src="https://example.com/img.jpg"
        isOpen={true}
        onClose={vi.fn()}
      />,
    )
    expect(screen.getByAltText('photo')).toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn()
    render(
      <ImageModal
        src="https://example.com/img.jpg"
        isOpen={true}
        onClose={onClose}
      />,
    )
    fireEvent.click(screen.getByLabelText('Close'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when the Escape key is pressed', () => {
    const onClose = vi.fn()
    render(
      <ImageModal
        src="https://example.com/img.jpg"
        isOpen={true}
        onClose={onClose}
      />,
    )
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('does not call onClose for other keys', () => {
    const onClose = vi.fn()
    render(
      <ImageModal
        src="https://example.com/img.jpg"
        isOpen={true}
        onClose={onClose}
      />,
    )
    fireEvent.keyDown(window, { key: 'Enter' })
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('does not call onClose on Escape when modal is closed', () => {
    const onClose = vi.fn()
    render(
      <ImageModal
        src="https://example.com/img.jpg"
        isOpen={false}
        onClose={onClose}
      />,
    )
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })
})
