import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const legalRoutes = ['aviso-legal', 'privacidad', 'cookies']
const readPage = (route = '') =>
  readFile(new URL(`../dist/${route && route + '/'}index.html`, import.meta.url), 'utf8')

test('el pie llega a las páginas legales y cada una señala su ubicación', async () => {
  const home = await readPage()
  for (const route of legalRoutes) {
    assert.match(home, new RegExp(`href="/${route}/?"`))
    const html = await readPage(route)
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1)
    assert.match(html, new RegExp(`rel="canonical" href="https://menoslios\\.com/${route}/"`))
    assert.match(html, new RegExp(`href="/${route}" aria-current="page"`))
    assert.match(html, /<main\b/)
    for (const sibling of legalRoutes) assert.match(html, new RegExp(`href="/${sibling}"`))
  }
})

test('el aviso identifica a la sociedad con NIF, domicilio, registro y contacto', async () => {
  const notice = await readPage('aviso-legal')
  assert.match(notice, /Doscientos Desarrollo Tecnologico, S\.L\./)
  assert.match(notice, /B88873393/)
  assert.match(notice, /Carrer Can Pou, 12, 08330 Premià de Mar/)
  assert.match(notice, /hoja B 658663, inscripción 1/)
  assert.match(notice, /mailto:hola@doscientos\.es/)
  assert.match(notice, /BORME-A-2026-113-08\.pdf/)
})

test('la política de privacidad cubre reserva externa, conservación y derechos', async () => {
  const privacy = await readPage('privacidad')
  assert.match(privacy, /https:\/\/cal\.com\/privacy/)
  assert.match(privacy, /Cuánto tiempo los conservamos/)
  assert.match(privacy, /Agencia Española de Protección de Datos/)
  assert.match(privacy, /interés legítimo/)
})

test('el catálogo no usa credenciales y el HTML no incorpora scripts externos ni marcos', async () => {
  const { loadPricing } = await import('../src/config/pricing.mjs')
  await assert.rejects(loadPricing('https://app.menoslios.com/api/public-pricing', async (_url, options) => {
    assert.equal(options.credentials, 'omit')
    return new Response(null, { status: 503 })
  }), /Pricing unavailable/)

  for (const page of ['', ...legalRoutes]) {
    const html = await readPage(page)
    assert.doesNotMatch(html, /<script\b[^>]*src="(?:https?:)?\/\//i)
    assert.doesNotMatch(html, /<iframe\b/i)
  }
})
