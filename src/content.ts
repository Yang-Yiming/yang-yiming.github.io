import type { GitHubProjectGroup, HeroImage, SectionContent } from "./types";

const githubProjectGroups = [
  {
    title: "Me as a contributor",
    items: [
      {
        title: "OmniWM",
        description: "MacOS Niri and Hyprland inspired tiling window manager.",
        href: "https://github.com/BarutSRB/OmniWM",
        year: "2026",
        stars: "1.2k",
        language: "Swift",
        visibility: "Public",
      },
      {
        title: "Community Tooling Placeholder",
        description:
          "A second contributor-facing slot for a project you supported through features, issue resolution, or maintenance help.",
        href: "https://github.com/Yang-Yiming",
        year: "2025",
        stars: "64",
        language: "TypeScript",
        visibility: "Public",
      },
    ],
  },
  {
    title: "Me as a maintainer",
    items: [
      {
        title: "Maintained Project Placeholder",
        description:
          "A primary repository you own or actively steer, described with a concise summary of purpose, scope, and current maturity.",
        href: "https://github.com/Yang-Yiming",
        year: "2026",
        stars: "42",
        language: "TypeScript",
        visibility: "Public",
      },
      {
        title: "Personal Build Placeholder",
        description:
          "Reserve this slot for a smaller self-directed build that still deserves a clear write-up and direct repository link.",
        href: "https://github.com/Yang-Yiming",
        year: "2024",
        language: "Bun",
        visibility: "Public",
      },
    ],
  },
] satisfies GitHubProjectGroup[];

export const siteMeta = {
  name: "Yang Yiming",
  role: "Student · Data Science",
  summary:
    "I'm an undergraduate student at SUSTech, interested in Computer Science and Artifical Intelegence. \
    I love oldschool street dance culture ([locking](https://en.wikipedia.org/wiki/Locking_(dance)) & [house](https://en.wikipedia.org/wiki/House_dance))\
    while my favorite music genres are [Dubstep](https://en.wikipedia.org/wiki/Dubstep) & [House](https://en.wikipedia.org/wiki/House_music).",
  location: "Shenzhen, China",
  accentLabel: "Empty accentLabel",
  links: [
    { label: "GitHub", href: "https://github.com/Yang-Yiming" },
    { label: "Email", href: "12411332@mail.sustech.edu.cn" },
    // { label: "X", href: "https://x.com/" },
  ],
  heroImages: [
    {
      src: "/assets/sand-homepage.webp",
      alt: "sanddraw",
      caption: "Random Sand Drawing",
    },
    {
      src: "/assets/hero-02.jpg",
      alt: "Hero image two.",
      caption: "Another visual fragment from research or life.",
    },
    {
      src: "/assets/hero-03.jpg",
      alt: "Hero image three.",
      caption: "A third slot for atmosphere or documentation.",
    },
  ] satisfies HeroImage[],
};

export const sections: SectionContent[] = [
  {
    id: "home",
    navLabel: "Home",
    kicker: "Index / 01",
    title: "Hello, I'm Yang Yiming",
    intro: "This is the homepage, showing the indexes and entries",
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
    title: "Projects.",
    intro:
      "Selected GitHub work, grouped by how I participate: contributing to other repositories and maintaining my own.",
    sourceLabel: "GitHub",
    projectGroups: githubProjectGroups,
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
    title:
      "A softer register for places, routines, and things that shape the work.",
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
    title:
      "Odd links, playful prototypes, and the less reasonable side of curiosity.",
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
