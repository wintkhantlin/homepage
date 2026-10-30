---
target: home page ux
total_score: 24
max_score: 36
na_heuristics: 10
p0_count: 0
p1_count: 2
timestamp: 2026-10-30T16-40-14Z
slug: src-pages-index-astro
---
Method: dual-agent (A: UX design review sub-agent · B: detector + browser sub-agent)

## Design Health Score
| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | Scroll-spy marks "Work" but clicking leaves the page |
| 2 | Match System / Real World | 2 | Rows lead with frontend stack + generic types; positioning is backend |
| 3 | User Control and Freedom | 3 | Case study "All projects" goes to /projects, not back |
| 4 | Consistency and Standards | 2 | Mixed page links/anchors in nav; award photos hover-only desktop vs inline mobile |
| 5 | Error Prevention | 3 | mailto-only contact, no copy fallback |
| 6 | Recognition Rather Than Recall | 2 | Rows lack description/role/maturity; hover thumbnail hides type |
| 7 | Flexibility and Efficiency | 3 | Skip link, keyboard rows, email one click away |
| 8 | Aesthetic and Minimalist Design | 3 | Mobile dead space; portrait pushes projects below fold |
| 9 | Error Recovery | 3 | Diagram failure state honest with retry |
| 10 | Help and Documentation | n/a | Portfolio |
| Total | | 24/36 | Acceptable (67%) |

## Design Specificity Verdict
Identity layer specific (name, portrait, Burmese, awards); decision layer generic. Project data holds Redis/Kafka/ClickHouse/RabbitMQ/PostGIS + role + proofPoints, none reach homepage (technologies.slice(0,4)).
Detector: CLI 0; in-page 6 (radial-spotlight-glow intentional; cramped-padding on hero CTA false positive; thin-border-wide-shadow x2 award popovers; heading-rhythm About real, Competition results likely false). Browser extras: grey focus ring on hero GitHub/LinkedIn, 15 paragraphs at 14px on mobile, 4px clipped overrun in tools dl.

## Priority Issues
- [P1] Rows hide positioning evidence: curate stack (systems first), add highlight-title second line. /impeccable clarify
- [P1] role and maturity never shown: role on case study meta, maturity label on rows. /impeccable clarify
- [P2] Resting rows flat; hover thumbnail replaces type. Name at muted, keep type on hover. /impeccable polish
- [P2] Nav dual semantics (scroll-spy vs page links), Story hidden mobile, awards undiscoverable and unlinked to projects. /impeccable layout
- [P3] Mobile: projects below fold, 14px paragraphs, About spacing, grey focus ring on hero links, tools overrun. /impeccable adapt

## Persona Red Flags
Jordan: can't tell what projects are; "Story" vague. Riley: mailto-only; hover hides info; mermaid 504 in dev. Casey: projects below fold, Story missing, 14px body, narrow header targets. Hiring manager: no role/maturity, React-first rows vs backend copy, no role sought, generic About.

## Minor Observations
"Say hello." 65.5px = hero size; thumbnails alt=""; oldest post featured; SectionHeader.astro unused; footer dock duplicates header, email x4.

## Questions to Consider
- Would four row titles + stacks read "backend engineer"?
- Why are awards and projects never linked?
- Does resting dim cost the page its one decision?
