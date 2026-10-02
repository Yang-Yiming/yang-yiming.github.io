export interface Project {
  // GitHub repo in owner/name form; stars and language are fetched at build time.
  repo: string;
  group: "contributor" | "maintainer";
  // Fallback when GitHub stats are unavailable.
  language?: string;
  // Each line renders on its own line; `code` spans are allowed.
  description: string[];
}

export const PROJECT_GROUPS = [
  { id: "contributor", title: "Me as a contributor" },
  {
    id: "maintainer",
    title: "Me as a maintainer",
    blurb:
      "I also enjoy vibe-coding small tools that serve my own needs, and the needs of my club and other student organizations.",
  },
] as const;

export const PROJECTS: Project[] = [
  {
    repo: "BarutSRB/OmniWM",
    group: "contributor",
    language: "Swift",
    description: [
      "A macOS tiling window manager inspired by Niri and Hyprland.",
      "Added support for human-readable `settings.json` output and optional incremental exports.",
    ],
  },
  {
    repo: "Yang-Yiming/tabstart",
    group: "maintainer",
    language: "TypeScript",
    description: [
      "A plugin-based browser start page I use as my new tab.",
      "Every widget — bookmarks, notes, kanban, pomodoro — is a plugin.",
    ],
  },
  {
    repo: "Yang-Yiming/TSokoban",
    group: "maintainer",
    language: "TypeScript",
    description: [
      "A TypeScript rebuild of my CS109 Java Sokoban project, plus some more gaming features.",
    ],
  },
  {
    repo: "Yang-Yiming/backend-processes",
    group: "maintainer",
    language: "TypeScript",
    description: ["An Obsidian plugin for launching and managing local shell processes from a tab."],
  },
  {
    repo: "Yang-Yiming/NOVA-ledger",
    group: "maintainer",
    language: "TypeScript",
    description: ["The ledger for NOVA, the street dance club I'm in: entries, summaries, and xlsx export."],
  },
];
