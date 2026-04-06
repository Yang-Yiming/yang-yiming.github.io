import type { SectionContent } from "./types";

export const siteMeta = {
  name: "Yang Yiming",
  role: "Designer, Builder, Researcher",
  summary:
    "An editorial index for projects, research notes, writing, and fragments of daily curiosity.",
  location: "Based in Shenzhen / building on the web",
  accentLabel: "Available for thoughtful collaborations",
  links: [
    { label: "GitHub", href: "https://github.com/" },
    { label: "Email", href: "mailto:hello@example.com" },
    { label: "X", href: "https://x.com/" },
  ],
};

export const sections: SectionContent[] = [
  {
    id: "home",
    navLabel: "Home",
    kicker: "Index / 01",
    title: "Personal statements, selected work, and a living archive.",
    intro:
      "Built as a calm, scrollable document. The homepage acts both as an introduction and as a direct entry point into ongoing work.",
    items: [
      {
        title: "Current focus",
        meta: "2026",
        description:
          "Designing digital systems with an editorial eye and a builder's sense of structure.",
      },
      {
        title: "Selected direction",
        meta: "Projects + Research",
        description:
          "Bridging product execution, visual language, and technical experimentation.",
      },
    ],
  },
  {
    id: "projects",
    navLabel: "Projects",
    kicker: "Index / 02",
    title: "Projects with visible structure and quiet ambition.",
    intro:
      "A compact list of product, interface, and creative engineering work. This area is ready to grow into full case studies later.",
    items: [
      {
        title: "Project Placeholder Alpha",
        meta: "Interface System",
        description:
          "A future case study slot for product work, rationale, and shipping notes.",
      },
      {
        title: "Project Placeholder Beta",
        meta: "Web Experiment",
        description:
          "Reserved for a visually led build that combines typography, interaction, and narrative flow.",
      },
      {
        title: "Project Placeholder Gamma",
        meta: "Tooling",
        description:
          "Space for a smaller utility or internal tool with a precise technical angle.",
      },
    ],
  },
  {
    id: "research",
    navLabel: "Research",
    kicker: "Index / 03",
    title: "Working notes, references, and questions worth staying with.",
    intro:
      "Research is framed as an evolving notebook: hypotheses, systems thinking, annotated readings, and exploratory prototypes.",
    items: [
      {
        title: "Theme Placeholder",
        meta: "Human-Computer Interaction",
        description:
          "Documenting problems, references, and methods that can later become deeper essays or publications.",
      },
      {
        title: "Reading Cluster",
        meta: "Archive",
        description:
          "A slot for reading trails, citations, and the threads connecting them.",
      },
    ],
  },
  {
    id: "life",
    navLabel: "Life",
    kicker: "Index / 04",
    title: "A softer register for places, routines, and things that shape the work.",
    intro:
      "Not everything belongs in a project log. This section leaves room for travel fragments, habits, conversations, and atmosphere.",
    items: [
      {
        title: "City Notes",
        meta: "Shenzhen / elsewhere",
        description:
          "Impressions from movement, weather, streets, and recurring places.",
      },
      {
        title: "Rituals",
        meta: "Daily Practice",
        description:
          "Small routines that quietly influence attention, energy, and pace.",
      },
    ],
  },
  {
    id: "blog",
    navLabel: "Blog",
    kicker: "Index / 05",
    title: "Short essays, build notes, and unfinished thoughts.",
    intro:
      "The blog will eventually house writing that sits between documentation and reflection, keeping the tone concise and legible.",
    items: [
      {
        title: "Draft Slot One",
        meta: "Essay",
        description:
          "A place for a clean, focused post on process, design, or software craft.",
      },
      {
        title: "Draft Slot Two",
        meta: "Build Note",
        description:
          "A shorter entry for implementation decisions, experiments, and lessons learned.",
      },
    ],
  },
  {
    id: "fun",
    navLabel: "Fun!",
    kicker: "Index / 06",
    title: "Odd links, playful prototypes, and the less reasonable side of curiosity.",
    intro:
      "A closing section for experiments that are faster, lighter, stranger, or simply enjoyable enough to keep around.",
    items: [
      {
        title: "Mini Playground",
        meta: "Prototype",
        description:
          "Reserved for small interactive pieces, sketches, or delightful technical detours.",
      },
      {
        title: "Collectibles",
        meta: "Miscellany",
        description:
          "Bookmarks, references, and artifacts that deserve a more casual home.",
      },
    ],
  },
];
