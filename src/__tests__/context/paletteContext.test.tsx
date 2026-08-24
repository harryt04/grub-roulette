import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PaletteProvider, usePalette } from '@/app/context/paletteContext'

function PaletteProbe() {
  const { palette, setPalette } = usePalette()

  return (
    <div>
      <span data-testid="palette">{palette}</span>
      <button onClick={() => setPalette('lemon')}>Choose lemon</button>
    </div>
  )
}

describe('PaletteProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('chooses and stores a random palette when none is saved', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.2)

    render(
      <PaletteProvider>
        <PaletteProbe />
      </PaletteProvider>,
    )

    await waitFor(() =>
      expect(screen.getByTestId('palette')).toHaveTextContent('mango'),
    )
    expect(localStorage.getItem('grubroulette_palette')).toBe('mango')
  })

  it('uses the saved palette instead of choosing another one', async () => {
    localStorage.setItem('grubroulette_palette', 'blue')
    const random = vi.spyOn(Math, 'random')

    render(
      <PaletteProvider>
        <PaletteProbe />
      </PaletteProvider>,
    )

    await waitFor(() =>
      expect(screen.getByTestId('palette')).toHaveTextContent('blue'),
    )
    expect(random).not.toHaveBeenCalled()
  })

  it('stores a palette after the user changes it', async () => {
    localStorage.setItem('grubroulette_palette', 'blue')

    render(
      <PaletteProvider>
        <PaletteProbe />
      </PaletteProvider>,
    )

    await waitFor(() =>
      expect(screen.getByTestId('palette')).toHaveTextContent('blue'),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Choose lemon' }))

    expect(localStorage.getItem('grubroulette_palette')).toBe('lemon')
  })
})
