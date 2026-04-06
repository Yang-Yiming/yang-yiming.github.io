export type SectionId =
  | "home"
  | "projects"
  | "research"
  | "life"
  | "blog"
  | "fun";

export interface SectionItem {
  title: string;
  meta: string;
  description: string;
  href?: string;
}

export interface SectionContent {
  id: SectionId;
  navLabel: string;
  kicker: string;
  title: string;
  intro: string;
  items?: SectionItem[];
}
