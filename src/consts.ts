export const SITE = {
  name: "Yang Yiming",
  role: "Student · Data Science",
  description: "Personal homepage for Yang Yiming.",
  summary:
    "I'm an undergraduate at SUSTech studying Data Science, interested in multimodal LLMs and computer science. " +
    "I love old-school street dance and bass-heavy music, and I build tools with AI whenever I need one.",
  tagline: "When I'm thirsty, I drink.",
  links: [
    // Drop the PDF at public/cv/Yang-Yiming-CV.pdf (served as /cv/Yang-Yiming-CV.pdf).
    { label: "CV", href: "/cv/Yang-Yiming-CV.pdf", icon: "cv" },
    { label: "GitHub", href: "https://github.com/Yang-Yiming", icon: "github" },
    { label: "Email", href: "mailto:12411332@mail.sustech.edu.cn", icon: "mail" },
  ] as const,
};

// Home page sections, in page order. Ids match the section anchors.
export const NAV = [
  { id: "home", label: "Home" },
  { id: "projects", label: "Projects" },
  { id: "research", label: "Research" },
  { id: "blog", label: "Blog" },
  { id: "life", label: "Life" },
  { id: "fun", label: "Fun!" },
] as const;

export type SectionId = (typeof NAV)[number]["id"];

// Sections listed under "Quick entry" in the hero.
export const QUICK_LINKS: SectionId[] = ["projects", "research", "blog", "life"];

export function sectionKicker(id: SectionId) {
  const index = NAV.findIndex((item) => item.id === id);
  return `Index / ${String(index + 1).padStart(2, "0")}`;
}
