import { defineConfig } from "astro/config";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export default defineConfig({
  output: "static",
  build: { format: "directory" },
  markdown: {
    remarkPlugins: [remarkGfm, remarkBreaks, remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});
