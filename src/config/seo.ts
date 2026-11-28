export const seo = {
  homeTitle: 'Software para empresas de servicios | Menos Líos',
  homeDescription: 'Gestiona presupuestos, visitas, partes y facturas en Menos Líos. Para equipos de limpieza, instalaciones y mantenimiento que trabajan en varios centros.',
  shareImage: '/producto/agenda.webp',
  shareImageAlt: 'Agenda de Menos Líos con visitas asignadas y por resolver, con datos de ejemplo.',
} as const;

export function canonicalUrl(path: string, site: URL) {
  const url = new URL(path, site);
  url.search = '';
  url.hash = '';
  if (url.pathname !== '/') url.pathname = url.pathname.replace(/\/+$/, '');
  return url;
}

export const sectorSeo: Record<string, {
  query: string;
  description: string;
  related: string[];
  image: string;
  imageAlt: string;
}> = {
  limpieza: {
    query: 'Software para empresas de limpieza',
    description: 'Programa la limpieza de comunidades y oficinas, asigna visitas por centro y prepara la facturación mensual con los partes del equipo.',
    related: ['mantenimiento', 'instalaciones'],
    image: '/producto/agenda.webp',
    imageAlt: 'Agenda de Menos Líos para organizar visitas de limpieza por centro.',
  },
  mantenimiento: {
    query: 'Software para empresas de mantenimiento',
    description: 'Organiza revisiones recurrentes, completa los partes de mantenimiento desde el móvil y comparte el PDF con tus clientes.',
    related: ['climatizacion', 'electricidad'],
    image: '/producto/parte-movil.webp',
    imageAlt: 'Parte de trabajo de Menos Líos en el móvil con lista de comprobaciones.',
  },
  instalaciones: {
    query: 'Software de gestión para instaladores',
    description: 'Pasa del presupuesto aceptado a las visitas de montaje. Asigna tareas, consulta los partes del equipo y prepara la factura de cada instalación.',
    related: ['electricidad', 'climatizacion'],
    image: '/producto/presupuesto.webp',
    imageAlt: 'Listado de presupuestos de trabajos en Menos Líos.',
  },
  climatizacion: {
    query: 'Software para instaladores de climatización',
    description: 'Organiza avisos de aire acondicionado y revisiones programadas. Asigna visitas y consulta los partes de intervención antes de facturar.',
    related: ['mantenimiento', 'instalaciones'],
    image: '/producto/agenda.webp',
    imageAlt: 'Agenda de intervenciones y revisiones en Menos Líos.',
  },
  electricidad: {
    query: 'Software de gestión para electricistas',
    description: 'Prepara presupuestos de instalaciones eléctricas, reparte avisos entre técnicos y consulta los partes de reparación para preparar la factura.',
    related: ['instalaciones', 'mantenimiento'],
    image: '/producto/agenda.webp',
    imageAlt: 'Planificación de visitas y avisos en Menos Líos.',
  },
  fontaneria: {
    query: 'Software de gestión para fontaneros',
    description: 'Asigna avisos de fugas y reparaciones, guarda el parte desde el móvil y consulta el saldo pendiente de la factura.',
    related: ['mantenimiento', 'reformas'],
    image: '/producto/cobros.webp',
    imageAlt: 'Listado de facturas pendientes de cobro en Menos Líos.',
  },
  reformas: {
    query: 'Software de gestión para empresas de reformas',
    description: 'Prepara presupuestos por capítulos, sigue las visitas del equipo y factura los hitos acordados de cada reforma.',
    related: ['instalaciones', 'fontaneria'],
    image: '/producto/presupuesto.webp',
    imageAlt: 'Presupuestos de trabajos registrados en Menos Líos.',
  },
};
