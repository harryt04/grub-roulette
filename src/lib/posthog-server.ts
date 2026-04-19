import { PostHog } from 'posthog-node'

export function getPostHogClient(): PostHog {
  if (process.env.NODE_ENV !== 'production') {
    return { capture: () => {} } as unknown as PostHog
  }

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key) {
    throw new Error('NEXT_PUBLIC_POSTHOG_KEY is not set')
  }

  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com'

  return new PostHog(key, {
    host,
    flushAt: 1,
    flushInterval: 0,
  })
}
