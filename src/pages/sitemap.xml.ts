import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { canonicalUrl } from '../config/seo';

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('Missing canonical public site');
  const sectors = (await getCollection('sectores')).map(({ id }) => `/sectores/${encodeURIComponent(id)}`).sort();
  const paths = ['/', ...sectors, '/aviso-legal', '/privacidad', '/cookies'];
  const urls = paths.map((path) => `  <url><loc>${canonicalUrl(path, site).href}</loc></url>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
