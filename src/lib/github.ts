export function getRepoLabel(href: string) {
  try {
    const { pathname } = new URL(href);
    return pathname.replace(/^\/+/, "") || href;
  } catch {
    return href;
  }
}
