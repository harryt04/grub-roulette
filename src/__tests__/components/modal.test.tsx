import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// Mock next/image — modal uses fill so we accept extra props
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}))

// Mock @/components/ui/dialog with simple wrappers
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, onOpenChange, children }: any) =>
    open ? (
      <div data-testid="dialog" onClick={() => onOpenChange(false)}>
        {children}
      </div>
    ) : null,
  DialogContent: ({ children }: any) => <div>{children}</div>,
}))

import ImageModal from '@/app/components/modal'

describe('ImageModal', () => {
  it('does not render when isOpen is false', () => {
    render(<ImageModal src="https://example.com/img.jpg" isOpen={false} onClose={vi.fn()} />)
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
  })

  it('renders when isOpen is true', () => {
    render(<ImageModal src="https://example.com/img.jpg" isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByTestId('dialog')).toBeInTheDocument()
  })

  it('renders an image with the correct src', () => {
    render(<ImageModal src="https://example.com/img.jpg" isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/img.jpg')
  })

  it('image has alt text "modal photo"', () => {
    render(<ImageModal src="https://example.com/img.jpg" isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByAltText('modal photo')).toBeInTheDocument()
  })

  it('calls onClose when dialog onOpenChange fires with false', () => {
    const onClose = vi.fn()
    render(<ImageModal src="https://example.com/img.jpg" isOpen={true} onClose={onClose} />)
    fireEvent.click(screen.getByTestId('dialog'))
    expect(onClose).toHaveBeenCalled()
  })
})
