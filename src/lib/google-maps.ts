/**
 * Builds a Google Maps Place Photo API URL for a given photo reference.
 * Returns "" for empty/falsy photoReference.
 * DEPRECATED: Use fetchGooglePhoto() instead for secure server-side proxying.
 */
export function buildGoogleMapsPhotoUrl(photoReference: string): string {
  if (!photoReference) return ''
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${process.env.GOOGLE_MAPS_API_KEY}`
}

/**
 * Fetches photo bytes directly from Google Maps API.
 * Server-side only — never exposes API key to client.
 * Returns the Response from Google so caller can handle headers/content-type.
 */
export async function fetchGooglePhoto(
  photoReference: string,
  apiKey: string,
): Promise<Response> {
  const url = new URL('https://maps.googleapis.com/maps/api/place/photo')
  url.searchParams.append('maxwidth', '400')
  url.searchParams.append('photoreference', photoReference)
  url.searchParams.append('key', apiKey)

  const response = await fetch(url.toString())
  return response
}

/**
 * Converts a radius value to metres based on unit string.
 * Supports 'miles' and 'kilometers'. Defaults to miles for unrecognised values.
 */
export function convertRadiusToMeters(
  radius: number,
  radiusUnits: string,
): number {
  if (radiusUnits === 'kilometers') return radius * 1000
  return radius * 1609.34
}
