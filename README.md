# Menos Líos

Landing de Menos Líos, software de gestión de Doscientos para profesionales y empresas de servicios. El sitio está construido con Astro y Tailwind CSS y genera páginas estáticas.

- Dominio previsto: [menoslios.com](https://menoslios.com).
- Repositorio: [doscientos-es/landing-menoslios](https://github.com/doscientos-es/landing-menoslios).

## Desarrollo

Requiere Node.js 22.23.4 o superior y npm. Desde la raíz del proyecto:

- `npm ci`: instala las dependencias del lockfile.
- `npm run dev`: inicia el servidor de desarrollo.
- `npm run build`: genera el sitio en `dist/`.
- `npm run preview`: previsualiza la compilación.
- `node --test tests/*.test.mjs`: comprueba la marca y los metadatos del sitio compilado; ejecuta antes `npm run build`.

## Estructura

- `src/components/layout/`: cabecera y pie compartidos.
- `src/components/sections/`: secciones de la landing. `Ayudas` y `Beneficios` se conservan, pero no se muestran actualmente.
- `src/components/ui/`: piezas reutilizables de interfaz.
- `src/pages/`: página principal y páginas de sectores.
- `src/content/`: contenidos de sectores y funcionalidades.
- `src/layouts/Base.astro`: metadatos y estructura HTML compartida.
- `src/config/demo.ts`: enlace y texto de inscripción a la demo grupal.
- `astro.config.mjs`: configuración de Astro y dominio canónico.
- `public/`: recursos estáticos.

## Publicación

Publica el contenido de `dist/` y configura `menoslios.com` y su DNS en el proveedor de hosting. Los CTA comerciales enlazan a la inscripción semanal de Cal.com. Revisa las fechas disponibles y añade nuevas sesiones antes de que se agoten.

## Precios

La sección pública consulta en cada carga `https://app.menoslios.com/api/public-pricing`.
El importe base, los asientos extra y las tarifas de módulos se publican desde
**Superadmin → Planes y precios** en la aplicación. No hay precios de reserva
en la landing: si falla el catálogo, se puede reintentar o abrir el catálogo
en la app. `node --test tests/pricing.test.mjs` comprueba ese contrato.

## Mensaje de marca

- **Nombre:** Menos Líos, con espacio y tilde. El dominio se escribe `menoslios.com`.
- **Promesa principal:** «Del presupuesto al cobro, sin líos». Acompáñala con la categoría «Software de gestión para empresas de servicios».
- **Oficina y calle:** «La oficina y el equipo, en la misma página».
- **Por sector:** «Cada oficio tiene su ritmo».
- **Tarifas:** «Empieza con lo que necesitas». La cuota y los módulos vienen del catálogo, no de textos de campaña.

En `src/config/brand.ts` se comparte el nombre, la promesa de portada y la descripción social. Conservamos el verde, la lima y los fondos aprobados, asignados a tokens de texto y superficie en `src/styles/global.css`, junto con los activos existentes. El vídeo decorativo no arranca en móvil ni con movimiento reducido y puede pausarse.
