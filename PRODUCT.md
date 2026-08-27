# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Mixed audience:

- Hiring teams evaluating Wint Khant Lin's technical judgment, project depth, and fit for software engineering roles.
- Developer peers discovering his work, writing, and learning-in-public process.

## Product Purpose

This site presents Wint Khant Lin's work, writing, and background in one place. It exists to make his software engineering practice legible through project case studies, technical notes, and personal context, with success measured by whether visitors can quickly understand what he builds, how he thinks, and why his work is worth following or contacting him about.

## Positioning

The portfolio should differentiate on systems depth. It is not just a gallery of finished screens or generic personal-brand copy; it should show reliable backend thinking, architectural substance, and the discipline of learning by shipping and documenting real work.

## Operating Context

The product is a personal website for Wint Khant Lin, also known as Happer. Visitors move between a homepage, project case studies, and programming writing. The site's content is maintained in a codebase with markdown-driven project and post collections, and it includes direct paths to source code, personal writing, and contact/social profiles.

## Capabilities and Constraints

- Publishes a homepage with hero, selected work, writing, and about sections.
- Publishes individual project case studies from `src/content/projects/*`.
- Publishes individual writing posts and a writing index from `src/content/posts/*` and `src/pages/writing.astro`.
- Includes structured SEO metadata and machine-readable routes such as RSS and robots output.
- Runs as an existing Astro web codebase with Tailwind-based styling and MDX content.
- Future work should preserve the site's product truth: Wint Khant Lin's identity, systems-oriented positioning, Myanmar context where already stated, and learning-in-public voice.
- No evidence in the repository supports inventing clients, testimonials, employment claims, pricing, or product outcomes beyond the documented projects and posts.

## Brand Commitments

- Name: Wint Khant Lin
- Handle: Happer
- Role: software engineer
- Existing voice commitments: thoughtful, curious, technically serious, and open about learning in public
- Existing identity commitments: personal portfolio rooted in backend engineering, systems programming, web experiments, and programming notes from Myanmar

## Evidence on Hand

- Homepage, writing index, project pages, and post pages in `src/pages/`
- Project content in `src/content/projects/`
- Post content in `src/content/posts/`
- About photography and project imagery in `src/assets/img/`
- SEO and identity metadata in `src/lib/seo.ts`
- Social/contact links to GitHub, LinkedIn, and email in `src/lib/seo.ts`
- No testimonials, press logos, client roster, or third-party proof assets are present in the repository

## Product Principles

- Show engineering thinking, not just outcomes.
- Let documented work carry credibility instead of inflated claims.
- Support both evaluation and discovery without forcing a single audience path.
- Preserve the personal voice of curiosity, reflection, and public learning.
- Keep the product grounded in real artifacts already present in the codebase.
