import type {
  EntryCollectionId,
  EntryFrontmatter,
  EntryRecord,
  SectionItem,
} from "../types";

const entryModules = {
  life: import.meta.glob("./life/*.md", {
    eager: true,
    import: "default",
    query: "?raw",
  }) as Record<string, string>,
  blog: import.meta.glob("./blog/*.md", {
    eager: true,
    import: "default",
    query: "?raw",
  }) as Record<string, string>,
};

const requiredFrontmatterFields = ["title", "summary", "meta"] as const;

function parseFrontmatter(source: string) {
  const trimmedSource = source.trim();

  if (!trimmedSource.startsWith("---")) {
    throw new Error("Entry markdown must start with frontmatter.");
  }

  const closingMarkerIndex = trimmedSource.indexOf("\n---", 3);

  if (closingMarkerIndex === -1) {
    throw new Error("Entry markdown frontmatter must end with ---.");
  }

  const frontmatterBlock = trimmedSource.slice(3, closingMarkerIndex).trim();
  const content = trimmedSource.slice(closingMarkerIndex + 4).trim();
  const frontmatter = Object.fromEntries(
    frontmatterBlock
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const separatorIndex = line.indexOf(":");

        if (separatorIndex === -1) {
          throw new Error(`Invalid frontmatter line: ${line}`);
        }

        const key = line.slice(0, separatorIndex).trim();
        const value = line
          .slice(separatorIndex + 1)
          .trim()
          .replace(/^["']|["']$/g, "");

        return [key, value];
      }),
  ) as Partial<EntryFrontmatter>;

  requiredFrontmatterFields.forEach((field) => {
    if (!frontmatter[field]) {
      throw new Error(`Missing frontmatter field: ${field}`);
    }
  });

  return {
    frontmatter: frontmatter as EntryFrontmatter,
    content,
  };
}

function pathToSlug(path: string) {
  return path.split("/").pop()?.replace(/\.md$/, "") ?? path;
}

function sortEntries(left: EntryRecord, right: EntryRecord) {
  const leftDate = left.date ? Date.parse(left.date) : Number.NaN;
  const rightDate = right.date ? Date.parse(right.date) : Number.NaN;

  if (!Number.isNaN(leftDate) && !Number.isNaN(rightDate) && leftDate !== rightDate) {
    return rightDate - leftDate;
  }

  return left.title.localeCompare(right.title);
}

function buildEntries(collectionId: EntryCollectionId) {
  return Object.entries(entryModules[collectionId])
    .map(([path, source]) => {
      const slug = pathToSlug(path);
      const { frontmatter, content } = parseFrontmatter(source);

      return {
        ...frontmatter,
        collectionId,
        slug,
        href: `/${collectionId}/${slug}`,
        content,
      } satisfies EntryRecord;
    })
    .sort(sortEntries);
}

export const entriesByCollection: Record<EntryCollectionId, EntryRecord[]> = {
  life: buildEntries("life"),
  blog: buildEntries("blog"),
};

export const allEntries = Object.values(entriesByCollection).flat();

export function getEntries(collectionId: EntryCollectionId) {
  return entriesByCollection[collectionId];
}

export function getEntry(collectionId: EntryCollectionId, slug: string) {
  return entriesByCollection[collectionId].find((entry) => entry.slug === slug);
}

export function getEntrySectionItems(collectionId: EntryCollectionId): SectionItem[] {
  return getEntries(collectionId).map((entry) => ({
    title: entry.title,
    meta: entry.meta,
    description: entry.summary,
    href: entry.href,
  }));
}
