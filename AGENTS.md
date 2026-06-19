# Repository Guidelines

## Structure
- `src/App.tsx`: page structure, section composition, and landing reveal
- `src/components/Landing.tsx`: full-screen landing intro
- `src/content/`: editable content and image references (`index.ts`, `siteMeta.ts`, `sections.ts`, `entries.ts`, `projects.ts`)
- `src/styles.css` + `src/styles/`: visual system, spacing, typography, layout, and landing effect
- `src/types.ts`: shared types
- `public/assets/`: static images

Keep content in `src/content/`, not scattered through components. Keep visual changes in `src/styles.css` and `src/styles/` unless structure must change.

## Workflow
Use `bun` for all local work in this repository. Do not switch package managers.

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
Use TypeScript, React function components, and 2-space indentation.

- components/types: `PascalCase`
- variables/functions: `camelCase`
- CSS classes: section-oriented names such as `hero__title`

Keep code small, direct, and easy to edit later.

## Commits
Use short, descriptive commit messages in imperative style, for example `Refine homepage hero layout`.
