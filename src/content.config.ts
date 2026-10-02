import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const schema = z.object({
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
  blog: defineCollection({ loader: glob({ pattern: "**/*.md", base: "./src/blog" }), schema }),
  life: defineCollection({ loader: glob({ pattern: "**/*.md", base: "./src/life" }), schema }),
};
