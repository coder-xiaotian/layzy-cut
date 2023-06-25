import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://lazycut.video',
      lastModified: new Date(),
    },
    {
      url: 'https://lazycut.video/tiktok',
      lastModified: new Date(),
    },
    {
      url: 'https://lazycut.video/apply-lut',
      lastModified: new Date(),
    },
  ]
}