import { glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'

const sectores = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/sectores" }),
  schema: z.object({
    titulo: z.string(),
    descripcion: z.string(),
    imagen: z.string(),
    orden: z.number().default(0),
    comparativa: z.any().optional(),
    caso_uso: z.object({
      titulo: z.string(),
      descripcion: z.string(),
      resultados: z.array(z.string()),
    }).optional(),
    beneficios_sector: z.array(
      z.object({
        paso: z.string(),
        titulo: z.string(),
        texto: z.string(),
      })
    ).optional(),
    faq_sector: z.array(
      z.object({
        pregunta: z.string(),
        respuesta: z.string(),
      })
    ).optional(),
  }),
});

const funcionalidades = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/funcionalidades' }),
  schema: z.object({
    titulo: z.string(),
    descripcion: z.string(),
    orden: z.number().default(0),
  }),
})

export const collections = { sectores, funcionalidades }
