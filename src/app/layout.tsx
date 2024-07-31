// RootLayout.js
import type { Metadata } from 'next'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter'
import './globals.css'
import CustomThemeProvider from './CustomThemeProvider'
import { PostHogProvider } from './components/posthogProvider'

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
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      ></link>
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      ></link>
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      ></link>
      <link rel="manifest" href="/site.webmanifest"></link>
      <html lang="en">
        <PostHogProvider>
          <AppRouterCacheProvider>
            <CustomThemeProvider>
              <body>{children}</body>
            </CustomThemeProvider>
          </AppRouterCacheProvider>
        </PostHogProvider>
      </html>
    </>
  )
}
