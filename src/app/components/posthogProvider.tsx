'use client'
import { useEffect } from 'react'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { sampleByEvent } from 'posthog-js/lib/src/customizations/before-send.js'

const runningInProduction =
  process.env.NODE_ENV === 'production' &&
  typeof window !== 'undefined' &&
  !!process.env.NEXT_PUBLIC_POSTHOG_KEY

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!runningInProduction) {
      return
    }
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: '/ingest',
      ui_host: 'https://us.posthog.com',
      before_send: sampleByEvent(['$web_vitals'], 0.5),
    })
  }, [])

  if (!runningInProduction) {
    return <>{children}</> // Don't send events in dev mode
  }

  return <PHProvider client={posthog}>{children}</PHProvider>
}
