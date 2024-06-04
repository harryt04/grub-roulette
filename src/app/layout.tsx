import type { Metadata } from 'next'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter'
import './globals.css'
import { ThemeProvider } from '@mui/material/styles'
import theme from '../theme'
import { Analytics } from '@vercel/analytics/react'
export const metadata: Metadata = {
  title: 'Grub Roulette',
  description: 'Randomly choose a restaurant near you',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <link
        type="image/png"
        sizes="96x96"
        rel="icon"
        href="/favicon-badass.png"
      ></link>
      <html lang="en">
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <body>{children}</body>
            <Analytics />
          </ThemeProvider>
        </AppRouterCacheProvider>
      </html>
    </>
  )
}
