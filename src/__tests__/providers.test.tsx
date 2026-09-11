import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'

const themeProviderProps = vi.fn()

vi.mock('next-themes', () => ({
  ThemeProvider: ({ children, ...props }: any) => {
    themeProviderProps(props)
    return <>{children}</>
  },
}))

vi.mock('@/app/context/paletteContext', () => ({
  PaletteProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

import { Providers } from '@/app/providers'

describe('Providers', () => {
  it('defaults to system mode without forcing light or dark', () => {
    render(
      <Providers>
        <div>content</div>
      </Providers>,
    )

    expect(themeProviderProps).toHaveBeenCalledWith({
      attribute: 'class',
      defaultTheme: 'system',
      enableSystem: true,
      disableTransitionOnChange: true,
    })
  })
})
