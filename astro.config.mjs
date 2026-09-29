import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import sitemap from "@astrojs/sitemap";
import remarkBreaks from "remark-breaks";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export default defineConfig({
  site: "https://yang-yiming.github.io",
  output: "static",
  build: { format: "directory" },
  integrations: [sitemap()],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkBreaks, remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
  },
});
