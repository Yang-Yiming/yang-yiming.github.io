import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const schema = z.object({
  title: z.string(),
  summary: z.string(),
  date: z.coerce.date(),
  // Shown instead of the formatted date in lists, e.g. "Ongoing Practice".
  label: z.string().optional(),
  // List row links straight here; no entry page is generated.
  external: z.url().optional(),
  // Shown in the "Selected" view of a toggleable list; everything appears under "All".
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
});

export const collections = {
  blog: defineCollection({ loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/blog" }), schema }),
  life: defineCollection({ loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/life" }), schema }),
};
