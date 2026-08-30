# MDX authoring standard

Posts live in `src/content/posts/` and use `.mdx`. The filename is the public URL slug, so rename it only when a redirect is also added.

## Frontmatter

Every post must include:

```yaml
---
title: A clear reader-facing title
summary: One concise sentence used on article lists
categories: ["software-engineering"]
publishedDate: 2026-08-30T12:00:00Z
lang: en
---
```

Optional fields:

- `seoTitle` and `seoDescription` customize search and social metadata.
- `description` is a longer visible introduction. When absent, `summary` is used.
- `updatedDate` records a meaningful revision and must not precede `publishedDate`.
- `draft: true` keeps a post out of public routes and lists.
- `cover` accepts a local image path and requires `coverAlt`.
- `lang` accepts `en` or `my`. The page also detects Myanmar titles when this field is omitted.

Do not add a `slug` field. The filename is the canonical slug.

## Images

Use local images whenever possible. Put article-specific assets beside the content area or under `src/assets/img/`, import them, and render them with `ArticleImage`:

```mdx
import ArticleImage from "../../components/mdx/ArticleImage.astro";
import diagram from "../../assets/img/example.png";

<ArticleImage
  src={diagram}
  alt="Diagram showing the request moving from the API to the queue"
  caption="The request path remains short while background work continues."
/>
```

Remote images require an approved domain in `astro.config.mjs` plus explicit intrinsic dimensions:

```mdx
<ArticleImage
  src="https://example.com/diagram.png"
  alt="Specific description of what the diagram communicates"
  width={1600}
  height={900}
  credit="Source name"
  sourceUrl="https://example.com/original"
/>
```

Use `eager` only for the first meaningful article image. Decorative images use `alt=""`; informative images require descriptive alt text. Captions add context and must not duplicate the alt text.

## Rich content

Use callouts sparingly for information that needs a distinct reading pause:

```mdx
import Callout from "../../components/mdx/Callout.astro";

<Callout type="tip" title="Retry rule">
  Reuse one idempotency key for every retry of the same logical operation.
</Callout>
```

Supported callout types are `note`, `tip`, and `warning`. Normal explanation belongs in paragraphs, not callouts.

Callouts can disclose optional detail without hiding it from no-JavaScript readers:

```mdx
<Callout type="note" title="Implementation detail" collapsible open={false}>
  This explanation starts collapsed and remains keyboard accessible.
</Callout>
```

Use collapsed callouts only for supplementary material. Important warnings should remain open with `open` or use the default non-collapsible presentation.

Fenced code blocks are rendered by Astro Expressive Code and automatically receive its maintained, accessible copy control. The table of contents can be collapsed and marks the current section while the reader scrolls.

Use fenced code blocks with a language identifier, keep heading levels sequential, and use Markdown links normally. External links are secured and opened in a new tab by the shared article renderer.

## Checklist

- The title and summary explain the reader benefit.
- Dates use ISO 8601 and include a timezone when practical.
- Headings start at `##`; the page owns the single `h1`.
- Code fences declare a language such as `ts`, `go`, `python`, `http`, or `text`.
- Images include correct dimensions, useful alt text, and source credit when needed.
- Links use descriptive text instead of raw URLs.
- The article works in light and dark themes and at mobile width.
- `bunx astro check` and `bun run build` pass before publishing.
