import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkBreaks)
  .use(remarkMath)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeKatex)
  .use(rehypeStringify, { allowDangerousHtml: true });

export function renderMarkdown(markdown: string) {
  return String(processor.processSync(markdown));
}

export function renderInlineMarkdown(markdown: string) {
  return renderMarkdown(markdown).replace(/^<p>|<\/p>$/g, "");
}

export function resolveAssetUrls(html: string, assetBase?: string) {
  if (!assetBase) return html;
  return html.replace(/(src|href)="((?![a-z][a-z0-9+.-]*:|\/|#)[^"]+)"/gi, (_, attribute, value) => {
    const base = assetBase.endsWith("/") ? assetBase : `${assetBase}/`;
    return `${attribute}="${base}${value.replace(/^\.\//, "")}"`;
  });
}
