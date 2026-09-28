import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const entrySchema = z.object({
  title: z.string(),
  summary: z.string(),
  meta: z.string(),
  date: z.coerce.date().optional(),
  kicker: z.string().optional(),
  coverImage: z.string().optional(),
  coverAlt: z.string().optional(),
  kind: z.enum(["markdown", "html", "app", "link"]).default("markdown"),
  open: z.enum(["entry", "iframe", "native"]).default("entry"),
  href: z.string().optional(),
});

export const collections = {
  life: defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/life" }),
    schema: entrySchema,
  }),
  blog: defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
    schema: entrySchema,
  }),
};
