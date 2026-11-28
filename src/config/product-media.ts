export const captures = {
  agenda: {
    src: '/producto/agenda.webp',
    width: 1080,
    height: 760,
    alt: 'Pantalla de Planificación con visitas ficticias y una visita sin persona ni equipo en Por resolver.',
  },
  presupuesto: {
    src: '/producto/presupuesto.webp',
    width: 1080,
    height: 760,
    alt: 'Lista de presupuestos de ejemplo con estados y filtros Sin respuesta y Vigencia pasada.',
  },
  parte: {
    src: '/producto/parte-movil.webp',
    width: 390,
    height: 850,
    alt: 'Parte de visita de ejemplo en el móvil: lista de comprobaciones, notas del técnico y botón Guardar parte.',
  },
  cobros: {
    src: '/producto/cobros.webp',
    width: 1080,
    height: 760,
    alt: 'Vista de facturas de ejemplo con el saldo por cobrar y el filtro de vencidas.',
  },
} as const;

export const walkthroughs = [
  {
    title: 'Desde la oficina',
    duration: '14 s',
    src: '/producto/recorrido-oficina.mp4',
    poster: '/producto/recorrido-oficina-poster.webp',
    description: [
      'Envía un presupuesto. En la lista puedes ver cuáles se han aceptado y cuáles siguen sin respuesta.',
      'Asigna el trabajo. En Planificación aparecen las visitas previstas y las que aún no tienen persona ni equipo.',
      'Consulta las facturas pendientes y vencidas. Usa Registrar cobro cuando ya hayas recibido el dinero.',
    ],
  },
  {
    title: 'Desde el móvil del técnico',
    duration: '9 s',
    src: '/producto/recorrido-tecnico.mp4',
    poster: '/producto/recorrido-tecnico-poster.webp',
    description: [
      'Abre Mi jornada para encontrar tu próxima visita y consultar sus indicaciones si están disponibles.',
      'En el parte, marca las comprobaciones realizadas, anota lo que convenga y guarda el parte.',
    ],
  },
] as const;
