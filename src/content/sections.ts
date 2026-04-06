import type { SectionContent } from "../types";
import { githubProjectGroups } from "./projects";

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
    title: "Research",
    intro:
      "Now being an undergraduate and willing to do some contribution to the research community.\n\
      My interest are in Auto Regressive Multimodal-LLMs, and I hopes to find a way that go beyond\
      language to achieve more",
    items: [
      // {
      //   title: "Theme Placeholder",
      //   meta: "Human-Computer Interaction",
      //   description:
      //     "Documenting problems, references, and methods that can later become deeper essays or publications.",
      // },
      // {
      //   title: "Reading Cluster",
      //   meta: "Archive",
      //   description:
      //     "A slot for reading trails, citations, and the threads connecting them.",
      // },
    ],
  },
  {
    id: "life",
    navLabel: "Life",
    kicker: "Index / 04",
    title: "Things I do and love",
    intro:
      "Not everything belongs in a project log.\
      This section leaves room for my hobbies, habits, books, music.",
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
    title: "Blog",
    intro:
      "The blog will eventually house writing that sits between documentation and reflection, any words could be here.",
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
