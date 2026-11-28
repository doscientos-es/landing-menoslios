import { readFile, access } from 'node:fs/promises';
import test from 'node:test';
import assert from 'node:assert/strict';

const origin = 'https://www.menoslios.com';
const sectors = ['climatizacion', 'electricidad', 'fontaneria', 'instalaciones', 'limpieza', 'mantenimiento', 'reformas'];
const routes = ['/', ...sectors.map((sector) => `/sectores/${sector}`), '/aviso-legal', '/privacidad', '/cookies'];
const dist = (path) => new URL(`../dist${path}`, import.meta.url);
const readRoute = (path) => readFile(dist(path === '/' ? '/index.html' : path + '/index.html'), 'utf8');
const schema = (html) => JSON.parse(html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)?.[1] ?? 'null');
const description = (html) => html.match(/<meta name="description" content="([^"]+)"/)?.[1];

test('el sitemap tiene todas las rutas reales y robots no reescribe protecciones de CDN', async () => {
  const xml = await readFile(dist('/sitemap.xml'), 'utf8');
  assert.match(xml, /sitemaps\.org\/schemas\/sitemap\/0\.9/);
  assert.deepEqual(new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([_, u]) => u)), new Set(routes.map((path) => origin + path)));
  const robots = await readFile(dist('/robots.txt'), 'utf8');
  assert.equal(robots.trim(), `Sitemap: ${origin}/sitemap.xml`);
});

test('cada página coincide con la URL canónica y tiene metadatos únicos', async () => {
  const pages = await Promise.all(routes.map(readRoute));
  const titles = new Set(), summaries = new Set();
  for (const [i, html] of pages.entries()) {
    const path = routes[i];
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    const summary = description(html);
    assert.ok(title?.length && summary?.length && summary.length < 180, path);
    titles.add(title);
    summaries.add(summary);
    assert.ok(html.includes(`rel="canonical" href="${origin}${path}"`), path);
    assert.ok(html.includes(`property="og:url" content="${origin}${path}"`), path);
    const image = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
    assert.ok(image?.startsWith(`${origin}/producto/`), path);
    await access(dist(new URL(image).pathname));
    assert.doesNotMatch(html, /images\.unsplash\.com/);
  }
  assert.equal(titles.size, pages.length);
  assert.equal(summaries.size, pages.length);
});

test('la portada nombra el sitio y los sectores tienen ruta y enlaces reales', async () => {
  const home = await readRoute('/');
  assert.deepEqual(schema(home), { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Menos Líos', url: origin + '/' });
  for (const sector of sectors) {
    const path = `/sectores/${sector}`;
    assert.ok(home.includes(`href="${path}"`));
    const html = await readRoute(path);
    const breadcrumbs = schema(html);
    assert.equal(breadcrumbs['@type'], 'BreadcrumbList');
    assert.deepEqual(breadcrumbs.itemListElement.map((item) => item.item), [origin + '/', origin + path]);
    assert.match(html, /aria-label="Ruta de navegación"/);
    assert.ok([...html.matchAll(/href="\/sectores\/([a-z]+)"/g)].filter(([, id]) => id !== sector && sectors.includes(id)).length >= 2);
    assert.match(html, /href="\/([?]ejemplo=[a-z]+)?#demo-producto"/);
    assert.doesNotMatch(html, /para tu oficio|En tu día a día|Antes de empezar|Qué puedes ganar en orden/);
  }
});
