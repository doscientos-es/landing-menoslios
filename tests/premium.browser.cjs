/* Optional local smoke, with dist served and Playwright/Chromium available.
 * BASE_URL=http://127.0.0.1:4190 PLAYWRIGHT_MODULE=/ruta/playwright
 * CHROMIUM_PATH=/ruta/chromium node tests/premium.browser.cjs
 */
const assert = require('node:assert/strict')
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const base = new URL(process.env.BASE_URL || 'http://127.0.0.1:4190/')

async function smoke() {
  const browser = await chromium.launch({
    ...(process.env.CHROMIUM_PATH && { executablePath: process.env.CHROMIUM_PATH }),
    ...(process.env.CHROMIUM_RESTRICTED === '1' && {
      args: ['--no-zygote', '--single-process', '--disable-gpu'],
    }),
  })
  const clips = []
  try {
    const context = await browser.newContext({
      viewport: { width: 320, height: 740 },
      reducedMotion: 'reduce',
    })
    await context.route('**/*', (route) => {
      const url = new URL(route.request().url())
      return url.origin === base.origin ? route.continue() : route.abort()
    })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('request', (request) => {
      if (new URL(request.url()).pathname.endsWith('.mp4')) clips.push(request.url())
    })
    await page.goto(base.href)
    const panel = page.locator('header').getByRole('link', { name: 'Ir a mi panel' })
    assert.equal(await panel.isVisible(), true)
    assert.equal(await panel.getAttribute('href'), 'https://app.menoslios.com/entrar')
    const hero = page.locator('.hero img')
    assert.equal(await hero.evaluate((img) => img.complete && img.naturalWidth === 1080), true)
    const menu = page.locator('[data-header-menu]')
    const summary = menu.locator('summary')
    await summary.focus()
    await summary.press('Enter')
    assert.equal(await menu.evaluate((element) => element.open), true)
    await page.keyboard.press('Escape')
    assert.equal(await menu.evaluate((element) => element.open), false)
    assert.equal(await summary.evaluate((element) => element === document.activeElement), true)
    if (process.env.SCREENSHOT_DIR) {
      await page.screenshot({ path: `${process.env.SCREENSHOT_DIR}/menoslios-320.png` })
    }

    const product = page.locator('#en-pantalla')
    for (const image of await product.locator('img').all()) {
      await image.scrollIntoViewIfNeeded()
      await image.evaluate((element) => element.decode())
      assert.ok(await image.evaluate((element) => element.naturalWidth > 0 && Boolean(element.alt)))
    }
    const descriptions = product.getByText('Leer la descripción del vídeo', { exact: true })
    assert.equal(await descriptions.count(), 2)
    for (const disclosure of await descriptions.all()) {
      await disclosure.focus()
      await disclosure.press('Enter')
      assert.equal(await disclosure.evaluate((element) => element.parentElement.open), true)
    }
    const videos = await product.locator('video').all()
    assert.equal(videos.length, 2)
    for (const video of videos) {
      assert.deepEqual(
        await video.evaluate((element) => ({
          controls: element.controls,
          paused: element.paused,
          autoplay: element.autoplay,
          preload: element.preload,
          reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
        })),
        { controls: true, paused: true, autoplay: false, preload: 'none', reduced: true },
      )
    }
    assert.deepEqual(clips, [], 'Un vídeo sin reproducir no debe solicitar su MP4.')

    for (const width of [320, 390, 768, 1024, 1280]) {
      await page.setViewportSize({ width, height: 800 })
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px overflow`)
      assert.ok(await panel.isVisible())
    }
    if (process.env.SCREENSHOT_DIR) {
      await page.evaluate(() => {
        document.activeElement?.blur()
        window.scrollTo(0, 0)
      })
      await page.screenshot({ path: `${process.env.SCREENSHOT_DIR}/menoslios-1280.png`, fullPage: true })
    }
    assert.deepEqual(errors, [])
  } finally {
    await browser.close()
  }
  console.log('Landing premium: a 320/390/768/1024/1280 px; panel normal, menú con teclado, cuatro imágenes, alternativas de vídeo y ningún MP4 previo a la reproducción.')
}

smoke().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
