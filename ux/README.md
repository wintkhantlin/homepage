# UX Study — Wint Khant Lin Portfolio

**Site:** [wintkhantlin.com](https://wintkhantlin.com) (local: `http://localhost:4321`)
**Study date:** 11 November 2026
**Scope:** Experience surface — home, work index, case study, notes index, note, about, 404
**Method:** Source-first review + two independent assessments (design review and detector/browser evidence) + synthesis
**Score:** **25 / 32 (78%) — Good**
**Prior critique:** 20 / 32 (63%) — Acceptable

---

## Executive summary

This is a visually authored, unusually disciplined personal portfolio. The hero, the editorial grid, the full-bleed architecture diagrams, the origin-aware back links, the theme system, and the accessibility fundamentals are stronger than most developer portfolios. The site does not look templated.

The remaining gap is not craft. It is **navigation reliability and substance**:

1. **The header disappears at the moment you use it.** Clicking Work, Notes, or About on the home page jumps to the section and hides the fixed header. The nav is off-screen until the reader scrolls up.
2. **The case studies do not deliver the promise the work index makes.** The home index says “what I learned building them.” All five case studies end at “What it includes” and a next-project link. The project bodies are empty; there is no outcome, reflection, duration, team, or “what I’d do differently.”
3. **The header geometry breaks at tablet widths.** At 1024px the theme toggle collapses to 17×44px, and the wordmark link stretches to 584px (748px at 1440px), so the focus/hit area covers empty space.
4. **Mobile case studies lose the in-page map and put metadata before the story.** “On this page” is hidden below 768px; the technology rail appears before “The challenge”; the pages run 5,145–5,643px.
5. **Burmese articles switch the page to `lang="my"` but leave English UI strings unmarked.** The byline, table of contents, and “Topics” label inherit Burmese; the author aside and “Next note” are correctly marked `lang="en"`.
6. **The About page answers “who” but not “should I hire him now?”** It has the story, facts, tools, and profiles, but no availability, timeline, working style, role target, or résumé link.

The good news: the home sections **do** have exits (“All notes” → `/writing`, “More about me” → `/about`), Burmese cards **do** label their language, the diagram contrast **passes**, and the photo dialog **does** honor reduced motion. Several earlier draft findings were stale or false; they are listed in [What we verified and discarded](#what-we-verified-and-discarded).

The highest-leverage work is therefore small: keep the header visible after anchor jumps, fix the 1024px header, add a mobile case-study jump menu, mark English runs, and add an honest “What I learned” block to each case study. The visual system does not need a redesign.

---

## Heuristic score

| # | Heuristic | Score | Main evidence |
|---|---|---:|---|
| 1 | Visibility of system status | 3 / 4 | Theme, copy, nav, TOC states are clear; header hides after anchors; mobile case studies have no in-page nav. |
| 2 | Match between system and real world | 3 / 4 | Plain language and honest technical vocabulary; work naming drifts; proof appears before the problem. |
| 3 | User control and freedom | 3 / 4 | Skip link, back links, close buttons, theme, reduced motion; header hide and ~0.73s photo close add friction. |
| 4 | Consistency and standards | 3 / 4 | Strong tokens and components; `aria-current` mixes `page`/`location`; 404 hierarchy is inverted. |
| 5 | Error prevention | 3 / 4 | No forms; copy fallback; dialogs; 404 has recovery; no search, but the content is small. |
| 6 | Recognition rather than recall | 3 / 4 | Desktop TOC and section exits are excellent; mobile case studies remove the TOC. |
| 7 | Flexibility and efficiency of use | n/a | No power-user workflow, settings, or search to evaluate. |
| 8 | Aesthetic and minimalist design | 4 / 4 | Restrained, editorial, consistent; motion is authored and reduced-motion aware. |
| 9 | Help users recover from errors | 3 / 4 | 404 and copy recovery work; 404 visual hierarchy is inverted; no search. |
| 10 | Help and documentation | n/a | No in-product help/docs; the notes are content, not help. |
| **Total** | **8 scored heuristics** | **25 / 32** | **78% — Good** |

Independent Assessment A scored **26 / 32**; the synthesis scored **25 / 32** after reducing heuristic 6 for the missing mobile case-study TOC. Both land in the **Good** band. The prior critique scored 20 / 32.

See [04-heuristic-evaluation.md](04-heuristic-evaluation.md) for the full rationale, cognitive-load checklist, strengths, and design-specificity verdict.

---

## Top findings

| ID | Severity | Finding | Surface | Fix |
|---|---|---|---|---|
| **F1** | **P1** | Header hides immediately after an in-page anchor jump; the nav is off-screen until the reader scrolls up. | Home | Suppress scroll-hide for ~1s after anchor activation, or keep the header visible while the target section is in view. |
| **F2** | **P1** | Case studies stop before the point: proof before problem, no outcome/reflection, despite the index promising “what I learned.” | Work / case study | Reorder challenge → approach → evidence; add an honest “What I learned / What changed” block to all five. |
| **F3** | **P2** | Header geometry breaks at 1024–1099px: theme toggle 17×44px at 1024; wordmark hit/focus area 584px at 1024 and 748px at 1440. | Global header | `w-fit`/`justify-self-start` on the wordmark; `shrink-0` + `min-w-11` on the toggle; relax the 64/36 grid below 1280. |
| **F4** | **P2** | Mobile case studies hide “On this page” and place the technology rail before “The challenge”; pages run 5,145–5,643px. | Case study | Add a mobile `<details>` jump menu; move/collapse the technology rail after the challenge. |
| **F5** | **P2** | Burmese article UI and English runs are not marked `lang="en"`; byline, TOC, and “Topics” inherit Burmese. | Burmese notes | Mark the byline, TOC labels, Topics, and English headings/terms; keep the author aside pattern. |
| **F6** | **P2** | About answers “who” but not “should I hire him now?”; no availability, timeline, working style, role target, or résumé. | About | Add a short “Currently” block, timeline, working style, role target, and résumé link if available. |
| **F7** | P3 | 404 visual hierarchy is inverted: 72px `<p>404</p>` above a 20px `<h1>`. | 404 | Make the h1 the visual anchor or reduce the 404 number. |
| **F8** | P3 | Article line length reaches 77 characters at 1440px. | Notes | Cap the body at ~66–70ch (or reduce the desktop size slightly). |
| **F9** | P3 | `aria-current` mixes `page` and `location` on `/projects` and `/about`; the footer says `page`. | Global header | Run the scroll-spy only on the home page, or do not override `page` on interior pages. |
| **F10** | P3 | Programmatic section focus paints a 1,216×1,593px focus ring. | Home | Exclude `[tabindex="-1"]` from the `:focus-visible` outline, or focus a styled target. |
| **F11** | P3 | Detector warning: `<img>` without `src` in the photo viewer. | Home | Use a `<template>` or a placeholder `src`; invalid markup, not currently user-visible. |
| **F12** | P3 | “Enlarge diagram” button hit area spans the row (1,228×44px at desktop). | Case study | `w-fit`/`justify-self-start`. |
| **F13** | P3 | RSS feed exists at `/rss.xml` but is not linked. | Global | Add an RSS link in the footer or notes index. |
| **F14** | P3 | Architecture diagram has a generic `role="img"` label; the architecture list is the de facto alternative. | Case study | Add `aria-describedby` to the architecture list or a short text summary. |

Full evidence, impact, and acceptance criteria: [05-findings.md](05-findings.md).

---

## What works

- **The hero is authored.** The name swell, the 64/36 grid, the email pill, the quiet “See the work” link, and the reduced-motion fallback form a distinctive first screen.
- **The editorial system is coherent.** One accent, two typefaces, hairline rules, generous whitespace, restrained motion, and a complete light/dark theme.
- **The case-study reading machine is strong.** Sticky rail, full-bleed diagram, origin-aware back link, next case study, and a keyboard-scrollable diagram frame.
- **Accessibility fundamentals are real.** Skip link, landmarks, one h1 per route, visible focus, 44px targets (except the toggle), alt text, native dialogs, focus return, reduced motion, and no horizontal overflow at 320/390/1440.
- **The home sections are not dead ends.** “All notes” → `/writing` and “More about me” → `/about` are present and visible at 390 and 1440. Burmese cards label “Burmese · X min read” and set `lang="my"` on titles/excerpts.
- **The footer is a consistent close.** “Say hello.” plus contact links appears on every page, including the compact footer on About and Notes.

---

## What we verified and discarded

These were claimed in an earlier draft or in one of the raw assessments and are **not** findings:

| Claim | Verified reality |
|---|---|
| Home Notes has no way to reach `/writing`. | False. `WritingSection.astro` has an unconditional **“All notes”** link; visible at 390 and 1440. |
| Home About has no way to reach `/about`. | False. `AboutSection.astro` renders **“More about me”** when `brief` is set; home passes `brief`. |
| Post cards do not say a note is Burmese. | False. `PostCard.astro` and `WritingSection.astro` render **“Burmese · X min read”** / **“In Burmese, …”** and set `lang="my"` on Burmese titles/excerpts. |
| The architecture diagram has dark-on-dark labels. | False. SVG text uses `fill` (light), not `color`; the real shape fills measure **18.49:1 dark / 16.97:1 light**. |
| The photo dialog still takes ~750ms under reduced motion. | False. The shared spring library honors `prefers-reduced-motion`; measured close is **~0.3ms** under reduce, **~734ms** normally. |
| About duplicates the home section. | False. Home shows the first paragraph, facts, and “More about me”; About shows the full story, tools, and profiles. |
| The “Enlarge diagram” button is hidden on mobile. | False. The script removes `hidden` and adds `inline-flex`; measured **157×44** at 320. The dialog fits the viewport; the 1,024px SVG inside is scrollable. |
| Nothing on the site asks for contact. | False. The footer has **“Say hello.”** and contact links on every page. |
| The 320px theme toggle is 23px wide. | False. Measured **41×44** at 320. The real defect is **17×44 at 1024**. |
| The RecognitionSection missing `src` is user-visible. | False. The image lives in a closed dialog and receives `src` via JS. Invalid markup; P3 hygiene. |

The raw assessments are preserved in `ux/evidence/` for traceability. The synthesized documents in this folder are the source of truth.

---

## Read this next

| If you want to… | Read |
|---|---|
| Understand scope, method, evidence, and limitations | [01-scope-and-method.md](01-scope-and-method.md) |
| See who the site is for and what they are trying to do | [02-users-and-jobs.md](02-users-and-jobs.md) |
| Follow the journeys and the information architecture | [03-journeys-and-ia.md](03-journeys-and-ia.md) |
| See the heuristic score, cognitive load, and design verdict | [04-heuristic-evaluation.md](04-heuristic-evaluation.md) |
| Get the prioritized findings with evidence and fixes | [05-findings.md](05-findings.md) |
| Review accessibility and responsive behavior | [06-accessibility-and-responsive.md](06-accessibility-and-responsive.md) |
| Review content, language, and SEO | [07-content-and-seo.md](07-content-and-seo.md) |
| Plan the work | [08-recommendations.md](08-recommendations.md) |
| Inspect screenshots, raw data, and assessments | [evidence/README.md](evidence/README.md) |

---

## Ten actions, in order

1. Keep the header visible after in-page navigation (F1).
2. Fix the 1024px header and the wordmark hit area (F3).
3. Run the scroll-spy only on the home page (F9).
4. Exclude programmatic section targets from the focus-ring selector (F10).
5. Mark English UI strings in Burmese articles (F5).
6. Add a mobile case-study jump menu and reorder the rail (F4).
7. Add an honest “What I learned / What changed” block to all five case studies (F2).
8. Add a “Currently” block, timeline, role target, and résumé link to About (F6).
9. Fix the 404 hierarchy and the article measure (F7, F8).
10. Clean up the P3 backlog: detector markup, enlarge hit area, RSS link, diagram description, “Winner Nominee,” meta lengths, OG images.

---

## Caveats

- This is a **heuristic and browser-evidence study**, not moderated usability testing with real users. Personas are hypotheses to validate.
- Measurements are a snapshot of the current working tree on 11 November 2026. The site was edited concurrently by another process during the study; the study itself did not modify site code. The numbers reflect the post-edit state.
- The dev server was already running at `http://localhost:4321` and was left running.
- Browser coverage is Chrome via Playwright. No Safari/Firefox or manual screen-reader pass was performed.
- The content analysis respects the product brief: **do not invent outcomes, metrics, or client proof.** The recommendation is to add honest reflection, not fabricated impact numbers.
