import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const home = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8')
const sector = await readFile(
  new URL('../dist/sectores/electricidad/index.html', import.meta.url),
  'utf8',
)

test('la landing utiliza la nueva marca y el dominio canónico', () => {
  assert.match(home, /<html lang="es"/)
  assert.match(home, /<title>Software para empresas de servicios \| Menos Líos<\/title>/)
  assert.match(home, /rel="canonical" href="https:\/\/www\.menoslios\.com\/"/)
  assert.match(home, /property="og:site_name" content="Menos Líos"/)
  assert.match(home, /name="twitter:title" content="Software para empresas de servicios \| Menos Líos"/)
  assert.doesNotMatch(home, /Ábaco|PoolOps|MenosLios|Menos Lios|abaco-logo\.svg/)
  assert.doesNotMatch(home, /href="https:\/\/abaco\.doscientos\.es\//)
})

test('las páginas de sectores tienen metadatos propios', () => {
  assert.match(sector, /<title>[^<]+ \| Menos Líos<\/title>/)
  assert.match(sector, /rel="canonical" href="https:\/\/www\.menoslios\.com\/sectores\/electricidad"/)
  assert.doesNotMatch(sector, /Ábaco|MenosLios|Menos Lios|abaco-logo\.svg/)
  assert.match(sector, /<h1[^>]*>Software de gestión para electricistas<\/h1>/)
  assert.match(sector, /Prepara presupuestos de instalaciones eléctricas, reparte avisos entre técnicos/)
  assert.match(sector, /href="\/#precios"/)
  assert.match(sector, /<footer\b/)
  assert.match(sector, /Del aviso eléctrico al parte de intervención/)
  assert.match(sector, /Materiales y cableado/)
  assert.match(sector, /¿Puedo detallar los materiales eléctricos específicos utilizados en una avería\?/)
  assert.doesNotMatch(sector, /14 días gratis|prueba gratuita/i)
})

test('los sectores sin comparativa se generan correctamente', async () => {
  const climatizacion = await readFile(
    new URL('../dist/sectores/climatizacion/index.html', import.meta.url),
    'utf8',
  )
  assert.match(climatizacion, /<title>Software para instaladores de climatización \| Menos Líos<\/title>/)
  assert.doesNotMatch(climatizacion, /undefined/)
})

test('los CTA comerciales enlazan a la inscripción de la demo semanal', () => {
  for (const [html, minimum] of [
    [home, 5],
    [sector, 4],
  ]) {
    const links = [
      ...html.matchAll(
        /<a\b[^>]*href="https:\/\/cal\.com\/demo-grupal-de-menoslios"[^>]*>([\s\S]*?)<\/a>/g,
      ),
    ]
    assert.ok(links.length >= minimum)
    for (const [, content] of links) assert.match(content, /Unirme a la siguiente demo/)
    assert.doesNotMatch(html, /href="https:\/\/abaco\.doscientos\.es\//)
  }
})

test('la portada conserva el hero activo y sus secciones principales', () => {
  assert.match(home, /<main\b[^>]*id="contenido"/)
  assert.match(home, /<img\b[^>]*src="\/producto\/agenda\.webp"[^>]*fetchpriority="high"/)
  assert.doesNotMatch(home, /\/fondo\.mp4/)
  assert.match(home, /<h1[^>]*>Del presupuesto al cobro, <span[^>]*>sin líos\.<\/span><\/h1>/)
  assert.equal((home.match(/<h1\b/g) ?? []).length, 1)
  assert.match(home, /Presupuestos, agenda, partes y cobros para empresas de servicios/)
  assert.match(home, /Elige tu oficio/)
  assert.match(home, /id="pricing-title"[^>]*>Precios<\/h2>/)
  assert.doesNotMatch(home, /<video\b[^>]*autoplay/)
  assert.match(home, /href="#contenido"[^>]*>Saltar al contenido/)
  assert.match(home, /<details\b[^>]*data-header-menu/)
  for (const step of ['Presupuesta y envía', 'Organiza las visitas', 'Deja el parte hecho', 'Factura y sigue los cobros']) {
    assert.ok(home.includes(step), step)
  }
  for (const id of ['en-pantalla', 'demo-producto', 'ejemplos', 'pasos', 'sectores', 'asistente', 'integraciones', 'precios', 'preguntas']) {
    assert.match(home, new RegExp(`id="${id}"`))
  }
  assert.doesNotMatch(home, /Más piscinas/)
  assert.match(home, /<footer\b/)
})

test('Ir a mi panel enlaza al login normal en portada y sectores', () => {
  for (const page of [home, sector]) {
    const links = [...page.matchAll(/<a\b[^>]*href="https:\/\/app\.menoslios\.com\/entrar"[^>]*>Ir a mi panel<\/a>/g)]
    assert.ok(links.length >= 2)
    assert.doesNotMatch(page, /href="[^"]*superadmin/i)
  }
})

test('las capturas reales tienen un texto alternativo y un presupuesto de transferencia pequeño', async () => {
  assert.match(home, /pantallas reales de la aplicación con datos ficticios/)
  for (const [file, width, height] of [
    ['agenda.webp', 1080, 760], ['presupuesto.webp', 1080, 760], ['parte-movil.webp', 390, 850], ['cobros.webp', 1080, 760],
  ]) {
    const img = [...home.matchAll(/<img\b[^>]+>/g)].map(([tag]) => tag).find((tag) => tag.includes(`/producto/${file}`))
    assert.ok(img, file)
    assert.match(img, /alt="[^"]{24,}"/)
    assert.match(img, new RegExp(`width="${width}" height="${height}"`))
    const content = await readFile(new URL(`../dist/producto/${file}`, import.meta.url))
    assert.equal(content.toString('ascii', 8, 12), 'WEBP')
    assert.ok(content.length > 10_000 && content.length < 75_000, file)
  }
})

test('dos vídeos locales solo bajo demanda con alternativa textual por rol', async () => {
  const video = [...home.matchAll(/<video\b[^>]+>/g)].map(([tag]) => tag)
  assert.equal(video.length, 2)
  for (const role of ['oficina', 'tecnico']) {
    const id = `recorrido-${role}`
    const tag = video.find((element) => element.includes(`/producto/${id}-poster.webp`))
    assert.ok(tag, id)
    assert.match(tag, /\bcontrols\b/)
    assert.match(tag, /\bplaysinline\b/)
    assert.match(tag, /preload="none"/)
    assert.doesNotMatch(tag, /autoplay|\bloop\b/)
    assert.ok(home.includes(`<source src="/producto/${id}.mp4" type="video/mp4">`))
    const clip = await readFile(new URL(`../dist/producto/${id}.mp4`, import.meta.url))
    assert.equal(clip.toString('ascii', 4, 8), 'ftyp')
    assert.ok(clip.length < 110_000)
  }
  assert.equal((home.match(/Leer la descripción del vídeo/g) ?? []).length, 2)
  assert.match(home, /Registra(?:r)? cobro cuando ya hayas recibido el dinero/)
  assert.match(home, /En el parte, marca las comprobaciones realizadas/)
})

test('las guías enlazan al oficio con un texto descriptivo', () => {
  for (const [slug, label] of [
    ['limpieza', 'Organizar rutas de limpieza por centro'],
    ['mantenimiento', 'Preparar partes de mantenimiento'],
    ['instalaciones', 'Planificar un montaje tras el presupuesto'],
  ]) {
    assert.match(home, new RegExp(`href="/sectores/${slug}"[^>]*>${label}</a>`))
  }
})

test('el trabajo de campo se explica con una foto y una captura, sin repetir tarjetas', () => {
  const flow = home.match(/<section[^>]+id="pasos"[\s\S]*?<\/section>/)?.[0]
  assert.ok(flow)
  assert.match(flow, /El parte no espera a que vuelvas a la oficina/)
  assert.match(flow, /src="\/sectores\/instalacion\.avif"[^>]*alt="[^"]+"/)
  assert.match(flow, /src="\/producto\/mi-jornada\.webp"[^>]*alt="[^"]+"/)
  assert.match(flow, /En ruta[\s\S]+En la oficina/)
  assert.match(flow, /retoma el borrador en el mismo móvil/)
  assert.match(flow, /Registra el cobro al recibirlo/)
  assert.match(flow, /Reintenta el envío de fotos pendientes en el mismo dispositivo/)
  assert.doesNotMatch(flow, /cualquier dispositivo|cobra automátic[ao]/i)
})

test('pricing preserves the live catalogue without adding commercial buttons or trial claims', () => {
  assert.match(home, /data-pricing-endpoint="https:\/\/app\.menoslios\.com\/api\/public-pricing"/)
  const pricing = home.match(/<section[^>]+id="precios"[\s\S]*?<\/section>/)?.[0]
  assert.ok(pricing)
  assert.match(pricing, /href="https:\/\/app\.menoslios\.com\/precios"/)
  assert.doesNotMatch(pricing, /\/registro|cal\.com|Crear mi empresa/)
  assert.doesNotMatch(home, /Prueba Gratuita|14 días gratis|>20€</i)
})


test('el recorrido se identifica como simulación y conserva los pasos sin JavaScript', () => {
  assert.match(home, /href="#demo-producto"/)
  assert.match(home, /simulación de Menos Líos con datos ficticios/)
  assert.match(home, /no guarda datos ni envía documentos o pagos/)
  assert.equal((home.match(/data-recorrido-panel[\s>]/g) ?? []).length, 4)
  assert.match(home, /Aceptar presupuesto/)
  assert.match(home, /data-recorrido-comprobacion/)
  assert.match(home, /Guardar borrador/)
  assert.match(home, /Registra un cobro recibido/)
})

test('los siete sectores conservan sus rutas y no ofrecen firmas legales ni cobros automáticos', async () => {
  const sectores = new Map([
    ['instalaciones', 'copia firmada a mano'],
    ['climatizacion', 'no sustituye la documentación reglamentaria'],
    ['electricidad', 'Del aviso eléctrico al parte de intervención'],
    ['fontaneria', 'si el cliente firma en papel'],
    ['reformas', 'facturación por hitos'],
    ['mantenimiento', 'no es un certificado oficial'],
    ['limpieza', 'registra cada cobro cuando lo recibas'],
  ])
  for (const [slug, texto] of sectores) {
    const html = await readFile(new URL(`../dist/sectores/${slug}/index.html`, import.meta.url), 'utf8')
    assert.ok(html.toLowerCase().includes(texto.toLowerCase()), slug)
    assert.ok(html.includes(`https://www.menoslios.com/sectores/${slug}`), slug)
    assert.doesNotMatch(html, /firma digital|parte certificado|certificación instantánea|cobro[s]? inmediato[s]?|cobro[s]? automátic[oa][s]?|14 días gratis/i, slug)
  }
})

test('el asistente explica propuestas con revisión e integraciones sin cobro automático', () => {
  assert.match(home, /id="ai-title"[^>]*>Pídeselo a la IA\./)
  assert.equal((home.match(/name="asistente-ejemplos"/g) ?? []).length, 3)
  assert.match(home, /Tú la revisas antes de guardar/)
  assert.match(home, /Ejemplos ilustrativos\. No ejecutan acciones en la web/)
  assert.match(home, /id="integraciones"/)
  assert.match(home, /Google Calendar/)
  assert.match(home, /Excel y CSV/)
})

test('los precios tienen periodicidad accesible y no llevan importes estáticos', () => {
  for (const [key, label] of [['monthly', 'Mensual'], ['yearly', 'Anual']]) {
    assert.match(home, new RegExp(`data-billing="${key}"[^>]*>${label}<`))
  }
  assert.match(home, /data-base-amount><\/span>/)
  assert.match(home, /Consulta los importes en el catálogo/)
})
