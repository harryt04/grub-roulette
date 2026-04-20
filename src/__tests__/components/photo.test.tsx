import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// PhotoComponent uses next/image with width, height, unoptimized — spread rest props so no warnings
vi.mock('next/image', () => ({
  default: ({ src, alt, ...rest }: any) => <img src={src} alt={alt} />,
}))

import { PhotoComponent } from '@/app/components/photo'

describe('PhotoComponent', () => {
  it('renders an image', () => {
    render(<PhotoComponent photoUrl="https://example.com/photo.jpg" />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('renders with the correct src', () => {
    render(<PhotoComponent photoUrl="https://example.com/photo.jpg" />)
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'https://example.com/photo.jpg',
    )
  })

  it('has alt text "Place photo"', () => {
    render(<PhotoComponent photoUrl="https://example.com/photo.jpg" />)
    expect(screen.getByAltText('Place photo')).toBeInTheDocument()
  })

  it('trims whitespace from photoUrl', () => {
    render(<PhotoComponent photoUrl="  https://example.com/trimmed.jpg  " />)
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'https://example.com/trimmed.jpg',
    )
  })
})
