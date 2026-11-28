/* Smoke opcional: sirve dist y ejecuta con Playwright/Chromium ya instalados.
 * BASE_URL=http://127.0.0.1:4190 PLAYWRIGHT_MODULE=/ruta/playwright
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
    const page = await browser.newPage({ viewport: { width: 320, height: 740 }, reducedMotion: 'reduce' })
    const pageErrors = []
    const requests = []
    page.on('pageerror', (error) => pageErrors.push(error.message))
    page.on('request', (request) => requests.push(request))
    await page.route('**/*', (route) =>
      new URL(route.request().url()).origin === base.origin ? route.continue() : route.abort(),
    )
    await page.goto(new URL('?ejemplo=mantenimiento#demo-producto', base).href)
    const section = page.locator('#demo-producto')
    const activePanel = section.getByRole('tabpanel')
    const status = section.getByRole('status')
    await section.getByRole('radio', { name: 'Mantenimiento' }).waitFor()
    assert.equal(await section.getByRole('radio', { name: 'Mantenimiento' }).isChecked(), true)
    assert.equal(await activePanel.count(), 1)
    assert.equal(await activePanel.evaluate((panel) => getComputedStyle(panel).animationName), 'none')

    for (const width of [320, 390, 768, 1280]) {
      await page.setViewportSize({ width, height: 800 })
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Desbordamiento a ${width}px`)
    }
    await page.setViewportSize({ width: 320, height: 740 })
    const requestsBefore = requests.length
    const presupuesto = section.getByRole('tab', { name: 'Presupuesto', exact: true })
    await presupuesto.focus()
    await presupuesto.press('ArrowRight')
    const agenda = section.getByRole('tab', { name: 'Agenda', exact: true })
    assert.equal(await agenda.getAttribute('aria-selected'), 'true')
    assert.equal(await agenda.evaluate((tab) => document.activeElement === tab), true)
    assert.match(await activePanel.textContent(), /Acepta el presupuesto para poder asignar/)
    assert.equal(await activePanel.getByRole('button', { name: 'Asignar visita' }).count(), 0)
    await agenda.press('Home')
    await activePanel.getByRole('button', { name: 'Plantear una duda' }).click()
    assert.match(await status.textContent(), /No se ha enviado ningún mensaje/)
    assert.match(await activePanel.textContent(), /Si hace falta una pieza, se presupuestará aparte/)
    await activePanel.getByRole('button', { name: 'Aceptar presupuesto' }).click()
    assert.match(await status.textContent(), /aceptado/)
    await activePanel.getByRole('button', { name: 'Siguiente: Agenda' }).click()
    await activePanel.getByLabel('Persona').selectOption('Marc')
    await activePanel.getByLabel('Franja disponible').selectOption('Jueves, 15:00–16:30')
    await activePanel.getByRole('button', { name: 'Asignar visita' }).click()
    assert.match(await activePanel.textContent(), /Marc.*Jueves, 15:00–16:30/)
    await activePanel.getByRole('button', { name: 'Siguiente: Parte de trabajo' }).click()
    assert.match(await activePanel.textContent(), /Marc.*Jueves, 15:00–16:30/)
    const save = activePanel.getByRole('button', { name: 'Guardar borrador' })
    const close = activePanel.getByRole('button', { name: 'Cerrar parte' })
    assert.equal(await save.isDisabled(), true)
    await activePanel.getByRole('checkbox', { name: 'Revisar filtros y conexiones' }).check()
    await save.click()
    assert.match(await status.textContent(), /Borrador de ejemplo guardado/)
    assert.equal(await close.isDisabled(), true)
    await agenda.click()
    assert.match(await activePanel.textContent(), /Marc.*Jueves, 15:00–16:30/)
    await section.getByRole('tab', { name: 'Parte de trabajo' }).click()
    assert.equal(await activePanel.getByRole('checkbox', { name: 'Revisar filtros y conexiones' }).isChecked(), true)
    await activePanel.getByRole('checkbox', { name: 'Comprobar el funcionamiento' }).check()
    await save.click()
    await close.click()
    assert.match(await activePanel.textContent(), /recuperó el caudal/)
    await activePanel.getByRole('button', { name: 'Siguiente: Factura y cobro' }).click()
    await activePanel.getByRole('button', { name: 'Preparar factura de ejemplo' }).click()
    assert.match(await activePanel.locator('[data-demo-value="remaining"]').textContent(), /260,00\s*€/u)
    await activePanel.getByRole('button', { name: /Registrar 100,00.*recibidos/ }).click()
    assert.match(await activePanel.locator('[data-demo-value="status-factura"]').textContent(), /Cobro parcial/)
    assert.match(await activePanel.locator('[data-demo-value="remaining"]').textContent(), /160,00\s*€/u)
    await activePanel.getByRole('button', { name: 'Registrar saldo recibido' }).click()
    assert.equal(await activePanel.locator('[data-demo-value="status-factura"]').textContent(), 'Cobrada')
    assert.match(await activePanel.locator('[data-demo-value="remaining"]').textContent(), /^0,00\s*€$/u)
    assert.match(await status.textContent(), /No se ha movido dinero/)

    await agenda.click()
    await activePanel.getByRole('button', { name: 'Cambiar asignación' }).click()
    await section.getByRole('tab', { name: 'Factura y cobro' }).click()
    assert.match(await activePanel.textContent(), /Cierra el parte antes de preparar la factura/)
    await section.getByRole('radio', { name: 'Instalaciones' }).check()
    assert.equal(await presupuesto.getAttribute('aria-selected'), 'true')
    assert.match(await activePanel.textContent(), /Oficinas Brisa.*780,00/u)
    await section.getByRole('button', { name: 'Reiniciar ejemplo' }).click()
    assert.match(await status.textContent(), /Ejemplo reiniciado: Instalaciones/)
    for (const request of requests.slice(requestsBefore)) {
      assert.equal(request.method(), 'GET')
      assert.notEqual(request.resourceType(), 'xhr')
      assert.notEqual(request.resourceType(), 'fetch')
      assert.equal(new URL(request.url()).origin, base.origin)
    }
    assert.deepEqual(pageErrors, [])
    await page.goto(new URL('?ejemplo=texto-no-permitido#demo-producto', base).href)
    await section.getByRole('radio', { name: 'Limpieza' }).waitFor()
    assert.equal(await section.getByRole('radio', { name: 'Limpieza' }).isChecked(), true)
    assert.equal(await section.getByText('texto-no-permitido').count(), 0)
    for (const [slug, name] of [['limpieza', 'Limpieza'], ['instalaciones', 'Instalaciones']]) {
      await page.goto(new URL('?ejemplo=' + slug + '#demo-producto', base).href)
      const selected = section.getByRole('radio', { name })
      await selected.waitFor()
      assert.equal(await selected.isChecked(), true)
    }
  } finally {
    await browser.close()
  }

  const browserSinJS = await launch()
  try {
    const page = await browserSinJS.newPage({ javaScriptEnabled: false })
    await page.route('**/*', (route) =>
      new URL(route.request().url()).origin === base.origin ? route.continue() : route.abort(),
    )
    await page.goto(new URL('?ejemplo=instalaciones#demo-producto', base).href)
    const section = page.locator('#demo-producto')
    const cases = section.locator('[data-recorrido-fallback] details')
    assert.equal(await cases.count(), 3)
    for (const example of await cases.all()) {
      const summary = example.locator('summary')
      assert.equal(await summary.isVisible(), true)
      await summary.focus()
      await summary.press('Enter')
      assert.equal(await example.locator('li').count(), 4)
      assert.match(await example.locator('ol').textContent(), /quedan.*por cobrar/u)
    }
    assert.equal(await section.getByRole('tab').count(), 0)
  } finally {
    await browserSinJS.close()
  }
  console.log('Recorrido a 320/390/768/1280 px: tres casos, enlace directo, decisiones encadenadas, cobro parcial y total, reset, teclado, sin JS y movimiento reducido.')
}

smoke().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
