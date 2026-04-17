import type { GitHubProjectGroup } from "../types";

export const githubProjectGroups = [
  {
    title: "Me as a contributor",
    items: [
      {
        title: "OmniWM",
        description:
          "A macOS tiling window manager inspired by Niri and Hyprland.\n\
        Added support for human-readable `settings.json` output and optional incremental exports.",
        href: "https://github.com/BarutSRB/OmniWM",
        year: "2026",
        stars: "1.5k",
        language: "Swift",
        visibility: "Public",
      },
    ],
  },
  {
    title: "Me as a maintainer",
    items: [
      {
        title: "CC-Router-Lite",
        description:
          "A lightweight Claude Code / Codex backend switcher that works by automatically editing config files.\n\
          Includes a CLI and a polished Ratatui TUI.",
        href: "https://github.com/Yang-Yiming/cc-router-lite",
        year: "2026",
        // stars: "0",
        language: "Rust",
        visibility: "Public",
      },
      {
        title: "AppTossLite",
        description:
          "Manage Xcode projects and IPAs, and build/deploy them to an iPhone with a single command.\n\
          Supports both a CLI and a Ratatui TUI.",
        href: "https://github.com/Yang-Yiming/AppTossLite",
        year: "2026",
        language: "Rust",
        visibility: "Public",
      },
      {
        title: "Zhicheng Warehouse Manager",
        description:
          "A WeChat Mini Program for SUSTech Zhicheng College to manage warehouse inventory.",
        href: "https://github.com/Yang-Yiming/Zhicheng-Warehouse-Manager",
        year: "2026",
        // stars: "0",
        language: "Javascript",
        visibility: "Public",
      },
    ],
  },
] satisfies GitHubProjectGroup[];
