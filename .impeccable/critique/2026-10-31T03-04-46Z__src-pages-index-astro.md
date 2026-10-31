---
target: landing page text placement and density
total_score: 22
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 2
timestamp: 2026-10-31T03-04-46Z
slug: src-pages-index-astro
---
# Critique: homepage text placement and density

Method: dual-agent (A: design review · B: detector + browser)

## Design Health Score (Nielsen, 2 n/a)
| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | |
| 2 | Match System / Real World | 3 | |
| 3 | User Control and Freedom | 3 | |
| 4 | Consistency and Standards | 2 | Four section-header patterns; SectionHeader.astro unused |
| 5 | Error Prevention | 3 | mailto only, no forms |
| 6 | Recognition Rather Than Recall | 2 | Project screenshots hover-only below 1280px |
| 7 | Flexibility and Efficiency | n/a | Static content, no power-user tasks |
| 8 | Aesthetic and Minimalist Design | 3 | About volume dilutes it |
| 9 | Error Recovery | 3 | Empty states clear but generic |
| 10 | Help and Documentation | n/a | No docs surface on a portfolio home |
| **Total** | | **22/32** | **Acceptable (69%)** |

## Design Specificity
Partly authored. Hero stagger, photo placement, bilingual detail and award photography are specific. The section system below the hero is template-grade.

## Priority Issues
- P1: Project screenshots hidden below 1280px and on touch (ProjectsSection.astro:181, 213-238). Command: layout.
- P1: Resting project rows are tonally flat (ProjectsSection.astro:148-151, 240-261). Command: typeset.
- P2: About is 130 words plus an 18-tool table (AboutSection.astro:61-108). Command: distill.
- P2: No "Say hello." close; brief requires one. Command: clarify.
- P2: Four section-header systems; award result is smallest type (RecognitionSection.astro:90-91). Command: layout.

## Detector
Clean: detect.mjs returned no findings across src/pages, src/components/home, src/layouts.

## Measured text (browser, 1440 and 390)
Hero lead ~60 chars/line; section intro ~72. No horizontal overflow at 390.
About column capped at 65ch in source (AboutSection.astro:61), so the ~87-char estimate from the browser pass is treated as a measurement artifact.
Mobile project badges wrap to ~9 chars per line.

## Trend
First run for this target, no trend yet.
