import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://grubroulette.app',
      lastModified: new Date(),
    },
  ]
}
