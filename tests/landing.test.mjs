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
  assert.match(home, /<title>Menos Líos \| Del presupuesto al cobro, sin líos<\/title>/)
  assert.match(home, /rel="canonical" href="https:\/\/menoslios\.com\/"/)
  assert.match(home, /property="og:site_name" content="Menos Líos"/)
  assert.match(home, /name="twitter:title" content="Menos Líos \| Del presupuesto al cobro, sin líos"/)
  assert.doesNotMatch(home, /Ábaco|PoolOps|MenosLios|Menos Lios|abaco-logo\.svg/)
  assert.doesNotMatch(home, /href="https:\/\/abaco\.doscientos\.es\//)
})

test('las páginas de sectores tienen metadatos propios', () => {
  assert.match(sector, /<title>[^<]+ \| Menos Líos<\/title>/)
  assert.match(sector, /rel="canonical" href="https:\/\/menoslios\.com\/sectores\/electricidad\/"/)
  assert.doesNotMatch(sector, /Ábaco|MenosLios|Menos Lios|abaco-logo\.svg/)
  assert.match(sector, /<h1[^>]*>Electricidad<\/h1>/)
  assert.match(sector, /Presupuesta instalaciones, gestiona avisos urgentes y factura al terminar el trabajo\./)
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
  assert.match(climatizacion, /<title>Climatización \| Menos Líos<\/title>/)
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
  assert.match(home, /<video\b[^>]*src="\/fondo\.mp4"/)
  assert.match(home, /<h1[^>]*>Del presupuesto al cobro, <span[^>]*>sin líos\.<\/span><\/h1>/)
  assert.equal((home.match(/<h1\b/g) ?? []).length, 1)
  assert.match(home, /La oficina y el equipo, en la misma página\./)
  assert.match(home, /Cada oficio tiene su ritmo\./)
  assert.match(home, /Empieza con lo que necesitas\./)
  assert.match(home, /aria-controls="hero-background"/)
  assert.doesNotMatch(home, /<video\b[^>]*autoplay/)
  assert.match(home, /href="#contenido"[^>]*>Saltar al contenido/)
  assert.match(home, /<details\b[^>]*data-header-menu/)
  for (const step of ['Presupuesta y envía', 'Organiza las visitas', 'Deja el parte hecho', 'Factura y sigue los cobros']) {
    assert.ok(home.includes(step), step)
  }
  for (const id of ['demo-producto', 'pasos', 'sectores', 'precios', 'preguntas']) {
    assert.match(home, new RegExp(`id="${id}"`))
  }
  assert.doesNotMatch(home, /Más piscinas/)
  assert.match(home, /<footer\b/)
})

test('cómo funciona explica las cinco mejoras sin prometer sincronización ni cobro automático', () => {
  const workflow = home.match(/<section[^>]+id="pasos"[\s\S]*?<\/section>/)?.[0]
  assert.ok(workflow)
  assert.match(workflow, /presupuestos sin respuesta o con la fecha de validez pasada/)
  assert.match(workflow, /quién tiene turno y quién está ausente ese día/)
  assert.match(workflow, /próxima visita y puede abrir el mapa si hay dirección/)
  assert.match(workflow, /retoma el borrador en el mismo dispositivo/)
  assert.match(workflow, /facturas por cobrar o vencidas y consulta cuánto queda pendiente/)
  assert.match(workflow, /después de un cobro parcial/)
  assert.doesNotMatch(workflow, /cualquier dispositivo|cobra automátic[ao]/i)
})

test('el detalle móvil diferencia lo que puede hacer la oficina de lo que ve el técnico', () => {
  const workflow = home.match(/<section[^>]+id="pasos"[\s\S]*?<\/section>/)?.[0]
  const details = workflow?.match(/<details\b[^>]*>[\s\S]*?<\/details>/)?.[0]
  assert.ok(details)
  assert.match(details, /<summary\b[^>]*>\s*Ver más detalles de agenda, partes y cobros\s*<\/summary>/)
  assert.match(details, /En la agenda de oficina<\/strong> Abre «Por resolver» para localizar visitas de hoy o mañana que siguen sin asignar o coinciden con una ausencia confirmada/)
  assert.match(details, /En el móvil del técnico<\/strong> Busca tus visitas cerradas recientes por cliente, centro o nombre de la visita/)
  assert.match(details, /fotos pendientes en el mismo dispositivo y reintenta su envío cuando tengas conexión/)
  assert.match(details, /En la ficha del cliente y en facturas<\/strong> Consulta qué presupuestos no tienen respuesta y cuánto queda por cobrarle al cliente/)
  assert.match(details, /descarga en CSV solo las que coinciden con tus filtros/)
  assert.doesNotMatch(details, /cualquier dispositivo|sincroniza automátic|cobra automátic|todas las visitas/i)
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
    assert.ok(html.includes(`https://menoslios.com/sectores/${slug}/`), slug)
    assert.doesNotMatch(html, /firma digital|parte certificado|certificación instantánea|cobro[s]? inmediato[s]?|cobro[s]? automátic[oa][s]?|14 días gratis/i, slug)
  }
})
