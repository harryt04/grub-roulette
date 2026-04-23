import { z } from 'zod'

export const GetRestaurantsSchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  zip: z.string().optional(),
  radius: z.number().positive('Radius must be a positive number'),
  radiusUnits: z.enum(['miles', 'kilometers']).optional().default('miles'),
  keywords: z.string().optional(),
})

export type GetRestaurantsRequest = z.infer<typeof GetRestaurantsSchema>

export const GetPlaceDetailsSchema = z.object({
  place_id: z
    .string()
    .min(1, 'place_id cannot be empty')
    .regex(/^[a-zA-Z0-9_\-:]+$/, 'place_id contains invalid characters'),
})

export type GetPlaceDetailsRequest = z.infer<typeof GetPlaceDetailsSchema>

export const GetPhotosSchema = z.object({
  photos: z.array(z.string()).min(1, 'photos must be a non-empty array'),
})

export type GetPhotosRequest = z.infer<typeof GetPhotosSchema>
