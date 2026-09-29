import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { site } from "../content/site";
import { entryHref, getEntries } from "../lib/content";

export async function GET(context: APIContext) {
  const entries = await getEntries("blog");
  return rss({
    title: site.name,
    description: site.description,
    site: context.site!,
    items: entries.map((entry) => ({
      title: entry.data.title,
      description: entry.data.summary,
      pubDate: entry.data.date,
      link: entryHref(entry),
    })),
  });
}
