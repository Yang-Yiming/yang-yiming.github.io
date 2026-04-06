import type { GitHubProjectGroup } from "../types";

export const githubProjectGroups = [
  {
    title: "Me as a contributor",
    items: [
      {
        title: "OmniWM",
        description: "MacOS Niri and Hyprland inspired tiling window manager.",
        href: "https://github.com/BarutSRB/OmniWM",
        year: "2026",
        stars: "1.2k",
        language: "C++",
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
