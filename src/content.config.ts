import { defineCollection } from "astro:content";
import { z } from "astro/zod";

const posts = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string().trim().min(1),
    seoTitle: z.string().trim().min(1).optional(),
    summary: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1).optional(),
    seoDescription: z.string().trim().min(1).optional(),
    categories: z.array(z.string().trim().min(1)).min(1),
    publishedDate: z.coerce.date(),
    lang: z.enum(["en", "my"]).optional(),
  }),
});

const projects = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      name: z.string().trim().min(1),
      type: z.string().trim().min(1).optional(),
      description: z.string().trim().min(1),
      seoTitle: z.string().trim().min(1).optional(),
      seoDescription: z.string().trim().min(1).optional(),
      source: z.url(),
      publishedDate: z.coerce.date(),
      img: image(),
      technologies: z.array(z.string().trim().min(1)).min(1).optional(),
      color: z.string().regex(/^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i),
      caseStudy: z.object({
        status: z.string().trim().min(1),
        challenge: z.string().trim().min(1),
        approach: z.string().trim().min(1),
        architecture: z.array(z.string().trim().min(1)).min(1),
        highlights: z.array(z.string().trim().min(1)).min(1),
        diagram: z.string().trim().min(1),
      }),
    }),
});

export const collections = { posts, projects };
