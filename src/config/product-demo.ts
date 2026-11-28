export const demoCases = [
  {
    id: 'limpieza', name: 'Limpieza', customer: 'Comunidad Olivar',
    title: 'Limpieza de portal y escalera', location: 'Portal A',
    context: 'La comunidad pide una limpieza a fondo antes de su reunión de vecinos.',
    question: '¿El presupuesto incluye las puertas de entrada?',
    clarification: 'Sí. Las puertas de entrada y los cristales del portal están incluidos en el alcance.',
    price: 18000, firstPayment: 8000, quoteNumber: 'PRE-041', invoiceNumber: 'FAC-041',
    people: ['Vera', 'Laia'], slots: ['Martes, 08:30–10:00', 'Miércoles, 11:00–12:30'],
    tasks: ['Limpiar portal y escalera', 'Repasar puertas y cristales'],
    note: 'Acceso y escalera listos. Se han repasado las marcas de la puerta de entrada.',
  },
  {
    id: 'mantenimiento', name: 'Mantenimiento', customer: 'Taller Roble',
    title: 'Revisión del equipo de climatización', location: 'Zona de taller',
    context: 'El taller quiere revisar un equipo que ha perdido rendimiento sin parar su actividad.',
    question: '¿La revisión incluye cambiar piezas?',
    clarification: 'La propuesta incluye diagnóstico y limpieza. Si hace falta una pieza, se presupuestará aparte.',
    price: 26000, firstPayment: 10000, quoteNumber: 'PRE-042', invoiceNumber: 'FAC-042',
    people: ['Vera', 'Marc'], slots: ['Martes, 09:00–10:30', 'Jueves, 15:00–16:30'],
    tasks: ['Revisar filtros y conexiones', 'Comprobar el funcionamiento'],
    note: 'Se han limpiado los filtros. El equipo recuperó el caudal durante la prueba.',
  },
  {
    id: 'instalaciones', name: 'Instalaciones', customer: 'Oficinas Brisa',
    title: 'Montaje de luminarias en una oficina', location: 'Planta 2',
    context: 'La oficina renueva las luces de una sala y necesita que el montaje quede registrado.',
    question: '¿Comprobaréis las luminarias después del montaje?',
    clarification: 'Sí. La propuesta incluye montaje y una comprobación de encendido antes de acabar.',
    price: 78000, firstPayment: 30000, quoteNumber: 'PRE-043', invoiceNumber: 'FAC-043',
    people: ['Marc', 'Laia'], slots: ['Miércoles, 08:00–10:30', 'Viernes, 12:00–14:30'],
    tasks: ['Montar las luminarias', 'Probar todos los puntos de luz'],
    note: 'Luminarias montadas y probadas. Todos los puntos de luz responden.',
  },
] as const;

export type DemoCase = (typeof demoCases)[number];

const euro = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
export const demoEuros = (cents: number) => euro.format(cents / 100);
