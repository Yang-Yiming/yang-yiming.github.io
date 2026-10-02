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
  { id: "maintainer", title: "Me as a maintainer" },
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
    repo: "Yang-Yiming/cc-router-lite",
    group: "maintainer",
    language: "Rust",
    description: [
      "A lightweight Claude Code / Codex backend switcher that works by automatically editing config files.",
      "Includes a CLI and a polished Ratatui TUI.",
    ],
  },
  {
    repo: "Yang-Yiming/AppTossLite",
    group: "maintainer",
    language: "Rust",
    description: [
      "Manage Xcode projects and IPAs, and build/deploy them to an iPhone with a single command.",
      "Supports both a CLI and a Ratatui TUI.",
    ],
  },
  {
    repo: "Yang-Yiming/Zhicheng-Warehouse-Manager",
    group: "maintainer",
    language: "JavaScript",
    description: ["A WeChat Mini Program for SUSTech Zhicheng College to manage warehouse inventory."],
  },
  {
    repo: "Yang-Yiming/kimi-learn",
    group: "maintainer",
    language: "Python",
    description: ["Skills and a web app based on Wire API and Kimi CLI for my family to study."],
  },
];
