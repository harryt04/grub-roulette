'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Sample events function for before_send hook
function sampleByEvent(eventNames: string[], sampleRate: number) {
  return (event: any) => {
    if (eventNames.includes(event.event)) {
      // Return event if sampled (Math.random < sampleRate), otherwise null to drop
      return Math.random() < sampleRate ? event : null
    }
    return event
  }
}

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY

// Only validate POSTHOG_KEY at runtime, not during build
const runningInProduction =
  process.env.NODE_ENV === 'production' && typeof window !== 'undefined'

function PostHogPageView() {
  const pathname = usePathname()
  const posthogInstance = usePostHog()

  useEffect(() => {
    if (pathname && posthogInstance) {
      posthogInstance.capture('$pageview', { pathName: pathname })
    }
  }, [pathname, posthogInstance])

  return null
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  if (!runningInProduction) {
    return <>{children}</>
  }

  if (!POSTHOG_KEY) return <>{children}</>

  posthog.init(POSTHOG_KEY, {
    api_host: '/ingest',
    ui_host: 'https://us.posthog.com',
    before_send: sampleByEvent(['$web_vitals'], 0.5),
  })

  return (
    <PHProvider client={posthog}>
      <PostHogPageView />
      {children}
    </PHProvider>
  )
}
