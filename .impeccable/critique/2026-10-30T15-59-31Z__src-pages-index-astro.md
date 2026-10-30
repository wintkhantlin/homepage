---
target: landing page
total_score: 17
max_score: 28
na_heuristics: 7,9,10
p0_count: 0
p1_count: 3
timestamp: 2026-10-30T15-59-31Z
slug: src-pages-index-astro
---
Method: dual-agent (A: design review sub-agent · B: detector + browser sub-agent)

## Design Health Score
| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | Active nav works; all projects "Built" so status dots differentiate nothing |
| 2 | Match System / Real World | 2 | "Start a project with me" + play icon on mailto reads freelancer/video; audience is hiring teams |
| 3 | User Control and Freedom | 3 | Marquee pauses only on hover |
| 4 | Consistency and Standards | 2 | Three email CTA labels; lime pill shared by email + case study; pill nav vs icon dock |
| 5 | Error Prevention | 3 | mailto-only contact, no visible address |
| 6 | Recognition Rather Than Recall | 2 | Unlabeled dock icons; 18 unlabeled tech logos |
| 7 | Flexibility and Efficiency | n/a | Portfolio |
| 8 | Aesthetic and Minimalist Design | 2 | Lime overload, candy dock, marquee, identical section openers |
| 9 | Error Recovery | n/a | No error paths |
| 10 | Help and Documentation | n/a | Not needed |
| Total | | 17/28 | Acceptable (61%) |

## Design Specificity Verdict
Specific: project proof rows, Burmese notes, real award photos. Generic: hero formula, glow, highlighter, pill CTA, macOS dock footer, logo marquee; five identical section openers. Brief misses: no staggered name composition, 3 not 4 projects, close is "Let's talk." not "Say hello.".
Detector: CLI 0 findings; in-page 16 elements/21 findings (radial-spotlight-glow hero, dark-glow CTA, low-contrast highlight, kicker-above-heading Recognition, marquee, line-length About ~106ch + PostCard ~90ch, 10px read-time meta, image hover transform). False positive: thin-border-wide-shadow on award-preview popovers.

## Priority Issues
- [P1] Lime treatment breaks brief, four competing primaries, highlighter descenders ~1.4:1. Fix: remove highlight + glow, case study as text link, lime only for focus/selection, hide status dots. /impeccable quieter
- [P1] Brief signature moments missing (staggered name, 4 projects with varied rows, "Say hello." + visible email). /impeccable layout
- [P1] "Read case study" aria-hidden + tabindex=-1 (ProjectsSection.astro:122-130). /impeccable harden
- [P2] Footer dock + tech marquee off-brief, 8 footer choices, WCAG 2.2.2. /impeccable distill
- [P2] Desktop hides award photos behind hover; About sr-only heading, duplicated opener, 106ch lines; 10px meta; misaligned recognition columns. /impeccable layout, /impeccable typeset

## Persona Red Flags
Jordan: freelancer framing, play icon, unlabeled About, dock guessing. Riley: keyboard skips CTAs, unpausable marquee, mailto-only, giant link name in footer. Casey: 45% empty first screen, Story hidden, narrow nav targets (WK 23x44, Work 32x44, pill 55x40, View all notes 20px tall). Hiring manager: no CV/availability/timezone, evidence buried in 14px bullets, level unclear.

## Minor Observations
Lone "2026" in recognition header; "3 projects documented" meta copy; "WK" mobile header; !important footer inversion; GIF mask theme transition; heavier light-theme borders; image hover scale.

## Questions to Consider
- Which technical decision should a hiring manager remember from the first screen?
- Why must desktop visitors hover to see you as a person?
- Hired or clients?
