import type { Metadata } from 'next'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter'
import './globals.css'
import { ThemeProvider } from '@mui/material/styles'
import theme from '../theme'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata: Metadata = {
  title: 'Grub Roulette',
  description: 'Randomly choose a restaurant near you',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const isProduction = process.env.NODE_ENV === 'production'

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

            {isProduction && (
              <>
                <Analytics />
                <SpeedInsights />
              </>
            )}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </html>
    </>
  )
}
