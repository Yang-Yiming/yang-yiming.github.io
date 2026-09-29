import { getCollection, type CollectionEntry } from "astro:content";

export const entryCollections = ["life", "blog"] as const;

export type EntryCollection = (typeof entryCollections)[number];
export type Entry = CollectionEntry<EntryCollection>;
export type Section = CollectionEntry<"sections"> & { kicker: string };

export function isEntryCollection(id: string): id is EntryCollection {
  return (entryCollections as readonly string[]).includes(id);
}

export async function getSections(): Promise<Section[]> {
  const sections = await getCollection("sections", ({ data }) => !data.draft);
  return sections
    .sort((a, b) => a.data.order - b.data.order)
    .map((section, index) => ({ ...section, kicker: `Index / ${String(index + 1).padStart(2, "0")}` }));
}

export async function getEntries(collection: EntryCollection): Promise<Entry[]> {
  const entries = await getCollection(collection, ({ data }) => !data.draft);
  return entries.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
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

export function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
