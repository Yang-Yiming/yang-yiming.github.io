import { getCollection, type CollectionEntry } from "astro:content";

export type EntryCollection = "blog" | "life";
export type Entry = CollectionEntry<EntryCollection>;

export async function getEntries(collection: EntryCollection): Promise<Entry[]> {
  const entries = await getCollection(collection, ({ data }) => !data.draft);
  return entries.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

// Static paths for an entry route; external entries get no page.
export async function getEntryPaths(collection: EntryCollection) {
  const entries = await getEntries(collection);
  return entries.filter((entry) => !entry.data.external).map((entry) => ({ params: { post: entry.id }, props: { entry } }));
}

export function entryHref(entry: Entry) {
  return entry.data.external ?? `/${entry.collection}/${entry.id}/`;
}

export function entryLabel(entry: Entry) {
  return entry.data.label ?? formatMonth(entry.data.date);
}

export function formatMonth(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}
