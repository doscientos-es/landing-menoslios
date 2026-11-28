/* Optional native disclosure test with local dist. Set PLAYWRIGHT_MODULE, CHROMIUM_PATH,
 * CHROMIUM_RESTRICTED if needed, and BASE_URL for the local preview.
 */
const assert = require('node:assert/strict')
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const base = new URL(process.env.BASE_URL || 'http://127.0.0.1:4190/')

async function open(browser, { motion, javaScriptEnabled = true } = {}) {
  const context = await browser.newContext({
    viewport: { width: 320, height: 680 },
    reducedMotion: motion,
    javaScriptEnabled,
  })
  await context.route('**/*', (route) =>
    new URL(route.request().url()).origin === base.origin ? route.continue() : route.abort(),
  )
  const page = await context.newPage()
  await page.goto(base.href)
  const menu = page.locator('[data-header-menu]')
  const trigger = menu.locator('summary')
  const panel = page.getByRole('navigation', { name: 'Menú móvil' })
  return { context, page, menu, trigger, panel }
}

async function smoke() {
  const launch = () => chromium.launch({
    ...(process.env.CHROMIUM_PATH && { executablePath: process.env.CHROMIUM_PATH }),
    ...(process.env.CHROMIUM_RESTRICTED === '1' && {
      args: ['--no-zygote', '--single-process', '--disable-gpu'],
    }),
  })
  let browser = await launch()
  try {
    const { context, page, menu, trigger, panel } = await open(browser, { motion: 'no-preference' })
    assert.equal(await panel.count(), 0)
    await trigger.focus()
    await trigger.press('Enter')
    await panel.waitFor({ state: 'visible' })
    assert.equal(await menu.evaluate((element) => element.open), true)
    const transitions = await panel.evaluate((element) => ({
      supported: CSS.supports('selector(details::details-content)') && CSS.supports('transition-behavior: allow-discrete'),
      duration: getComputedStyle(element).transitionDuration,
    }))
    if (transitions.supported) assert.match(transitions.duration, /0\.16s/)
    assert.equal(await page.locator('header').getByRole('link', { name: 'Ir a mi panel' }).isVisible(), true)
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    await page.keyboard.press('Tab')
    const firstLink = panel.getByRole('link', { name: 'Producto', exact: true })
    assert.ok(await firstLink.evaluate((element) => document.activeElement === element))
    await page.keyboard.press('Escape')
    assert.equal(await menu.evaluate((element) => element.open), false)
    assert.ok(await trigger.evaluate((element) => document.activeElement === element))
    await panel.waitFor({ state: 'hidden' })
    await trigger.press('Enter')
    await panel.getByRole('link', { name: 'Precios', exact: true }).press('Enter')
    assert.equal(new URL(page.url()).hash, '#precios')
    await page.waitForFunction(() => document.activeElement?.id === 'precios')
    assert.equal(await menu.evaluate((element) => element.open), false)
    await trigger.focus()
    await trigger.press('Enter')
    await page.locator('header').getByRole('link', { name: 'Ir a mi panel' }).dispatchEvent('pointerdown', { bubbles: true })
    assert.equal(await menu.evaluate((element) => element.open), false)
    for (const width of [320, 390, 768, 1024, 1280]) {
      await page.setViewportSize({ width, height: 680 })
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow at ${width}px`)
    }
    await context.close()
  } finally {
    await browser.close()
  }

  browser = await launch()
  try {
    const { page, trigger, panel } = await open(browser, { motion: 'reduce', javaScriptEnabled: false })
    await trigger.focus()
    await trigger.press('Enter')
    await panel.waitFor({ state: 'visible' })
    assert.equal(await panel.evaluate((element) => getComputedStyle(element).transitionDuration), '0s')
    await panel.getByRole('link', { name: 'Sectores', exact: true }).press('Enter')
    assert.equal(new URL(page.url()).hash, '#sectores')
  } finally {
    await browser.close()
  }
  console.log('Menú: 320/390/768/1024/1280 px, teclado, Escape y foco, clic exterior, sin JS y movimiento reducido.')
}
smoke().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
