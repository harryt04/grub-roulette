import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Footer from '@/app/components/footer'

describe('Footer', () => {
  it('renders all footer links', () => {
    render(<Footer />)
    expect(screen.getByText(/tip jar/i)).toBeInTheDocument()
    expect(screen.getByText(/view source code/i)).toBeInTheDocument()
    expect(screen.getByText(/report issue/i)).toBeInTheDocument()
  })

  it('has descriptive aria-labels on all links', () => {
    render(<Footer />)
    const tipJarLink = screen.getByRole('link', {
      name: /buy me a coffee/i,
    })
    const sourceCodeLink = screen.getByRole('link', {
      name: /view source code on github/i,
    })
    const reportIssueLink = screen.getByRole('link', {
      name: /report issue or request feature/i,
    })
    expect(tipJarLink).toBeInTheDocument()
    expect(sourceCodeLink).toBeInTheDocument()
    expect(reportIssueLink).toBeInTheDocument()
  })

  it('all links have correct href attributes', () => {
    render(<Footer />)
    expect(
      screen.getByRole('link', { name: /buy me a coffee/i }),
    ).toHaveAttribute('href', 'https://buymeacoffee.com/harryt04')
    expect(
      screen.getByRole('link', { name: /view source code on github/i }),
    ).toHaveAttribute('href', 'https://github.com/harryt04/grub-roulette')
    expect(
      screen.getByRole('link', { name: /report issue or request feature/i }),
    ).toHaveAttribute('href', 'https://forms.gle/s4hxSSyAcMCyftmn9')
  })

  it('all links open in new tab', () => {
    render(<Footer />)
    const links = screen.getAllByRole('link')
    links.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  it('renders privacy notice text', () => {
    render(<Footer />)
    expect(
      screen.getByText(/your location data is never stored/i),
    ).toBeInTheDocument()
  })
})
