import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const entry = z.object({
  title: z.string(),
  summary: z.string(),
  date: z.coerce.date(),
  // Shown instead of the formatted date in lists, e.g. "Ongoing Practice".
  label: z.string().optional(),
  // Page embedded as an iframe below the entry body.
  embed: z.string().optional(),
  // List row links straight here; no entry page is generated.
  external: z.url().optional(),
  draft: z.boolean().default(false),
});

export const collections = {
  sections: defineCollection({
    loader: glob({ pattern: "*.md", base: "./src/content/sections" }),
    schema: z.object({
      title: z.string(),
      nav: z.string(),
      order: z.number(),
      source: z.string().optional(),
      groups: z.array(z.object({ id: z.string(), title: z.string() })).default([]),
      draft: z.boolean().default(false),
    }),
  }),
  projects: defineCollection({
    loader: glob({ pattern: "*.md", base: "./src/content/projects" }),
    schema: z.object({
      repo: z.string().regex(/^[\w.-]+\/[\w.-]+$/, "Use the owner/name form"),
      group: z.string(),
      order: z.number().default(0),
      language: z.string().optional(),
    }),
  }),
  life: defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/life" }),
    schema: entry,
  }),
  blog: defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
    schema: entry,
  }),
};
