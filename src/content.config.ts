import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const sectores = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/sectores" }),
  schema: z.object({
    titulo: z.string(),
    descripcion: z.string(),
    imagen: z.string(),
    orden: z.number().default(0),
  }),
});

export const collections = { sectores };