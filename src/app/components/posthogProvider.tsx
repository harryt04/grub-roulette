'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'

if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  throw new Error('NEXT_PUBLIC_POSTHOG_KEY is not set')
}
posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
  api_host: '/ingest',
  ui_host: 'https://us.posthog.com',
})

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const runningInProduction = process.env.NODE_ENV === 'production'

  const router = useRouter()

  useEffect(() => {
    if (!runningInProduction) {
      return
    }
    const handleRouteChange = (url: string) => {
      posthog.capture('$pageview', { url }) // Track page view
    }

    router.events.on('routeChangeComplete', handleRouteChange)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events, runningInProduction])

  if (!runningInProduction) {
    return <>{children}</> // Don't send events in dev mode
  }

  return <PHProvider client={posthog}>{children}</PHProvider>
}
