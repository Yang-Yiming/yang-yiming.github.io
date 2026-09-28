export type SectionId =
  | "home"
  | "projects"
  | "research"
  | "life"
  | "blog"
  | "fun";

export type EntryCollectionId = "life" | "blog";
export type EntryKind = "markdown" | "html" | "app" | "link";
export type EntryOpenMode = "entry" | "iframe" | "native";

export interface SectionItem {
  title: string;
  meta: string;
  description: string;
  href?: string;
}

export interface ProjectImage {
  src: string;
  alt: string;
}

export interface GitHubProject {
  title: string;
  description: string;
  href: string;
  year: string;
  stars?: string;
  language?: string;
  visibility?: "Public" | "Private";
  image?: ProjectImage;
}

export interface GitHubProjectGroup {
  title: string;
  items: GitHubProject[];
}


export interface SiteLink {
  label: string;
  href: string;
  icon?: "github" | "email";
}

export interface SectionContent {
  id: SectionId;
  navLabel: string;
  kicker: string;
  title: string;
  intro: string;
  sourceLabel?: string;
  items?: SectionItem[];
  projectGroups?: GitHubProjectGroup[];
}

export interface EntryFrontmatter {
  title: string;
  summary: string;
  meta: string;
  date?: string;
  kicker?: string;
  coverImage?: string;
  coverAlt?: string;
}

export interface EntryRecord extends EntryFrontmatter {
  collectionId: EntryCollectionId;
  kind: EntryKind;
  open: EntryOpenMode;
  slug: string;
  href: string;
  assetBase?: string;
  source?: string;
  externalHref?: string;
  content?: string;
}
