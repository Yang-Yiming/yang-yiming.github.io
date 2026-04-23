import type { SectionContent } from "../types";
import { getEntrySectionItems } from "./entries";
import { githubProjectGroups } from "./projects";

export const sections: SectionContent[] = [
  {
    id: "home",
    navLabel: "Home",
    kicker: "Index / 01",
    title: "Hello, I'm Yang Yiming",
    intro:
      "**SUSTech** · Shenzhen, China\n\n**Data Science** Undergraduate · Class of 2024\n\n**GPA** 3.92/4.00 · **Rank** 3/59\n\n**Key coursework**: Mathematical Analysis, Advanced Linear Algebra, Data Structure and Algorithm Analysis (H), Foundation of Probability, Artificial Intelligence.\n\n**Programming**: Python, Java, LaTeX, a bit Rust",
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
      "Now I am an undergraduate and hope to contribute to the research community.\n\
      My interests lie in autoregressive multimodal LLMs, and I aim to explore ways \
      to go beyond language toward broader capabilities.",
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
      This section leaves room for my hobbies, habits, books, music, etc.",
    items: getEntrySectionItems("life"),
  },
  {
    id: "blog",
    navLabel: "Blog",
    kicker: "Index / 05",
    title: "Blog",
    intro:
      "The blog will eventually house writing that sits between documentation and reflection, any words could be here.",
    items: getEntrySectionItems("blog"),
  },
  {
    id: "fun",
    navLabel: "Fun!",
    kicker: "Index / 06",
    title: "Just some fun things.",
    intro: "Developing...",
    items: [],
  },
];
