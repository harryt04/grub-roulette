// api/getRestaurants.ts

import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import { GetRestaurantRequest } from '../types/location'

export const config = {
  api: {
    externalResolver: true,
  },
}

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  const {
    latitude,
    longitude,
    radius,
    radiusUnits = 'miles',
    type = 'restaurant',
  } = req.query as any as GetRestaurantRequest

  console.log('harry made it')

  if (!latitude || !longitude || !radius) {
    res.status(400).json({ error: 'Missing required parameters' })
    return
  }

  const endpoint = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  try {
    const response = await axios.get(endpoint, {
      params: {
        location: `${latitude},${longitude}`,
        radius: radiusUnits === 'kilometers' ? radius * 1000 : radius * 1609.34, // Convert radius to meters
        type: 'restaurant',
        keyword: type,
        key: apiKey,
      },
    })

    res.status(200).json(response.data)
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    res.status(500).json({ error: 'Error fetching restaurants' })
  }
}
