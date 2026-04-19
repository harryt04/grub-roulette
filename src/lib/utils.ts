import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Builds a Google Maps directions URL for the given address.
 */
export function buildGoogleMapsUrl(address: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
}

/**
 * Extracts today's closing time from a Google Places weekday_text array.
 * Returns '' if not found, schedule is falsy, or today's entry is missing.
 */
export function getClosingTime(schedule: string[]): string {
  if (!schedule || !schedule.length) return ''
  const days = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday',
  ]
  const today = days[new Date().getDay()]
  const entry = schedule.find((s) => s.startsWith(today))
  if (!entry) return ''
  // Split on en-dash (–)
  const parts = entry.split('–')
  if (parts.length < 2) return ''
  let closing = parts[1].trim()
  // Strip :00 suffix (e.g. "9:00 PM" → "9 PM", "10:00 PM" → "10 PM")
  closing = closing.replace(/:00\s/g, ' ').trim()
  return closing
}

/**
 * Returns a price level string like '($$$)' or '' if falsy.
 */
export function priceLevelString(count?: number): string {
  if (!count) return ''
  return `(${'$'.repeat(count)})`
}

/**
 * Extracts the main domain (e.g. 'example.com') from a full URL.
 * Returns '' on any error.
 */
export function getMainDomain(url: string): string {
  try {
    const { hostname } = new URL(url)
    const match = hostname.match(/[^.]+\.[^.]+$/)
    return match ? match[0] : hostname
  } catch {
    return ''
  }
}

/**
 * Safely parses JSON. Returns fallback on null input or any parse error.
 */
export function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (raw === null) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}
