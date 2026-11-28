/* Smoke opcional: sirve dist y ejecuta con Playwright/Chromium ya instalados.
 * BASE_URL=http://127.0.0.1:4190 PLAYWRIGHT_MODULE=/ruta/playwright \
 * CHROMIUM_PATH=/ruta/chromium node tests/recorrido.browser.cjs
 */
const assert = require('node:assert/strict')
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const base = new URL(process.env.BASE_URL || 'http://127.0.0.1:4190/')

const launch = () => chromium.launch({
    ...(process.env.CHROMIUM_PATH && { executablePath: process.env.CHROMIUM_PATH }),
    ...(process.env.CHROMIUM_RESTRICTED === '1' && {
      args: ['--no-zygote', '--single-process', '--disable-gpu'],
    }),
  })

async function smoke() {
  const browser = await launch()
  try {
    const page = await browser.newPage({
      viewport: { width: 320, height: 740 },
      reducedMotion: 'reduce',
    })
    const pageErrors = []
    page.on('pageerror', (error) => pageErrors.push(error.message))
    await page.route('**/*', (route) =>
      new URL(route.request().url()).origin === base.origin ? route.continue() : route.abort(),
    )
    await page.goto(base.href)
    const seccion = page.locator('#demo-producto')

    for (const ancho of [320, 390, 768, 1280]) {
      await page.setViewportSize({ width: ancho, height: 800 })
      const scroll = await page.evaluate(() => document.documentElement.scrollWidth)
      assert.ok(scroll <= ancho, `Desbordamiento: ${scroll}px en viewport de ${ancho}px`)
    }

    await page.setViewportSize({ width: 320, height: 740 })
    await page.getByRole('link', { name: 'Probar el recorrido', exact: true }).click()
    assert.equal(new URL(page.url()).hash, '#demo-producto')
    const presupuesto = seccion.getByRole('tab', { name: 'Presupuesto', exact: true })
    await presupuesto.focus()
    assert.equal(await presupuesto.getAttribute('aria-selected'), 'true')
    const activePanel = seccion.getByRole('tabpanel')
    assert.equal(await activePanel.count(), 1)
    assert.equal(await activePanel.evaluate((panel) => getComputedStyle(panel).animationName), 'none')
    await activePanel.getByRole('button', { name: 'Aceptar presupuesto' }).click()
    assert.equal(await activePanel.locator('[data-estado]').textContent(), 'Aceptado')

    await presupuesto.press('ArrowRight')
    const agenda = seccion.getByRole('tab', { name: 'Agenda', exact: true })
    assert.equal(await agenda.getAttribute('aria-selected'), 'true')
    assert.equal(await agenda.evaluate((tab) => document.activeElement === tab), true)
    await activePanel.getByRole('button', { name: 'Asignar a Vera' }).click()
    assert.match(await activePanel.textContent(), /Vera \(ejemplo\)/)

    await activePanel.getByRole('button', { name: 'Siguiente: Parte de trabajo' }).click()
    const parte = seccion.getByRole('tab', { name: 'Parte de trabajo', exact: true })
    assert.equal(await parte.getAttribute('aria-selected'), 'true')
    const guardar = activePanel.getByRole('button', { name: 'Guardar borrador' })
    assert.equal(await guardar.isDisabled(), true)
    await activePanel.getByRole('checkbox', { name: 'Comprobar el funcionamiento' }).check()
    await guardar.click()
    assert.equal(await activePanel.locator('[data-estado]').textContent(), 'Borrador guardado')
    await activePanel.getByRole('button', { name: 'Reiniciar este ejemplo' }).click()
    assert.equal(await guardar.isDisabled(), true)

    await parte.press('End')
    const factura = seccion.getByRole('tab', { name: 'Factura y cobro' })
    assert.equal(await factura.getAttribute('aria-selected'), 'true')
    await activePanel.getByRole('button', { name: 'Registrar cobro recibido' }).click()
    assert.equal(await activePanel.locator('[data-estado]').textContent(), 'Cobrada')
    assert.equal(await activePanel.locator('[data-valor-final]').textContent(), '0,00 €')
    assert.match(await seccion.getByRole('status').textContent(), /No se ha movido dinero/)
    await factura.press('Home')
    assert.equal(await presupuesto.getAttribute('aria-selected'), 'true')
    assert.deepEqual(pageErrors, [])
  } finally {
    await browser.close()
  }

  const browserSinJS = await launch()
  try {
    const sinJS = await browserSinJS.newPage({ javaScriptEnabled: false })
    await sinJS.route('**/*', (route) =>
      new URL(route.request().url()).origin === base.origin ? route.continue() : route.abort(),
    )
    await sinJS.goto(base.href)
    const panels = await sinJS.locator('#demo-producto [data-recorrido-panel]').all()
    assert.equal(panels.length, 4)
    for (const panel of panels) assert.equal(await panel.isVisible(), true)
  } finally {
    await browserSinJS.close()
  }

  console.log('Recorrido verificado a 320, 390, 768 y 1280 px: cuatro pasos, teclado, reset, texto sin JS y movimiento reducido.')
}

smoke().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
