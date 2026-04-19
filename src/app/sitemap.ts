import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://grub.harryt.dev',
      lastModified: new Date(),
    },
  ]
}
