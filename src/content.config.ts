import { glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'

const sectores = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/sectores' }),
  schema: z.object({
    titulo: z.string(),
    descripcion: z.string(),
    imagen: z.string(),
    orden: z.number().default(0),
    comparativa: z
      .object({
        titulo: z.string(),
        subtitulo: z.string(),
        antes_titulo: z.string(),
        despues_titulo: z.string(),
        puntos: z.array(
          z.object({
            concepto: z.string(),
            antes: z.string(),
            despues: z.string(),
          }),
        ),
      })
      .optional(),
  }),
})

const funcionalidades = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/funcionalidades' }),
  schema: z.object({
    titulo: z.string(),
    descripcion: z.string(),
    orden: z.number().default(0),
  }),
})

export const collections = { sectores, funcionalidades }
