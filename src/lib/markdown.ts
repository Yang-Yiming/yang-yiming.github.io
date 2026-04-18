import DOMPurify from "dompurify";

function escapeHtml(markdown: string) {
  return markdown
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderInlineMarkdown(markdown: string) {
  return escapeHtml(markdown)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/_([^_\n]+)_/g, "<em>$1</em>")
    .replace(/`([^`\n]+)`/g, "<code>$1</code>")
    .replace(
      /\[([^\]\n]+)\]\((https?:\/\/[^)\s]+|mailto:[^)\s]+|\/[^)\s]+|#[^)\s]+)\)/g,
      '<a href="$2">$1</a>',
    )
    .replace(/\n/g, "<br>");
}

export function renderMarkdown(markdown: string) {
  return {
    __html: DOMPurify.sanitize(renderInlineMarkdown(markdown)),
  };
}
