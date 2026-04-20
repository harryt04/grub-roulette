import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const mockSetTheme = vi.fn()

vi.mock('next-themes', () => ({
  useTheme: vi.fn(),
}))

// Mock lucide-react icons to avoid SVG rendering issues
vi.mock('lucide-react', () => ({
  Moon: () => <svg data-testid="moon-icon" />,
  Sun: () => <svg data-testid="sun-icon" />,
}))

// Mock shadcn Button — render a plain <button> passing through aria-label, onClick, disabled
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, 'aria-label': ariaLabel, disabled }: any) => (
    <button onClick={onClick} aria-label={ariaLabel} disabled={disabled}>
      {children}
    </button>
  ),
}))

// Mock Tooltip — TooltipTrigger uses a `render` prop (not children)
vi.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: any) => <>{children}</>,
  Tooltip: ({ children }: any) => <>{children}</>,
  TooltipTrigger: ({ render: renderProp }: any) => renderProp,
  TooltipContent: ({ children }: any) => <span>{children}</span>,
}))

import { useTheme } from 'next-themes'
import DarkModeSwitch from '@/app/components/darkModeSwitch'

const mockUseTheme = useTheme as ReturnType<typeof vi.fn>

describe('DarkModeSwitch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a button without crashing', () => {
    mockUseTheme.mockReturnValue({
      resolvedTheme: undefined,
      setTheme: mockSetTheme,
    })
    render(<DarkModeSwitch />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('shows "Switch to Dark Mode" label in light mode', async () => {
    mockUseTheme.mockReturnValue({
      resolvedTheme: 'light',
      setTheme: mockSetTheme,
    })
    render(<DarkModeSwitch />)
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /switch to dark mode/i }),
      ).toBeInTheDocument(),
    )
  })

  it('shows "Switch to Light Mode" label in dark mode', async () => {
    mockUseTheme.mockReturnValue({
      resolvedTheme: 'dark',
      setTheme: mockSetTheme,
    })
    render(<DarkModeSwitch />)
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /switch to light mode/i }),
      ).toBeInTheDocument(),
    )
  })

  it('calls setTheme("dark") when clicked in light mode', async () => {
    mockUseTheme.mockReturnValue({
      resolvedTheme: 'light',
      setTheme: mockSetTheme,
    })
    render(<DarkModeSwitch />)
    await waitFor(() =>
      screen.getByRole('button', { name: /switch to dark mode/i }),
    )
    fireEvent.click(
      screen.getByRole('button', { name: /switch to dark mode/i }),
    )
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('calls setTheme("light") when clicked in dark mode', async () => {
    mockUseTheme.mockReturnValue({
      resolvedTheme: 'dark',
      setTheme: mockSetTheme,
    })
    render(<DarkModeSwitch />)
    await waitFor(() =>
      screen.getByRole('button', { name: /switch to light mode/i }),
    )
    fireEvent.click(
      screen.getByRole('button', { name: /switch to light mode/i }),
    )
    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })
})
