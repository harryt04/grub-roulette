import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const mockSetTheme = vi.fn()
const mockSetPalette = vi.fn()

vi.mock('next-themes', () => ({
  useTheme: vi.fn(),
}))

vi.mock('@/app/context/paletteContext', async () => {
  const actual = await vi.importActual<
    typeof import('@/app/context/paletteContext')
  >('@/app/context/paletteContext')

  return {
    ...actual,
    usePalette: vi.fn(),
  }
})

vi.mock('lucide-react', () => ({
  Monitor: () => <svg data-testid="monitor-icon" />,
  Palette: () => <svg data-testid="palette-icon" />,
  Sun: () => <svg data-testid="sun-icon" />,
  Moon: () => <svg data-testid="moon-icon" />,
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}))

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuGroup: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  DropdownMenuLabel: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ render: renderProp }: any) => renderProp,
}))

import { useTheme } from 'next-themes'
import { usePalette } from '@/app/context/paletteContext'
import ThemeSwitcher from '@/app/components/themeSwitcher'

const mockUseTheme = useTheme as ReturnType<typeof vi.fn>
const mockUsePalette = usePalette as ReturnType<typeof vi.fn>

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseTheme.mockReturnValue({
      theme: 'system',
      setTheme: mockSetTheme,
    })
    mockUsePalette.mockReturnValue({
      palette: 'mango',
      setPalette: mockSetPalette,
    })
  })

  it('offers system, light, and dark display modes', async () => {
    render(<ThemeSwitcher />)

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /system/i }),
      ).toBeInTheDocument()
    })
    expect(
      screen.getByRole('button', { name: /light mode/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /dark mode/i }),
    ).toBeInTheDocument()
  })

  it('sets the selected display mode explicitly', async () => {
    render(<ThemeSwitcher />)

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /light mode/i })).toBeEnabled(),
    )

    fireEvent.click(screen.getByRole('button', { name: /light mode/i }))
    fireEvent.click(screen.getByRole('button', { name: /dark mode/i }))
    fireEvent.click(screen.getByRole('button', { name: /system/i }))

    expect(mockSetTheme).toHaveBeenNthCalledWith(1, 'light')
    expect(mockSetTheme).toHaveBeenNthCalledWith(2, 'dark')
    expect(mockSetTheme).toHaveBeenNthCalledWith(3, 'system')
  })
})
