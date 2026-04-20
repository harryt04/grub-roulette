'use client'

import { ThemeProvider } from 'next-themes'
import { PaletteProvider } from './context/paletteContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      scriptProps={{ async: true }}
    >
      <PaletteProvider>{children}</PaletteProvider>
    </ThemeProvider>
  )
}
