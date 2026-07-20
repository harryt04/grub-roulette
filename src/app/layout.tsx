import type { Metadata } from 'next'
import { Baloo_2, Figtree } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { PostHogProvider } from './components/posthogProvider'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'

const figtree = Figtree({ subsets: ['latin'], variable: '--font-sans' })
const baloo2 = Baloo_2({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-heading',
})

export const metadata: Metadata = {
  title: 'Grub Roulette',
  description: 'Randomly choose a restaurant near you',
  icons: {
    apple: '/apple-touch-icon.png',
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
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
    --background:         oklch(0.97 0.02 55);
    --card:               oklch(1 0 0);
    --popover:            oklch(1 0 0);
    --muted:              oklch(0.94 0.025 55);
    --border:             oklch(0.91 0.02 55);
    --muted-foreground:   oklch(0.55 0.03 55);
  }
  .dark[data-palette="mango"] {
    --primary:            oklch(0.78 0.2 55);
    --primary-foreground: oklch(0.1 0.04 240);
    --accent:             oklch(0.28 0.06 240);
    --accent-foreground:  oklch(0.98 0 0);
    --ring:               oklch(0.78 0.2 55);
    --background:         oklch(0.19 0.02 55);
    --card:               oklch(0.23 0.022 55);
    --popover:            oklch(0.23 0.022 55);
    --muted:              oklch(0.27 0.02 55);
    --border:             oklch(0.5 0.02 55 / 25%);
    --muted-foreground:   oklch(0.68 0.025 55);
  }

  /* 🫐 Electric Blue — cerulean hue (~245) */
  [data-palette="blue"] {
    --primary:            oklch(0.58 0.22 245);
    --primary-foreground: oklch(0.98 0 0);
    --accent:             oklch(0.80 0.18 85);
    --accent-foreground:  oklch(0.12 0 0);
    --ring:               oklch(0.58 0.22 245);
    --background:         oklch(0.97 0.02 245);
    --card:               oklch(1 0 0);
    --popover:            oklch(1 0 0);
    --muted:              oklch(0.94 0.025 245);
    --border:             oklch(0.91 0.02 245);
    --muted-foreground:   oklch(0.55 0.03 245);
  }
  .dark[data-palette="blue"] {
    --primary:            oklch(0.65 0.22 245);
    --primary-foreground: oklch(0.98 0 0);
    --accent:             oklch(0.76 0.18 85);
    --accent-foreground:  oklch(0.12 0 0);
    --ring:               oklch(0.65 0.22 245);
    --background:         oklch(0.19 0.02 245);
    --card:               oklch(0.23 0.022 245);
    --popover:            oklch(0.23 0.022 245);
    --muted:              oklch(0.27 0.02 245);
    --border:             oklch(0.5 0.02 245 / 25%);
    --muted-foreground:   oklch(0.68 0.025 245);
  }

  /* 🌶️ Hot Sauce — coral hue (~28) */
  [data-palette="hotsauce"] {
    --primary:            oklch(0.68 0.2 28);
    --primary-foreground: oklch(0.98 0 0);
    --accent:             oklch(0.38 0.1 195);
    --accent-foreground:  oklch(0.98 0 0);
    --ring:               oklch(0.68 0.2 28);
    --background:         oklch(0.97 0.02 28);
    --card:               oklch(1 0 0);
    --popover:            oklch(1 0 0);
    --muted:              oklch(0.94 0.025 28);
    --border:             oklch(0.91 0.02 28);
    --muted-foreground:   oklch(0.55 0.03 28);
  }
  .dark[data-palette="hotsauce"] {
    --primary:            oklch(0.72 0.21 28);
    --primary-foreground: oklch(0.98 0 0);
    --accent:             oklch(0.42 0.1 195);
    --accent-foreground:  oklch(0.98 0 0);
    --ring:               oklch(0.72 0.21 28);
    --background:         oklch(0.19 0.02 28);
    --card:               oklch(0.23 0.022 28);
    --popover:            oklch(0.23 0.022 28);
    --muted:              oklch(0.27 0.02 28);
    --border:             oklch(0.5 0.02 28 / 25%);
    --muted-foreground:   oklch(0.68 0.025 28);
  }

  /* 🍋 Lemon Drop — yellow-lime hue (~105) */
  [data-palette="lemon"] {
    --primary:            oklch(0.87 0.2 105);
    --primary-foreground: oklch(0.15 0.06 280);
    --accent:             oklch(0.30 0.12 280);
    --accent-foreground:  oklch(0.98 0 0);
    --ring:               oklch(0.87 0.2 105);
    --background:         oklch(0.97 0.02 105);
    --card:               oklch(1 0 0);
    --popover:            oklch(1 0 0);
    --muted:              oklch(0.94 0.025 105);
    --border:             oklch(0.91 0.02 105);
    --muted-foreground:   oklch(0.55 0.03 105);
  }
  .dark[data-palette="lemon"] {
    --primary:            oklch(0.88 0.21 105);
    --primary-foreground: oklch(0.12 0.06 280);
    --accent:             oklch(0.35 0.12 280);
    --accent-foreground:  oklch(0.98 0 0);
    --ring:               oklch(0.88 0.21 105);
    --background:         oklch(0.19 0.02 105);
    --card:               oklch(0.23 0.022 105);
    --popover:            oklch(0.23 0.022 105);
    --muted:              oklch(0.27 0.02 105);
    --border:             oklch(0.5 0.02 105 / 25%);
    --muted-foreground:   oklch(0.68 0.025 105);
  }
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <html
        lang="en"
        suppressHydrationWarning
        className={cn(figtree.variable, baloo2.variable)}
      >
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
