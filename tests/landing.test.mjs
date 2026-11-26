import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const home = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const sector = await readFile(new URL('../dist/sectores/electricidad/index.html', import.meta.url), 'utf8');

test('la landing utiliza la nueva marca y el dominio canónico', () => {
  assert.match(home, /<html lang="es"/);
  assert.match(home, /<title>MenosLios \|/);
  assert.match(home, /rel="canonical" href="https:\/\/menoslios\.com\/"/);
  assert.match(home, /property="og:site_name" content="MenosLios"/);
  assert.doesNotMatch(home, /Ábaco|PoolOps|abaco-logo\.svg/);
  assert.match(home, /href="https:\/\/abaco\.doscientos\.es\/"/);
});

test('las páginas de sectores tienen metadatos propios', () => {
  assert.match(sector, /<title>[^<]+ \| MenosLios<\/title>/);
  assert.match(sector, /rel="canonical" href="https:\/\/menoslios\.com\/sectores\/electricidad\/"/);
  assert.doesNotMatch(sector, /Ábaco|abaco-logo\.svg/);
});