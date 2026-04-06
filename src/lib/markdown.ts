import DOMPurify from "dompurify";
import { marked } from "marked";

marked.setOptions({
  breaks: true,
  gfm: true,
});

export function renderMarkdown(markdown: string) {
  const rawHtml = marked.parse(markdown) as string;
  return {
    __html: DOMPurify.sanitize(rawHtml),
  };
}
