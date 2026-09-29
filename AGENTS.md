# Repository Guidelines

## Structure
- `src/content/`: all editable content, written as Markdown
  - `site.ts`: name, summary, tagline, links, quick links
  - `sections/*.md`: home-page sections (`order`, `nav`, `title`, intro body; `draft: true` hides one)
  - `projects/*.md`: one file per GitHub repo (`repo`, `group`, `order`); stars/language are fetched at build time
  - `life/`, `blog/`: entries (`title`, `summary`, `date`, optional `label`, `embed`, `external`, `draft`); put images next to the post
- `src/content.config.ts`: collection schemas
- `src/lib/`: content helpers and GitHub stats
- `src/components/`: Astro components (`Hero`, `Ghost`, `Section`, `Projects`, `ProjectCard`, `ListRow`, `SiteHeader`, `ThemeToggle`)
- `src/layouts/BaseLayout.astro`: `<head>`, header, page shell
- `src/pages/`: home, entry pages, `404`, `rss.xml`
- `src/styles/`: `tokens.css` (colors via `light-dark()`, type/spacing scale), `prose.css` (article bodies), one file per area
- `src/assets/ghost/`: photos the ghost can show
- `public/`: files served as-is (embedded charts, PDFs)

Keep content in `src/content/`, not in components. Keep visual changes in `src/styles/` unless structure must change.

## Workflow
Use `bun` for all local work in this repository. Do not switch package managers.

- `bun run dev`: local server
- `bun run build`: `astro check` + static build to `dist/`

## Clarification
For any feature work, continue asking clarifying questions until the goal, scope, constraints, and acceptance criteria are fully explicit. Do not proceed on unresolved assumptions.

## Design Direction
This site should stay within an editorial minimal language:

- cool off-white background
- `Geist Mono` for utility/body text, `Source Serif 4` for editorial emphasis
- single steel-blue / indigo accent
- no shadows
- generous whitespace
- hairline borders instead of heavy containers
- calm, premium, restrained composition inspired by `paco.me` and `linear.app`

Avoid generic SaaS cards, loud gradients, crowded UI, or decorative effects that break the restraint.

## Style
Use TypeScript, Astro components, and 2-space indentation (including CSS).

- components/types: `PascalCase`
- variables/functions: `camelCase`
- CSS classes: section-oriented names such as `hero__title`

Keep code small, direct, and easy to edit later.

## Commits
Use short, descriptive commit messages in imperative style, for example `Refine homepage hero layout`.
