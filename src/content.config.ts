import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { parseDiagram } from "./lib/diagramNodes";

const posts = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/posts",
  }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().trim().min(1),
        seoTitle: z.string().trim().min(1).optional(),
        summary: z.string().trim().min(1).optional(),
        englishSummary: z.string().trim().min(1).optional(),
        description: z.string().trim().min(1).optional(),
        seoDescription: z.string().trim().min(1).optional(),
        categories: z.array(z.string().trim().min(1)).min(1),
        publishedDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        lang: z.enum(["en", "my"]).optional(),
        draft: z.boolean().default(false),
        cover: image().optional(),
        coverAlt: z.string().trim().min(1).optional(),
      })
      .superRefine((data, context) => {
        if (data.cover && !data.coverAlt) {
          context.addIssue({
            code: "custom",
            path: ["coverAlt"],
            message: "coverAlt is required when cover is set",
          });
        }

        if (data.updatedDate && data.updatedDate < data.publishedDate) {
          context.addIssue({
            code: "custom",
            path: ["updatedDate"],
            message: "updatedDate cannot be earlier than publishedDate",
          });
        }
      }),
});

const projects = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/projects",
  }),
  schema: ({ image }) =>
    z.object({
      name: z.string().trim().min(1),
      type: z.string().trim().min(1).optional(),
      description: z.string().trim().min(1),
      seoTitle: z.string().trim().min(1).optional(),
      seoDescription: z.string().trim().min(1).optional(),
      source: z.url(),
      demo: z.url().optional(),
      publishedDate: z.coerce.date(),
      img: image(),
      technologies: z.array(z.string().trim().min(1)).min(1).optional(),
      featured: z.boolean().default(false),
      featuredOrder: z.number().int().positive().optional(),
      maturity: z.enum(["built", "prototype", "work-in-progress"]),
      context: z.enum(["open-source", "personal", "hackathon"]),
      role: z.string().trim().min(1),
      proofPoints: z
        .array(
          z.object({
            title: z.string().trim().min(1),
            detail: z.string().trim().min(1),
          }),
        )
        .length(2),
      color: z.string().regex(/^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i),
      caseStudy: z
        .object({
          status: z.string().trim().min(1),
          challenge: z.string().trim().min(1),
          approach: z.string().trim().min(1),
          // Each component is one chapter of the case study; `nodes` are the ids of the diagram nodes it explains.
          components: z
            .array(
              z.object({
                nodes: z.array(z.string().trim().min(1)).default([]),
                detail: z.string().trim().min(1),
              }),
            )
            .min(1),
          features: z
            .array(
              z.object({
                text: z.string().trim().min(1),
                nodes: z.array(z.string().trim().min(1)).default([]),
              }),
            )
            .min(1),
          // Written when there is a decision worth recording; the Decisions chapter shows only when there are entries.
          decisions: z
            .array(
              z.object({
                title: z.string().trim().min(1),
                context: z.string().trim().min(1),
                decision: z.string().trim().min(1),
                tradeoff: z.string().trim().min(1),
              }),
            )
            .optional(),
          diagram: z.string().trim().min(1),
        })
        .superRefine((caseStudy, context) => {
          const known = new Set(Object.keys(parseDiagram(caseStudy.diagram)));
          for (const key of ["components", "features"] as const) {
            caseStudy[key].forEach((entry, index) => {
              entry.nodes.forEach((node, position) => {
                if (known.has(node)) return;
                context.addIssue({
                  code: "custom",
                  path: [key, index, "nodes", position],
                  message: `"${node}" is not a node in the diagram (nodes: ${[...known].join(", ")})`,
                });
              });
            });
          }
        }),
    }),
});

export const collections = { posts, projects };
