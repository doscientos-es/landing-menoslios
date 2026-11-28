/* Visual-flow smoke for the built landing, with the commercial endpoint blocked. */
const assert = require('node:assert/strict')
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const base = new URL(process.env.BASE_URL || 'http://127.0.0.1:4196/')

async function verify() {
  const browser = await chromium.launch({
    ...(process.env.CHROMIUM_PATH && { executablePath: process.env.CHROMIUM_PATH }),
  })
  try {
    for (const mode of ['reduce', 'no-preference']) {
      const context = await browser.newContext({ viewport: { width: 320, height: 780 }, reducedMotion: mode })
      await context.route('**/*', (route) => new URL(route.request().url()).origin === base.origin ? route.continue() : route.abort())
      const page = await context.newPage()
      await page.goto(base.href)
      const workflow = page.locator('#pasos')
      for (const img of await workflow.locator('img').all()) {
        await img.scrollIntoViewIfNeeded()
        await img.evaluate((element) => element.decode())
        assert.ok(await img.evaluate((element) => element.naturalWidth > 0 && element.alt.length > 35))
      }
      const details = workflow.locator('details')
      const summary = details.locator('summary')
      await summary.focus()
      await page.keyboard.press('Enter')
      assert.equal(await details.evaluate((e) => e.open), true)
      assert.equal(await summary.evaluate((e) => e === document.activeElement), true)
      const animation = await details.locator('ul').evaluate(e => getComputedStyle(e).animationName)
      assert.equal(animation === 'none', mode === 'reduce')
      await page.keyboard.press('Space')
      assert.equal(await details.evaluate((e) => e.open), false)
      for (const width of [320, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 780 })
        const overflow = await page.evaluate(() => ({w:innerWidth, doc:document.documentElement.scrollWidth, els:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).slice(0,12).map(e=>[e.tagName,e.className,Math.round(e.getBoundingClientRect().right)])})); assert.ok(overflow.doc <= width, JSON.stringify(overflow))
      }
      await page.goto(new URL('/sectores/fontaneria/', base).href)
      assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), 'https://www.menoslios.com/sectores/fontaneria')
      assert.match(await page.locator('h1').innerText(), /fontaneros/)
      const pipePhoto = page.locator('img[src$="fontaneria.avif"]')
      await pipePhoto.scrollIntoViewIfNeeded()
      assert.equal(await pipePhoto.evaluate(async (e) => { await e.decode(); return e.naturalWidth }), 800)
      await context.close()
    }
  } finally {
    await browser.close()
  }
}

verify().then(() => console.log('Foto y pantalla cargadas; detalle con teclado, movimiento reducido y sector fontanería comprobados.')).catch((e) => {
  console.error(e)
  process.exitCode = 1
})
