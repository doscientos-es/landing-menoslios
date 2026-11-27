import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadPricing } from '../src/config/pricing.mjs';

const endpoint = 'https://example.test/api/public-pricing';
const response = (base, modulePrice) => Response.json({
  base_monthly_cents: base,
  base_yearly_cents: base * 10,
  seat_monthly_cents: 800,
  seat_yearly_cents: 9600,
  modules: [{ code: 'ai', monthly_cents: modulePrice, yearly_cents: 4500, unit: 'person' }],
});

test('uses the newest catalogue and does not reproduce former hard-coded rates', async () => {
  const before = await loadPricing(endpoint, () => response(2900, 375));
  const after = await loadPricing(endpoint, (url, opts) => {
    assert.equal(url, endpoint);
    assert.equal(opts.credentials, 'omit');
    return response(3100, 400);
  });
  assert.equal(before.base_monthly_cents, 2900);
  assert.equal(after.base_monthly_cents, 3100);
  assert.equal(after.base_yearly_cents, 31000);
  assert.deepEqual(after.modules[0], { code: 'ai', name: 'Asistente de IA', monthly_cents: 400, yearly_cents: 4500, unit: 'person' });
});

test('missing or malformed upstream rates do not display invented amounts', async () => {
  await assert.rejects(loadPricing(endpoint, () => new Response('', { status: 503 })));
  await assert.rejects(loadPricing(endpoint, () => response(0, 375)));
  await assert.rejects(loadPricing(endpoint, () => response(2900, 0)));
});
