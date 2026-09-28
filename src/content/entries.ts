import { getCollection, getEntry as getCollectionEntry } from "astro:content";
import type { EntryCollectionId, EntryRecord, SectionItem } from "../types";

type CollectionEntry = Awaited<ReturnType<typeof getCollection>>[number];

function toEntryRecord(collectionId: EntryCollectionId, entry: CollectionEntry): EntryRecord {
  const { data } = entry;
  const slug = entry.id.replace(/\/index$/, "");
  const href = `/${collectionId}/${slug}`;

  return {
    ...data,
    collectionId,
    slug,
    href: data.kind === "link" && data.href ? data.href : href,
    externalHref: data.href,
    sourceEntry: entry,
  };
}

function sortEntries(left: EntryRecord, right: EntryRecord) {
  const leftDate = left.date?.getTime() ?? Number.NaN;
  const rightDate = right.date?.getTime() ?? Number.NaN;

  if (!Number.isNaN(leftDate) && !Number.isNaN(rightDate) && leftDate !== rightDate) {
    return rightDate - leftDate;
  }

  return left.title.localeCompare(right.title);
}

export async function getEntries(collectionId: EntryCollectionId) {
  const entries = await getCollection(collectionId);
  return entries.map((entry) => toEntryRecord(collectionId, entry)).sort(sortEntries);
}

export async function getAllEntries() {
  const [life, blog] = await Promise.all([getEntries("life"), getEntries("blog")]);
  return [...life, ...blog];
}

export async function getEntry(collectionId: EntryCollectionId, slug: string) {
  const entry = await getCollectionEntry(collectionId, slug);
  return entry ? toEntryRecord(collectionId, entry) : undefined;
}

export async function getEntrySectionItems(collectionId: EntryCollectionId): Promise<SectionItem[]> {
  const entries = await getEntries(collectionId);
  return entries.map((entry) => ({
    title: entry.title,
    meta: entry.meta,
    description: entry.summary,
    href: entry.href,
  }));
}
