import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://grubroulette.app',
      lastModified: new Date(),
    },
    {
      url: 'https://grubroulette.app/login',
      lastModified: new Date(),
    },
    {
      url: 'https://grubroulette.app/admin',
      lastModified: new Date(),
    },
  ]
}
