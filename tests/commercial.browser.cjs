/* Run against a built landing served locally; uses a synthetic public catalogue. */
const assert = require('node:assert/strict')
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const base = new URL(process.env.BASE_URL || 'http://127.0.0.1:4193/')
const catalogue = {
  base_monthly_cents: 2900,
  base_yearly_cents: 29000,
  seat_monthly_cents: 800,
  seat_yearly_cents: 9600,
  modules: [
    { code: 'workers', unit: 'company', monthly_cents: 900, yearly_cents: 9000 },
    { code: 'ai', unit: 'person', monthly_cents: 375, yearly_cents: 4500 },
  ],
}

async function main() {
  const browser = await chromium.launch({
    ...(process.env.CHROMIUM_PATH && { executablePath: process.env.CHROMIUM_PATH }),
  })
  try {
    const context = await browser.newContext({ viewport: { width: 320, height: 700 }, reducedMotion: 'reduce' })
    let pricingRequests = 0
    await context.route('**/*', async (route) => {
      const url = new URL(route.request().url())
      if (url.origin === base.origin) return route.continue()
      if (url.href === 'https://app.menoslios.com/api/public-pricing') {
        pricingRequests++
        return route.fulfill({
          status: pricingRequests === 1 ? 503 : 200,
          json: pricingRequests === 1 ? {} : catalogue,
          headers: { 'Access-Control-Allow-Origin': '*' },
        })
      }
      return route.abort()
    })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto(base.href)
    const section = page.locator('#precios')
    assert.match(await section.getByRole('link', { name: 'Ver catálogo completo' }).getAttribute('href'), /app\.menoslios\.com\/precios$/)
    const retry = section.getByRole('button', { name: 'Reintentar carga' })
    await retry.waitFor()
    assert.match(await section.getByRole('status').textContent(), /No se pudieron cargar/)
    assert.equal(await section.locator('[data-base-amount]').isVisible(), false)
    await retry.focus()
    await retry.press('Enter')
    const monthly = section.getByRole('button', { name: 'Mensual', exact: true })
    const annual = section.getByRole('button', { name: 'Anual', exact: true })
    await monthly.waitFor()
    assert.equal(await monthly.evaluate((e) => e === document.activeElement), true)
    assert.match(await section.locator('[data-base-amount]').innerText(), /^29,00/)
    assert.equal(await monthly.getAttribute('aria-pressed'), 'true')
    await annual.focus()
    await annual.press('Space')
    assert.equal(await annual.getAttribute('aria-pressed'), 'true')
    assert.equal(await monthly.getAttribute('aria-pressed'), 'false')
    assert.match(await section.locator('[data-base-amount]').innerText(), /^290,00/)
    assert.match(await section.locator('[data-base-detail]').innerText(), /24,17.*58,00/)
    assert.match(await section.locator('[data-seat-price]').innerText(), /96,00.*año/)
    assert.match(await section.locator('[data-ai]').innerText(), /Asistente de IA\s+Por usuario\s+45,00.*año/)
    assert.match(await section.locator('[data-module-prices] li').nth(1).innerText(), /Por empresa/)
    await monthly.press('Enter')
    assert.match(await section.locator('[data-seat-price]').innerText(), /8,00.*mes/)

    const ai = page.locator('#asistente')
    assert.equal(await ai.locator('details[open]').count(), 1)
    const catalogueExample = ai.getByText('Actualizar el catálogo', { exact: false }).first()
    await catalogueExample.press('Enter')
    assert.equal(await ai.locator('details[open]').count(), 1)
    assert.match(await ai.locator('details[open]').innerText(), /3 %.*materiales/s)
    assert.match(await page.locator('#integraciones').innerText(), /Google Calendar.*Excel y CSV/s)
    assert.equal(pricingRequests, 2)

    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 800 })
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow a ${width}px`)
    }
    assert.deepEqual(errors, [])
    const noScript = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 740 } })
    const fallback = await noScript.newPage()
    await fallback.goto(base.href)
    assert.match(await fallback.locator('[data-price-status]').innerText(), /catálogo/)
    assert.equal(await fallback.locator('[data-period]').isVisible(), false)
    assert.equal(await fallback.getByRole('link', { name: 'Ver catálogo completo' }).isVisible(), true)
  } finally {
    await browser.close()
  }
}

main().then(() => console.log('Precios mensuales/anuales, sin importes de relleno, carga/error/reintento accesible, IA interactiva, integraciones y 320–1440 px.')).catch((e) => {
  console.error(e)
  process.exitCode = 1
})
