import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import remarkBreaks from "remark-breaks";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export default defineConfig({
  site: "https://yang-yiming.github.io",
  output: "static",
  trailingSlash: "ignore",
  redirects: { "/life/electronic-music": "/life/music" },
  integrations: [mdx(), sitemap()],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkBreaks, remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
  },
});
