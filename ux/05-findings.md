# 05 — Findings

**Severity scale**

- **P0** — blocks a core task or makes content inaccessible to a group.
- **P1** — seriously undermines a core task for a meaningful group; fix before the next release.
- **P2** — causes friction, confusion, or a WCAG AA failure; schedule.
- **P3** — polish, consistency, content opportunity, or hygiene; backlog.

**No P0 findings.** The site is usable. The P1s are about reliability and the site's central promise, not about broken pages.

---

## Summary

| ID | Severity | Finding | Surface | Fix size |
|---|---|---|---|---|
| **F1** | **P1** | Header hides after an in-page anchor jump | Home | Small |
| **F2** | **P1** | Case studies stop before the point; proof before problem; no outcome/reflection | Work / case study | Medium (writing) |
| **F3** | **P2** | Header geometry breaks at 1024–1099; wordmark hit area spans the column | Global header | Small |
| **F4** | **P2** | Mobile case studies hide the TOC and put the technology rail before the challenge | Case study | Small–medium |
| **F5** | **P2** | Burmese article UI and English runs are not marked `lang="en"` | Burmese notes | Small |
| **F6** | **P2** | About answers “who” but not “should I hire him now?” | About | Small–medium (writing) |
| **F7** | P3 | 404 visual hierarchy is inverted | 404 | Small |
| **F8** | P3 | Article line length reaches 77 characters | Notes | Small |
| **F9** | P3 | `aria-current` mixes `page` and `location` | Global header | Small |
| **F10** | P3 | Programmatic section focus paints a giant focus ring | Home | Small |
| **F11** | P3 | `<img>` without `src` in the photo viewer (detector) | Home | Small |
| **F12** | P3 | “Enlarge diagram” hit area spans the row | Case study | Small |
| **F13** | P3 | RSS feed exists but is not linked | Global | Small |
| **F14** | P3 | Diagram has only a generic text alternative | Case study | Small |
| **F15** | P3 | “Winner Nominee” is ambiguous | Home | Content |
| **F16** | P3 | Hero alias wraps to its own line at 320–360 | Home | Small |
| **F17** | P3 | Light-theme faint text is 4.63:1 (passes, borderline) | Global | Small |
| **F18** | P3 | Two meta descriptions exceed ~160 characters | SEO | Small |
| **F19** | P3 | Index/post pages use the default OG image | SEO | Small |
| **F20** | P3 | English technical writing is thin (2 of 3 notes are Burmese; one is a 2025 goals post) | Notes | Content |
| **F21** | P3 | Photo dialog close is ~0.73s normally (honors reduced motion) | Home | Small |
| **F22** | P3 | Dark default vs off-white brief is an unreconciled design-intent question | Global | Decision |
| **F23** | P3 | Proof points and “What it includes” overlap | Case study | Small |
| **F24** | P3 | Hero’s evaluation path is the quietest action | Home | Small |
| **F25** | P3 | Reduced-motion anchor fallback does not move focus to the target | Home | Small |
| **F26** | P3 | Home is 5.3k desktop / 6.4k mobile; no work peek at 1440×900 | Home | Decision |
| **F27** | P3 | `Topics` uses `aria-label` on a generic `div` | Burmese notes | Small |
| **F28** | P3 | Technical hygiene: `view-transition-name` without a client router; unused `project.data.color` | Code | Small |

The P3 items are grouped at the end. The first six are detailed.

---

## F1 — Header hides after an in-page anchor jump (P1)

**Surface:** Home, all in-page header links.

**Evidence**

- At 1440×900, scroll to 500, activate **Work** in the header.
- The page springs to `scrollY 924`.
- The fixed header is at `top: -72px` with `data-hidden`; the nav is at `-58px`.
- The header stays hidden. Only an upward scroll of roughly 100px restores it.

**Why it happens**

`HomeMotion.astro` intercepts the anchor click, prevents the default, scrolls with a spring, and pushes the hash with `history.pushState()`. `Header.astro` independently hides the bar whenever the reader scrolls down more than 4px past twice the header height. The anchor jump is a large downward scroll, so the header treats it as “reading down” and hides. `pushState()` does not fire `hashchange`, so the header has no signal that this scroll was navigation rather than reading.

**Impact**

The reader uses the navigation and immediately loses it. On a long home page, the next section change requires scrolling up first. Keyboard and screen-reader users also lose the visual anchor; the header is the only persistent wayfinding element on the home page.

**Fix**

- Suppress the scroll-hide for ~1s after an in-page activation, or until the target section leaves the viewport.
- Options:
  - In `HomeMotion`, dispatch a custom event (e.g. `portfolio:anchor-nav`) after the scroll settles; `Header` removes `data-hidden` and resets `lastY`.
  - In `Header`, listen for `click` on `a[href^="#"]` and set a `suppressHideUntil` timestamp; skip the hide branch while suppressed.
  - In `Header`, listen for `hashchange` and clear `data-hidden`; note that `pushState` will not fire it, so pair this with the custom event or a click listener.
- Keep the existing “hide while reading down, show on scroll up” behavior for normal scrolling.

**Acceptance criteria**

- At 1440 and 390, scroll to 500, activate Work: the page reaches `#projects` and the header remains visible (`top: 0`, no `data-hidden`) for at least 1s after the scroll settles.
- The header still hides after a normal downward scroll past 2× its height.
- Scrolling up still restores it immediately.
- No horizontal overflow at 320/390/1024/1440.

**Files:** `src/components/home/HomeMotion.astro`, `src/components/Header.astro`.

---

## F2 — Case studies stop before the point (P1)

**Surface:** Home work index, `/projects`, `/project/[slug]`, all five project frontmatters.

**Evidence**

- The home index description says: “The products, the systems behind them, and **what I learned building them**.”
- All five case-study bodies are **0 words**. The pages render `proofPoints`, then `CaseStudy` sections: challenge, approach, architecture, structure, includes, next project.
- There is no outcome, reflection, duration, team, “what changed,” or “what I’d do differently.”
- “Engineering highlights” renders **before** “The challenge.” At 390, the challenge is at y≈1681; the reader sees the stack and proof first.
- The project facts list role, type, year, context, and stage — but not duration or team.
- The index rows are strong teasers; the case study is where the argument should land.

**Impact**

This is the site’s central promise. A hiring manager can see that the systems are real, but cannot see what the candidate learned, what he would change, or what the work achieved. A peer can learn from the architecture but not from the judgment. The page ends at “What it includes,” which is inventory, not reflection.

**Fix**

1. **Reorder the narrative:** challenge → approach → architecture → evidence/highlights → includes. The proof points should support the problem, not precede it.
2. **Add an honest reflection block to all five projects.** Use only facts that are true and supported by the repo or the author’s memory. Suggested prompts:
   - What was the hardest constraint?
   - What tradeoff did you make, and what did you give up?
   - What changed between the first design and the shipped version?
   - What would you do differently now?
   - What did you learn that you would carry to the next system?
3. **Add duration/team only if true.** “Solo, 6 weeks” is more useful than a vague role. If unknown, leave it out.
4. **Add a demo link where one exists.** The GitHub link is good; a live URL or a short screen recording is stronger for a hiring manager.
5. **Consolidate the proof points and “What it includes.”** They overlap; one should be the teaser, the other the detail.

**Guardrail**

Do not invent metrics, client names, or outcomes. “What I learned” and “what I’d change” are honest even without numbers. The product brief explicitly says not to fabricate client proof.

**Acceptance criteria**

- Every project page has a challenge before any proof/highlight block.
- Every project page has a “What I learned” or “What I’d do differently” section with at least 3–5 sentences of specific reflection.
- No invented metrics or client claims.
- The home index promise is either delivered or reworded to match what the pages actually contain.
- The mobile order is challenge → approach → evidence.

**Files:** `src/pages/project/[slug].astro`, `src/components/project/CaseStudy.astro`, `src/components/home/WorkIndex.astro`, `src/content/projects/*.md`.

---

## F3 — Header geometry breaks at 1024–1099 (P2)

**Surface:** Global header at tablet widths.

**Evidence**

| Width | Wordmark link | Theme toggle | Nav |
|---|---:|---:|---|
| 320 | 91×44 | 41×44 | 173px |
| 390 | 93×44 | 44×44 | — |
| 1024 | **584×44** | **17×44** | 328px |
| 1080 | ~616×44 | **37×44** | — |
| 1100+ | — | 44×44 | — |
| 1440 | **748×44** | 44×44 | 420px |

- The header switches to a `64fr / 36fr` grid at 1024. The nav needs ~368px; the column gives it 328px. The theme toggle is the only shrinkable flex item, so it collapses to 17px.
- The wordmark `<a>` is a grid item, so it stretches to the full first column. At 1440 the focus/hit area is 748px wide for a ~91px wordmark; at 1024 it is 584px.
- No horizontal overflow occurs; the layout is technically intact but the controls are not.

**Impact**

- The theme toggle is 17px wide at a common tablet width — below the 24px WCAG 2.5.8 minimum unless the spacing exception applies, and far below the 44px design target.
- The wordmark’s focus ring and click target cover a large empty area; keyboard users tab to what looks like the whole header, and a click far from the logo still navigates home.

**Fix**

- Wordmark: `justify-self-start` / `w-fit` (or `inline-flex` with `width: fit-content`) so the link hugs the text while the grid column stays.
- Toggle: `shrink-0` and `min-w-11` (44px). It must not be the flex item that absorbs pressure.
- At 1024–1279, either:
  - reduce the nav gap and hide the “Say hello” link (the email is in the hero and footer), or
  - switch the header grid to `minmax(0, 1fr) auto` so the nav gets its content width; restore the 64/36 split at 1280+.
- Verify 320, 390, 768, 1024, 1080, 1100, 1280, 1440.

**Acceptance criteria**

- Wordmark focus/hit area ≤ text width + 8px at all widths.
- Theme toggle ≥ 44×44 at 320–1440.
- No horizontal overflow at any width.
- The header still aligns with the hero at 1280+ (or the deviation is deliberate and documented).

**Files:** `src/components/Header.astro`.

---

## F4 — Mobile case studies lose the map and lead with metadata (P2)

**Surface:** `/project/[slug]` below 768px.

**Evidence**

- “On this page” is `hidden md:block`; it is absent at 390.
- At 390, the technology rail starts at y≈1348 and “The challenge” at y≈1681 — a 253px metadata block before the story.
- The two sampled case studies run **5,145–5,643px** on mobile.
- The architecture diagram is 704px wide inside a 348px scroller; the “Enlarge” button is visible (157×44), the dialog fits, and the 1,024px SVG pans inside it. This part works.
- The rail is sticky on desktop and becomes a block on mobile. The technology list is useful, but it is not the first thing a reader needs.

**Impact**

A reader on a phone scrolls through the stack before learning the problem. Without the TOC, there is no way to jump to the approach or the architecture on a 5.6k page. The diagram is usable, but the narrative is not navigable.

**Fix**

- Add a mobile `<details>` “On this page” jump menu above the challenge (or a compact sticky “Jump to” control).
- Move the technology rail **after** “The challenge” (or after “The approach”) below 768, or collapse it into a `<details>` “Technology” block.
- Keep the desktop rail as is.
- Keep the diagram’s horizontal scroll and enlarge button; they are working.

**Acceptance criteria**

- At 390, a reader can jump to challenge, approach, architecture, structure, and includes without scrolling the whole page.
- The challenge appears before the technology list on mobile.
- The desktop rail is unchanged.
- The diagram remains scrollable and the dialog remains usable.

**Files:** `src/components/project/ProjectRail.astro`, `src/components/project/CaseStudy.astro`, `src/pages/project/[slug].astro`.

---

## F5 — Burmese UI and English runs are not marked (P2)

**Surface:** `/post/[slug]` for Burmese notes.

**Evidence**

- Burmese posts render `<html lang="my">`.
- The byline “Posted on” and the date inherit `my`.
- The TOC labels “On this page,” “3 sections,” and “Table of contents” inherit `my`.
- The “Topics” `aria-label` inherits `my`.
- English inline runs in the body inherit `my`.
- The author aside is correctly `lang="en"`.
- The “Next note” label is correctly `lang="en"`.
- The header and footer are correctly `lang="en"`.
- Post cards label “Burmese · X min read” and set `lang="my"` on titles/excerpts — this is good and should be kept.

**Impact**

Screen readers will pronounce English UI strings with a Burmese voice. This is a WCAG 3.1.2 (Language of Parts) failure. For sighted readers, the mismatch is subtle; for assistive technology, it is a real comprehension cost.

**Fix**

- Add `lang="en"` to the byline paragraph, the TOC summary/nav labels, and the Topics wrapper.
- Mark English headings and inline terms in the body with `lang="en"` where practical. A remark plugin that detects Latin-script runs is possible, but manual marking of headings/terms is enough for the current three posts.
- Keep the existing author-aside and next-note patterns.

**Acceptance criteria**

- `document.querySelector('html').lang === 'my'` on Burmese posts.
- The byline, TOC labels, and Topics are `lang="en"` (or their nearest ancestor is).
- The author aside and next-note label remain `lang="en"`.
- A screen-reader spot check reads the English chrome in an English voice.

**Files:** `src/pages/post/[slug].astro`, `src/components/TableOfContents.astro`.

---

## F6 — About answers “who,” not “should I hire him now?” (P2)

**Surface:** `/about`.

**Evidence**

- The page has two story paragraphs, five facts (role, focus, location, languages, elsewhere), five tool groups, and two profiles.
- The home section is a teaser: first paragraph, facts, “More about me.” The About page is not a duplicate.
- There is no availability, timeline/education, working style, role target, or résumé link.
- The footer says “Say hello.” on every page, so contact exists; the missing piece is the decision.

**Impact**

A hiring manager finishes the page knowing what he does and how he thinks, but not whether he is available, what role he wants, or what to send him. The page is a profile, not a hiring argument. This is a conversion leak at the exact moment of decision.

**Fix**

- Add a short **“Currently”** block: availability, role target (e.g. backend internship/new-grad, remote/hybrid), location, and the best way to reach him.
- Add a **timeline** (education, roles, notable milestones) if true.
- Add a **working style** paragraph: how he collaborates, what he owns, how he communicates.
- Add a **résumé** link if one exists. If not, say what to ask for.
- Keep the footer CTA and the existing story/tools/profiles.
- Do not invent titles, dates, or availability.

**Acceptance criteria**

- A reader can answer “Is he available?”, “For what role?”, and “What do I do next?” from the About page alone.
- The page still reads as a person, not a CV dump.
- The résumé link (if added) is visible and works.

**Files:** `src/pages/about.astro`, `src/components/home/AboutSection.astro` (if the “Currently” block is shared).

---

## P3 findings

### F7 — 404 visual hierarchy is inverted

`src/pages/404.astro` renders a 72px `<p>404</p>` above a 20px `<h1>This page doesn’t exist</h1>`. The semantic heading is correct, but the eye lands on the error code first and the message second. Make the h1 the visual anchor (48–72px) and treat “404” as a small eyebrow, or keep the large 404 but reduce the h1’s visual subordination. The three recovery links are good.

### F8 — Article line length reaches 77 characters

At 1440, the article body is 736px at 20px/34px, about 77 characters. The recommended range is 45–75. Cap the body at ~66–70ch (or reduce the desktop size slightly). The TOC in the right margin at 1280+ is unaffected.

### F9 — `aria-current` mixes `page` and `location`

The header server-renders `page`; the scroll-spy overrides it with `location` on `/projects` and `/about` because those pages contain `#projects`/`#about`. `/writing`, `/project/*`, and `/post/*` stay `page`; the footer always says `page`. Run `trackActiveSection()` only on `/` (or do not override `page` on interior pages).

### F10 — Programmatic section focus paints a giant ring

`HomeMotion` focuses the target section after an anchor jump. The global `:where(a, button, summary, [tabindex]):focus-visible` rule outlines the whole section — measured 1,216×1,593px. Exclude `[tabindex="-1"]` from the outline, or add a `.focus-target` class with no outline. Keep the focus move for screen readers.

### F11 — `<img>` without `src` in the photo viewer

Detector: `broken-image` at `src/components/home/RecognitionSection.astro:128`. The image is inside a closed `<dialog>` and receives `src` via JS, so it is not currently user-visible. Use a `<template>` or a transparent placeholder `src` to make the markup valid.

### F12 — “Enlarge diagram” hit area spans the row

At desktop the button is 1,228×44px because it sits in a 12-column grid. Use `w-fit`/`justify-self-start`. The mobile 157×44 is fine.

### F13 — RSS is not linked

`/rss.xml` exists and is valid, but there is no visible link. Add an RSS link in the footer or the notes index. This is a small win for peers and feed readers.

### F14 — Diagram alternative is generic

The architecture diagram has `role="img"` and a generic label; the adjacent architecture list is the de facto alternative. Add `aria-describedby` pointing to the list, or a short summary that names the services and the flow. The visual contrast passes (18.49:1 dark / 16.97:1 light).

### F15 — “Winner Nominee” is ambiguous

One recognition row says “Winner Nominee.” Use “Nominee,” “Finalist,” or add context (“Top 5 finalist”). The other rows (“Winner,” “First runner-up”) are clear.

### F16 — Hero alias wraps at 320–360

The “also known as Happer” alias drops to its own line and the name box grows from 143px to 165px at 320. It is legible but slightly awkward. Either let it sit on its own line by design or reduce the alias size at the smallest breakpoint.

### F17 — Light-theme faint text is 4.63:1

`--text-faint` on the light canvas measures 4.63:1 — passes AA for normal text, but it is used for 12–14px metadata and sits close to the threshold. Nudge it to ≥5:1. The dark theme is comfortable; the focus ring is 11.2:1 dark / 5.1:1 light; the diagram passes.

### F18 — Two meta descriptions exceed ~160 characters

- `/post/idempotency-keys-what-most-tutorials-dont-tell-you`: 174 chars.
- `/about`: 166 chars.
- The rest are 138–144. Shorten the two; search engines may truncate.

### F19 — Index/post pages use the default OG image

`/projects`, `/writing`, and the notes use `og-default.png`; the home, About, and project pages have specific images. Add a notes/projects OG image if social sharing matters. This is an opportunity, not a defect.

### F20 — English technical writing is thin

Two of three notes are Burmese; the only English note is a 2025 goals post. The site says “in English and Burmese.” Add one English technical note (adapt the idempotency or Big O piece) or update the goals post. This matters for the peer audience.

### F21 — Photo close is ~0.73s normally

The spring close takes ~734ms; under reduced motion it is ~0.3ms. This is a deliberate, polished animation, not a failure. If perceived responsiveness matters, cap it at ~250ms. Do not remove the reduced-motion path.

### F22 — Dark default vs off-white brief

The surface brief calls for an off-white canvas; the shipped default is dark. The light theme is complete and passes contrast. Decide which is canonical and update the brief or the default. This is a design-intent question, not a bug.

### F23 — Proof points and “What it includes” overlap

The two proof points (“asynchronous processing,” “real-time communication”) and the four “What it includes” highlights cover similar ground. Consolidate: use the proof points as the index teaser and the includes as the detailed evidence, or merge them.

### F24 — Hero’s evaluation path is the quietest action

The hero offers email, copy, GitHub, and “See the work.” Email is the most prominent; the evaluation path is a quiet text link. If the primary job is evaluation, promote “See the work” or make the email secondary. This is a judgment call, not a defect.

### F25 — Reduced-motion anchor fallback does not move focus

`HomeMotion` focuses the target section for normal motion but returns early under reduced motion, leaving focus on the nav link. The native anchor scrolls; the screen reader may not announce the new section. Move the focus logic before the reduced-motion early return (with `preventScroll: true`).

### F26 — Home length and first-screen peek

The home is ~5.3k desktop / ~6.4k mobile. At 1440×900 the hero fills the first screen exactly; the work heading begins at 900, so there is no visual peek. The “See the work” link carries the transition. This is deliberate; if the bounce is high, add a small peek or a stronger scroll cue.

### F27 — `Topics` uses `aria-label` on a generic `div`

`aria-label` on a generic `div` is not reliably exposed. Use a `<ul>` with `role="list"` or a labelled `<nav>`; keep `lang="en"` on the wrapper.

### F28 — Technical hygiene

- `view-transition-name` is set on the project name but the site does not use a client router, so the name never travels. Remove it or document the intent.
- `project.data.color` appears unused. Remove it or use it.
- These are code hygiene, not UX findings; they are listed so the next cleanup pass can close them.

---

## What we verified and discarded

Do not report these as findings:

| Claim | Reality |
|---|---|
| Home Notes is a dead end | “All notes” → `/writing` is present and visible |
| Home About is a dead end | “More about me” → `/about` is present and visible |
| Post cards don’t label Burmese | They render “Burmese · X min read” and set `lang="my"` |
| Diagram labels are dark-on-dark | SVG text uses `fill` (light); shape fills are 18.49:1 dark / 16.97:1 light |
| Photo dialog ignores reduced motion | It honors reduce (~0.3ms close); normal close is ~734ms |
| About duplicates home | Home is a teaser; About is the full story/tools/profiles |
| Enlarge button is hidden on mobile | It is visible (157×44); the dialog fits; the SVG pans |
| No closing contact | Footer “Say hello.” + contact is on every page |
| 320px toggle is 23px | It is 41×44; the real defect is 17×44 at 1024 |
| Missing `src` is user-visible | It is inside a closed dialog; invalid markup, P3 |

---

## Open questions

1. **Which theme is canonical?** Dark default vs off-white brief.
2. **What outcome data exists?** If none, “what I learned / what changed” is the honest substitute.
3. **Does a résumé exist?** If not, the About recommendation is availability/role target only.
4. **Will there be more English technical notes?** The peer audience needs them.
5. **Do any projects have live demos?** A demo link is stronger than a GitHub link for a hiring manager.
6. **Is mobile case-study reading a real behavior?** If yes, F4 is urgent; if not, it is still a WCAG/recognition issue.

---

## Quick wins (code)

1. Header: suppress hide after anchor; `w-fit` wordmark; `shrink-0` + `min-w-11` toggle; relax 64/36 below 1280.
2. Scroll-spy: home-only guard.
3. Focus ring: exclude `[tabindex="-1"]`.
4. Language: `lang="en"` on byline, TOC labels, Topics.
5. 404: make the h1 the visual anchor.
6. Article: cap at ~66–70ch.
7. Enlarge button: `w-fit`.
8. Photo viewer: placeholder `src` or `<template>`.
9. Meta: shorten the two long descriptions.
10. RSS: add a footer link.

## Content decisions (not code)

1. Case-study reflection for all five projects (F2).
2. About “Currently”/timeline/role target/résumé (F6).
3. One English technical note (F20).
4. “Winner Nominee” wording (F15).
5. Theme intent (F22).
