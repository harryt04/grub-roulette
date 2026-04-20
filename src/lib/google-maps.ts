/**
 * Builds a Google Maps Place Photo API URL for a given photo reference.
 * Returns "" for empty/falsy photoReference.
 */
export function buildGoogleMapsPhotoUrl(photoReference: string): string {
  if (!photoReference) return ''
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${process.env.GOOGLE_MAPS_API_KEY}`
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
