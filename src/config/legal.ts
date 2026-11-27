export const company = {
  name: 'Doscientos Desarrollo Tecnologico, S.L.',
  taxId: 'B88873393',
  address: 'Carrer Can Pou, 12, 08330 Premià de Mar (Barcelona), España',
  register: 'Registro Mercantil de Barcelona, sección 8, hoja B 658663, inscripción 1.',
  email: 'hola@doscientos.es',
  registerSource: 'https://www.boe.es/borme/dias/2026/06/16/pdfs/BORME-A-2026-113-08.pdf',
} as const

export const legalPages = [
  { path: '/aviso-legal', label: 'Aviso legal' },
  { path: '/privacidad', label: 'Privacidad' },
  { path: '/cookies', label: 'Cookies' },
] as const

export type LegalPath = (typeof legalPages)[number]['path']
