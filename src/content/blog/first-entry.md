---
title: How To Add A New Entry
summary: A placeholder post that documents the markdown workflow for future blog writing.
meta: April 2026 / Setup
date: 2026-04-06
kicker: Blog / 01
---

This sample post exists so the `Blog` section uses exactly the same card-to-entry system as `Life`.

## Minimal workflow

1. Create a new markdown file in `src/content/blog/`
2. Add frontmatter with `title`, `summary`, and `meta`
3. Write the article body in markdown
4. Put images in `public/assets/`
5. Reference those images with absolute paths such as `/assets/blog/my-post/cover.jpg`

## Frontmatter example

```md
---
title: My New Post
summary: One-line summary used on the homepage card.
meta: April 2026 / Essay
date: 2026-04-06
kicker: Blog / 02
---
```

The homepage card is generated automatically. The detail page route is generated from the file name, so `my-new-post.md` becomes `/blog/my-new-post`.
