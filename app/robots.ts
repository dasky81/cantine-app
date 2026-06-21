import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/profilo/'],
      },
    ],
    sitemap: 'https://cantine.app/sitemap.xml',
  }
}
