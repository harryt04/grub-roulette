/**
 * Extracts the apex domain (e.g. "example.com") from a full URL string.
 * Returns "" for invalid or empty URLs.
 */
export function getMainDomain(url: string): string {
  try {
    const parsedUrl = new URL(url)
    const hostname = parsedUrl.hostname
    const domainPattern = /[^.]+\.[^.]+$/
    const match = hostname.match(domainPattern)
    return match ? match[0] : ''
  } catch {
    return ''
  }
}

/**
 * Returns a price-level string like "($$$)" for a given numeric price level.
 * Returns "" for falsy input (undefined, 0).
 * count=1 → "($)", count=2 → "($$)", count=3 → "($$$)", count=4 → "($$$$)"
 */
export function priceLevelString(count?: number): string {
  if (!count) return ''
  return '('.padEnd(count + 1, '$') + ')'
}
