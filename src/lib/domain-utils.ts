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
 * Returns "(Free)" for 0. Returns "" for undefined/null.
 * count=0 → "(Free)", count=1 → "($)", count=2 → "($$)", count=3 → "($$$)", count=4 → "($$$$)"
 */
export function priceLevelString(count?: number): string {
  if (count === undefined || count === null) return ''
  if (count === 0) return '(Free)'
  return '('.padEnd(count + 1, '$') + ')'
}
