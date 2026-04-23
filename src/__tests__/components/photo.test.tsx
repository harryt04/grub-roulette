import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// PhotoComponent uses next/image with width, height — mock to avoid warnings
vi.mock('next/image', () => ({
  default: ({ src, alt, ...rest }: any) => <img src={src} alt={alt} />,
}))

import { PhotoComponent } from '@/app/components/photo'

describe('PhotoComponent', () => {
  it('renders an image', () => {
    render(<PhotoComponent photoReference="REF_123" alt="Test photo" />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('builds proxy URL with reference parameter', () => {
    render(<PhotoComponent photoReference="REF_ABC" alt="Test photo" />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', '/api/getPhotos?reference=REF_ABC')
  })

  it('uses provided alt text', () => {
    render(
      <PhotoComponent
        photoReference="REF_123"
        alt="Photo of Italian Restaurant"
      />,
    )
    expect(
      screen.getByAltText('Photo of Italian Restaurant'),
    ).toBeInTheDocument()
  })

  it('URL-encodes special characters in reference', () => {
    render(
      <PhotoComponent photoReference="REF/WITH+SPECIAL" alt="Special photo" />,
    )
    const img = screen.getByRole('img')
    const src = img.getAttribute('src') || ''
    expect(src).toContain('reference=REF%2FWITH%2BSPECIAL')
  })

  it('renders multiple instances with different references', () => {
    const { rerender } = render(
      <PhotoComponent photoReference="REF_1" alt="Photo 1" />,
    )
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      '/api/getPhotos?reference=REF_1',
    )

    rerender(<PhotoComponent photoReference="REF_2" alt="Photo 2" />)
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      '/api/getPhotos?reference=REF_2',
    )
  })
})
