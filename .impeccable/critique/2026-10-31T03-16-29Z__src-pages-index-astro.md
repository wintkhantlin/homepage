---
target: home page /
total_score: 20
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 2
timestamp: 2026-10-31T03-16-29Z
slug: src-pages-index-astro
---
Method: dual-agent (A: design review · B: detector/browser)

## Design Health Score
| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 2 | Scroll-spy wrong (Work lit at top; Notes lit during About on mobile) |
| 2 | Match System / Real World | 3 | Project rows list techniques, not what products do |
| 3 | User Control and Freedom | 3 | Skip link, stable anchors, new-tab announced |
| 4 | Consistency and Standards | 2 | Story vs About; Say hello vs Email; double "Say hello."; Tools list omits project stack |
| 5 | Error Prevention | 3 | Empty states present |
| 6 | Recognition Rather Than Recall | 2 | Desktop screenshots hover-only; opaque kind labels |
| 7 | Flexibility and Efficiency | n/a | Experience surface |
| 8 | Aesthetic and Minimalist Design | 2 | Four identical ledgers, six mailto links, glow, coloured dock |
| 9 | Error Recovery | 3 | Few error paths |
| 10 | Help and Documentation | n/a | Portfolio homepage |
| **Total** | | **20/32** | Acceptable |

## Design Specificity Verdict
Hero is authored (portrait, staggered name, Happer, Myanmar); below it one ruled-ledger pattern repeats four times (Projects, Recognition, Writing, Tools). Brief's content-led project layouts not delivered.
Detector: CLI 0 findings. Browser overlay 2: radial-spotlight-glow on .hero-intro-glow (global.css:58, real, agrees with review); cramped-padding on hero email pill (false positive, min-h-12 + items-center). Browser evidence: mobile header links 23-37px wide (<44px); dock tooltips 10.9px; no console errors, no overflow, alt present, clean heading outline, all text AA (lowest 5.35:1).

## Priority Issues
- [P1] Projects hide proof (opacity:0 until hover at >=1280px, ProjectsSection.astro:231-249) and never state what each project does. Fix: one-liner purpose, visible screenshots, lead project larger, drop empty column. /impeccable layout + clarify
- [P1] Shipped default contradicts brief: dark default (BaseLayout.astro:105), lime glow (global.css:58), coloured macOS dock (Footer.astro). Fix: decide theme default or rewrite brief; remove glow; typographic link row. /impeccable quieter
- [P2] Duplicate close ("Say hello." AboutSection.astro:105 + Footer.astro:28; six mailto links) and structural sameness across four sections. /impeccable distill
- [P2] Writing: 2/3 Burmese-only without English gloss, only English post stale (2025 plan), unbounded list. /impeccable clarify
- [P2] Nav: scroll-spy thresholds, Story/About naming, mobile tap widths, Tools list mismatch. /impeccable polish

## Persona Red Flags
- Hiring manager (desktop, 90s): can't tell what projects do; hover-only screenshots; no CV link; no availability/graduation; Burmese-first writing.
- Developer peer: no visible architecture; Tools contradicts stacks; muted "View all" links.
- Mobile Casey: LinkedIn orphan in hero row; wrong scroll-spy; ~6300px page; 88px portrait; narrow header taps.

## Minor Observations
blur(4px) on name animation; GUSTO alt/row mismatch; sparse photo-less award rows; grey hover thumbnails in dark; heavy light-theme borders; 10.9px tooltips; all-caps wordmark / WK on mobile.

## Questions to Consider
- Why does no part of the homepage show a system?
- Is the dark default an identity choice or drift?
- What if Recognition and Tools were cut so four rich projects and one essay carry the argument?
