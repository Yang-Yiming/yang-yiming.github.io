import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { SITE } from "../consts";
import { entryHref, getEntries } from "../entries";

export async function GET(context: APIContext) {
  const entries = await getEntries("blog");
  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site!,
    items: entries.map((entry) => ({
      title: entry.data.title,
      description: entry.data.summary,
      pubDate: entry.data.date,
      link: entryHref(entry),
    })),
  });
}
