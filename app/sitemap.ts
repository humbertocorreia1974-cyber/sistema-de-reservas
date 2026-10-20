import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'https://exemplo.com');
  const routes = ["/","/reservas/nova","/mesas","/cardapio"];
  return routes.map((r) => ({ url: base + (r === '/' ? '' : r), lastModified: new Date(), changeFrequency: 'weekly' as const, priority: r === '/' ? 1 : 0.6 }));
}
