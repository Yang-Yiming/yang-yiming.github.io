# Repository Guidelines

## Structure
- `src/App.tsx`: page structure and section composition
- `src/content.ts`: editable content and image references
- `src/styles.css`: visual system, spacing, typography, and layout
- `src/types.ts`: shared types
- `public/assets/`: static images

Keep content in `src/content.ts`, not scattered through components. Keep visual changes in `src/styles.css` unless structure must change.

## Workflow
Use `bun` for all local work in this repository. Do not switch package managers.

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
