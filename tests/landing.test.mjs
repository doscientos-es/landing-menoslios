import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const home = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8')
const sector = await readFile(
  new URL('../dist/sectores/electricidad/index.html', import.meta.url),
  'utf8',
)

test('la landing utiliza la nueva marca y el dominio canónico', () => {
  assert.match(home, /<html lang="es"/)
  assert.match(home, /<title>Menos Lios \|/)
  assert.match(home, /rel="canonical" href="https:\/\/menoslios\.com\/"/)
  assert.match(home, /property="og:site_name" content="Menos Lios"/)
  assert.doesNotMatch(home, /Ábaco|PoolOps|MenosLios|abaco-logo\.svg/)
  assert.doesNotMatch(home, /href="https:\/\/abaco\.doscientos\.es\//)
})

test('las páginas de sectores tienen metadatos propios', () => {
  assert.match(sector, /<title>[^<]+ \| Menos Lios<\/title>/)
  assert.match(sector, /rel="canonical" href="https:\/\/menoslios\.com\/sectores\/electricidad\/"/)
  assert.doesNotMatch(sector, /Ábaco|MenosLios|abaco-logo\.svg/)
})

test('los sectores sin comparativa se generan correctamente', async () => {
  const climatizacion = await readFile(
    new URL('../dist/sectores/climatizacion/index.html', import.meta.url),
    'utf8',
  )
  assert.match(climatizacion, /<title>Climatización \| Menos Lios<\/title>/)
  assert.doesNotMatch(climatizacion, /undefined/)
})

test('los CTA comerciales enlazan a la inscripción de la demo semanal', () => {
  for (const [html, minimum] of [
    [home, 6],
    [sector, 3],
  ]) {
    const links = [
      ...html.matchAll(
        /<a\b[^>]*href="https:\/\/cal\.com\/demo-grupal-de-menoslios"[^>]*>([\s\S]*?)<\/a>/g,
      ),
    ]
    assert.ok(links.length >= minimum)
    for (const [, content] of links) assert.match(content, /Unirme a la siguiente demo/)
    assert.doesNotMatch(html, /href="https:\/\/abaco\.doscientos\.es\//)
  }
})

test('la portada conserva el hero activo y sus secciones principales', () => {
  assert.match(home, /<main>/)
  assert.match(home, /<video\b[^>]*src="\/fondo\.mp4"/)
  assert.match(home, /<h1[^>]*>Todo el control de tu negocio, en un solo lugar<\/h1>/)
  for (const id of ['pasos', 'sectores', 'precios', 'preguntas']) {
    assert.match(home, new RegExp(`id="${id}"`))
  }
  assert.doesNotMatch(home, /Más piscinas/)
  assert.match(home, /<footer\b/)
})

test('pricing links to registration and uses a live catalogue without a free trial', () => {
  assert.match(home, /data-pricing-endpoint="https:\/\/app\.menoslios\.com\/api\/public-pricing"/)
  assert.match(home, /href="https:\/\/app\.menoslios\.com\/registro"/)
  assert.doesNotMatch(home, /Prueba Gratuita|14 días gratis|>20€</i)
})
