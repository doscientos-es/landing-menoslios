import type { APIRoute } from 'astro';
import { canonicalUrl } from '../config/seo';

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error('Missing canonical public site');
  // Cloudflare manages crawler-specific content signals. Do not redefine them.
  return new Response(`Sitemap: ${canonicalUrl('/sitemap.xml', site).href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
