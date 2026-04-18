import DOMPurify from "dompurify";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

const markdownProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkBreaks)
  .use(remarkMath)
  .use(remarkRehype, {
    allowDangerousHtml: true,
  })
  .use(rehypeKatex)
  .use(rehypeStringify, {
    allowDangerousHtml: true,
  });

export function renderMarkdown(markdown: string) {
  const rawHtml = String(markdownProcessor.processSync(markdown));
  return {
    __html: DOMPurify.sanitize(rawHtml),
  };
}
