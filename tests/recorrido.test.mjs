import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const home = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8')

test('las historias se publican como HTML estático, no dependen de JavaScript para leerse', () => {
  const start = home.indexOf('data-recorrido-fallback')
  const fallback = home.slice(start, home.indexOf('</section>', start))
  assert.match(fallback, /Leer los tres casos sin interactuar/)
  assert.match(fallback, /Limpieza de portal y escalera/)
  assert.match(fallback, /Mantenimiento: Revisión del equipo de climatización/)
  assert.match(fallback, /Instalaciones: Montaje de luminarias en una oficina/)
  assert.equal((fallback.match(/<ol\b/g) ?? []).length, 3)
  assert.equal((fallback.match(/<li\b/g) ?? []).length, 12)
  for (const amount of ['180,00', '80,00', '100,00', '260,00', '160,00', '780,00', '300,00', '480,00']) {
    assert.match(fallback, new RegExp(amount))
  }
})
