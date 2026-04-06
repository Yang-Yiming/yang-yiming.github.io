export type SectionId =
  | "home"
  | "projects"
  | "research"
  | "life"
  | "blog"
  | "fun";

export type EntryCollectionId = "life" | "blog";

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

export interface HeroImage {
  src: string;
  alt: string;
  caption: string;
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
  slug: string;
  href: string;
  content: string;
}
