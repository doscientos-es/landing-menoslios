# Menos Lios

Landing de Menos Lios, software de gestión de Doscientos para profesionales y empresas de servicios. El sitio está construido con Astro y Tailwind CSS y genera páginas estáticas.

- Dominio previsto: [menoslios.com](https://menoslios.com).
- Repositorio: [doscientos-es/landing-menoslios](https://github.com/doscientos-es/landing-menoslios).

## Desarrollo

Requiere Node.js 22.23.4 o superior y npm. Desde la raíz del proyecto:

- `npm ci`: instala las dependencias del lockfile.
- `npm run dev`: inicia el servidor de desarrollo.
- `npm run build`: genera el sitio en `dist/`.
- `npm run preview`: previsualiza la compilación.
- `node --test tests/landing.test.mjs`: comprueba la marca y los metadatos del sitio compilado; ejecuta antes `npm run build`.

## Estructura

- `src/components/layout/`: cabecera y pie compartidos.
- `src/components/sections/`: secciones de la landing. `Ayudas` y `Beneficios` se conservan, pero no se muestran actualmente.
- `src/components/ui/`: piezas reutilizables de interfaz.
- `src/pages/`: página principal y páginas de sectores.
- `src/content/`: contenidos de sectores y funcionalidades.
- `src/layouts/Base.astro`: metadatos y estructura HTML compartida.
- `astro.config.mjs`: configuración de Astro y dominio canónico.
- `public/`: recursos estáticos.

## Publicación

Publica el contenido de `dist/` y configura `menoslios.com` y su DNS en el proveedor de hosting. El acceso a la aplicación sigue apuntando a `https://abaco.doscientos.es/` hasta confirmar su nueva dirección; no debe confundirse con el dominio de la landing.
