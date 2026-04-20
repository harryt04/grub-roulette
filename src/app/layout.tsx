import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { PostHogProvider } from './components/posthogProvider'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Grub Roulette',
  description: 'Randomly choose a restaurant near you',
}

// Palette CSS is injected as a raw <style> tag so Tailwind v4 cannot purge
// the [data-palette] attribute selectors (they never appear in .tsx source files).
const PALETTE_STYLES = `
  /* 🥭 Neon Mango — amber/orange hue (~55) */
  [data-palette="mango"] {
    --primary:            oklch(0.72 0.19 55);
    --primary-foreground: oklch(0.12 0.04 240);
    --accent:             oklch(0.22 0.06 240);
    --accent-foreground:  oklch(0.98 0 0);
    --ring:               oklch(0.72 0.19 55);
    --background:         oklch(0.98 0.02 55);
    --card:               oklch(0.96 0.03 55);
    --popover:            oklch(0.96 0.03 55);
    --muted:              oklch(0.94 0.03 55);
  }
  .dark[data-palette="mango"] {
    --primary:            oklch(0.78 0.2 55);
    --primary-foreground: oklch(0.1 0.04 240);
    --accent:             oklch(0.28 0.06 240);
    --accent-foreground:  oklch(0.98 0 0);
    --ring:               oklch(0.78 0.2 55);
    --background:         oklch(0.14 0.03 55);
    --card:               oklch(0.18 0.04 55);
    --popover:            oklch(0.18 0.04 55);
    --muted:              oklch(0.22 0.04 55);
  }

  /* 🫐 Electric Blue — cerulean hue (~245) */
  [data-palette="blue"] {
    --primary:            oklch(0.58 0.22 245);
    --primary-foreground: oklch(0.98 0 0);
    --accent:             oklch(0.80 0.18 85);
    --accent-foreground:  oklch(0.12 0 0);
    --ring:               oklch(0.58 0.22 245);
    --background:         oklch(0.97 0.02 245);
    --card:               oklch(0.95 0.03 245);
    --popover:            oklch(0.95 0.03 245);
    --muted:              oklch(0.93 0.03 245);
  }
  .dark[data-palette="blue"] {
    --primary:            oklch(0.65 0.22 245);
    --primary-foreground: oklch(0.98 0 0);
    --accent:             oklch(0.76 0.18 85);
    --accent-foreground:  oklch(0.12 0 0);
    --ring:               oklch(0.65 0.22 245);
    --background:         oklch(0.13 0.03 245);
    --card:               oklch(0.17 0.04 245);
    --popover:            oklch(0.17 0.04 245);
    --muted:              oklch(0.21 0.04 245);
  }

  /* 🌶️ Hot Sauce — coral hue (~28) */
  [data-palette="hotsauce"] {
    --primary:            oklch(0.68 0.2 28);
    --primary-foreground: oklch(0.98 0 0);
    --accent:             oklch(0.38 0.1 195);
    --accent-foreground:  oklch(0.98 0 0);
    --ring:               oklch(0.68 0.2 28);
    --background:         oklch(0.98 0.02 28);
    --card:               oklch(0.96 0.03 28);
    --popover:            oklch(0.96 0.03 28);
    --muted:              oklch(0.94 0.03 28);
  }
  .dark[data-palette="hotsauce"] {
    --primary:            oklch(0.72 0.21 28);
    --primary-foreground: oklch(0.98 0 0);
    --accent:             oklch(0.42 0.1 195);
    --accent-foreground:  oklch(0.98 0 0);
    --ring:               oklch(0.72 0.21 28);
    --background:         oklch(0.14 0.03 28);
    --card:               oklch(0.18 0.04 28);
    --popover:            oklch(0.18 0.04 28);
    --muted:              oklch(0.22 0.04 28);
  }

  /* 🍋 Lemon Drop — yellow-lime hue (~105) */
  [data-palette="lemon"] {
    --primary:            oklch(0.87 0.2 105);
    --primary-foreground: oklch(0.15 0.06 280);
    --accent:             oklch(0.30 0.12 280);
    --accent-foreground:  oklch(0.98 0 0);
    --ring:               oklch(0.87 0.2 105);
    --background:         oklch(0.98 0.02 105);
    --card:               oklch(0.96 0.03 105);
    --popover:            oklch(0.96 0.03 105);
    --muted:              oklch(0.94 0.03 105);
  }
  .dark[data-palette="lemon"] {
    --primary:            oklch(0.88 0.21 105);
    --primary-foreground: oklch(0.12 0.06 280);
    --accent:             oklch(0.35 0.12 280);
    --accent-foreground:  oklch(0.98 0 0);
    --ring:               oklch(0.88 0.21 105);
    --background:         oklch(0.13 0.03 105);
    --card:               oklch(0.17 0.04 105);
    --popover:            oklch(0.17 0.04 105);
    --muted:              oklch(0.21 0.04 105);
  }
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <html lang="en" suppressHydrationWarning className={inter.variable}>
        {/* eslint-disable-next-line react/no-danger */}
        <head>
          <style dangerouslySetInnerHTML={{ __html: PALETTE_STYLES }} />
        </head>
        <body>
          <PostHogProvider>
            <Providers>
              {children}
              <Toaster />
            </Providers>
          </PostHogProvider>
        </body>
      </html>
    </>
  )
}
