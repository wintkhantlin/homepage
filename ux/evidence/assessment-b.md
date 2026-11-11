# Assessment B — Detector + Browser Evidence

Independent pass. I did not read `ux/evidence/assessment-a.md` or any other design review, did not edit site code, and left the Astro dev server running.

- **Date / time:** 2026-11-11, 21:26–21:35 (+0630). The working tree was edited concurrently by another agent until 21:17:39; every number below is from the post-edit re-run.
- **Build:** Astro dev server at `http://localhost:4321` (HTTP 200 throughout).
- **Browser:** Playwright `playwright-core` with Chrome channel.
- **Coverage:** 9 routes × 3 viewports (1440×900, 390×844, 320×844) = 27 page loads, plus focused probes for dialogs, theme transitions, header behaviour, anchors, contrast, and reduced motion.
- **Raw data:** `ux/evidence/assessment-b.json` (route sweep + interactions), `assessment-b-focused.json` (focused probes), `b-probe2.json` … `b-probe7.json` / `.mjs` (targeted follow-ups).

Routes: `/`, `/projects`, `/project/gencourse`, `/project/url2short`, `/writing`, `/post/idempotency-keys-what-most-tutorials-dont-tell-you`, `/post/what-is-big-o-notation-my`, `/about`, `/404`.

---

## 1. Detector

### Command

```sh
node /Users/happer/.agents/skills/impeccable/scripts/detect.mjs --json src/pages src/components src/layouts
```

### Result

| Metric | Value |
|---|---|
| Exit code | **2** (`process.exit(primary.length > 0 ? 2 : 0)`) |
| Findings | **1** |
| Errors | 0 |
| Warnings | 1 |
| Info / advisory | 0 |

### Findings table

| # | Antipattern | Severity | Category | Location | Snippet |
|---|---|---|---|---|---|
| 1 | `broken-image` | warning | quality | `src/components/home/RecognitionSection.astro:128` | `<img class="photo-viewer-img" width={largePhotos[0].width} height={largePhotos[0].height} alt={large...` |

### Verification and classification

**Classification: code hygiene / invalid markup — not a user-visible defect today.** Verified in the live DOM and in source:

| Check | Observed |
|---|---|
| `src` attribute in markup | absent (`hasSrcAttr: false`) |
| Dialog state | closed (`open: false`), computed `display: none` |
| Rendered box | 0×0, `offsetParent: null`, `checkVisibility() === false` |
| `complete` / `naturalWidth` | `true` / `0` |
| `src` assignment | set in the viewer's `show()` path (`RecognitionSection.astro:212` and `:219`) before `viewer.showModal()` |
| No-JS fallback | each trigger is `<a href={largePhotos[i].src}>` (full-size `w=1400` WebP), so the photo still opens without JavaScript; documented by the comment at line 124 |
| Broken-image icon visible to users | none (`brokenVisible: []` on every route) |

Why it is still worth fixing:

- `<img>` without `src` is invalid HTML; the detector will stay red on every run and can mask a future real finding.
- If the dialog's `display:none` rule, the JS boot path, or this markup is reused, the missing source becomes a visible broken-image box.
- Fix: give the element a real initial `src` (e.g. the first thumbnail) or move it into a `<template>` and keep the existing JS swap.

---

## 2. Browser evidence

### 2.1 Accessibility

**Landmarks and headings**

| Route | header | nav (labelled) | main | footer | aside | h1 count | Heading order |
|---|---|---|---|---|---|---|---|
| `/` | 1 | 2 | 1 | 1 | 1 | 1 | h1 → h2 → h3 (no skips) |
| `/projects` | 1 | 2 | 1 | 1 | 0 | 1 | h1 → h2 |
| `/project/*` | 1 | 2 | 1 | 1 | 0 | 1 | h1 → h2 → h3 → h2 |
| `/writing` | 1 | 2 | 1 | 1 | 0 | 1 | h1 → h2 |
| `/post/*` | 1 | 2 | 1 | 1 | 1 | 1 | h1 → h2 → h2 |
| `/about` | 1 | 2 | 1 | 1 | 0 | 1 | h1 → h2 |
| `/404` | 1 | 2 | 1 | 1 | 0 | 1 | h1 → h2 |

Both navs have accessible names ("Primary navigation", "Footer navigation"). No duplicate IDs on any route (9/9 checked; `duplicateIds: []`).

**Skip link** — first Tab stop, 172×45 at (12, 12), visible on focus. Enter moves focus to `main#main-content`, sets `#main-content`, target top 0. It is not hidden behind the fixed header.

**Contrast** — exhaustive walk of visible text nodes (font-size/weight-aware thresholds): **0 failures** on 6 routes × 2 themes (`/`, `/projects`, `/writing`, `/about`, `/project/gencourse`, `/post/what-is-big-o-notation-my`). Representative light-theme ratios: wordmark 16.97:1, nav 7.41:1, hero alias / index meta / recognition date 4.63:1 (threshold 4.5:1), footer 16.97:1.

Project architecture diagram, measured from the **real shape fills** rather than the SVG canvas background: **18.49:1 dark**, **16.97:1 light** for every node and edge label. (The naive check that samples the SVG background is the false positive — see §4.)

**Focus visibility** — every focusable sampled (skip link, wordmark, 3 nav links, Say hello, theme toggle, hero email, copy, See the work, GitHub, cards, View all work, footer links, TOC, project rail, dialog buttons, diagram frame):

| Theme | Outline | Offset |
|---|---|---|
| Dark | `2px solid #caff77` | 4px |
| Light | `2px solid #18181b` | 4px |

**Keyboard order** follows DOM order on `/`: skip → wordmark → Work → Notes → About → Say hello → theme toggle → hero email → copy email → See the work → GitHub → project cards → View all work → note links → About links → footer.

**Dialogs**

- Photo viewer: focus lands on **Close** when opened. Escape closes in **747–753 ms** (also when pressed 1.5 s after opening). Focus returns to the exact opener ("View larger: …"). Next/count/caption update correctly. Sizes: 896×705 at 1440, 358×698 at 390, 288×713 at 320; no page overflow.
- Diagram viewer: focus lands on Close, Escape returns focus to "Enlarge diagram".

**Reduced motion** (`prefers-reduced-motion: reduce`): no intro sweep, 12 letters / 3 words static, letter transforms are `|` (no translate), transitions `0s`, `scroll-behavior: auto`, name `aria-label` intact.

**Language** — `html lang` correct per route (`en` for English pages, `my` for the two Burmese posts). The author aside on Burmese posts is correctly `lang="en"`. However, English runs inside Burmese articles (`TL;DR`, `References`, "Payment App", "Backend", "request", "algorithm") inherit `lang="my"` with no `lang` override → WCAG 3.1.2 (Language of Parts) failure. See P2-2.

**Alt text** — all images have an `alt` attribute; every visible image is loaded (`naturalWidth > 0`, `brokenVisible: []`). Empty `alt=""` occurs only on (a) project preview images inside links/cards whose adjacent heading names the project and (b) the 40×40 byline avatar next to the author's name — both correctly decorative.

### 2.2 Responsive

**Overflow** — 27/27 loads: `document.scrollWidth === innerWidth`, `overflowX === 0`; no overflowing elements. At 320 the header still fits: wordmark 91 px, nav 173 px (scrollWidth 185 px from the intentional `-mr-3`), gap 16 px, toggle 41×44, document width 320.

**Page heights (px)**

| Route | 1440 | 390 | 320 |
|---|---:|---:|---:|
| `/` | 5280 | 6405 | 6656 |
| `/projects` | 2944 | 3602 | 3629 |
| `/project/gencourse` | 4404 | 5145 | 5643 |
| `/project/url2short` | 4278 | 4965 | 5349 |
| `/writing` | 1252 | 1534 | 1752 |
| `/post/idempotency-…` | 4913 | 6000 | 6579 |
| `/post/what-is-big-o-…` | 5663 | 6622 | 7361 |
| `/about` | 1453 | 2401 | 2611 |
| `/404` | 992 | 1091 | 1206 |

**First screen**

| Viewport | Hero | h1 | Side copy ends | Next section |
|---|---|---|---|---|
| 1440×900 | 1216×900 (bottom exactly 900) | y=411, 748×417 | y=828 | "Selected work" starts at 900 — no peek |
| 390×844 | 350×639 | y=128, 350×143 | y=591 | h2 at y=695 (below fold) |
| 320×844 | 350×~661 | y=128 | y=591 | h2 at y=717 (below fold) |

No name overflow at any width; the hero is a deliberate full-viewport composition at 1440.

**Tap targets (width × height, px)**

| Target | 390 | 320 |
|---|---|---|
| Header wordmark | 93×44 | 91×44 |
| Work / Notes / About | 44/49/50×44 | 44/49/50×44 |
| Theme toggle | 44×44 | **41×44** |
| Hero email | 236×48 | 236×48 |
| Copy email | 123×44 | 123×44 |
| See the work | 109×44 | 109×44 |
| View all work | 108×44 | 108×44 |
| Footer links | 44 high | 44 high |
| Article TOC links (mobile) | 44 high | 44 high |
| Project rail links | 44 high (desktop only) | 44 high (desktop only) |
| Photo dialog buttons | 108/81/89×44 | ≥44 |
| Enlarge diagram | 157×44 | 157×44 |
| "More about me" (article) | 116×50 | 116×50 |

Everything meets WCAG 2.5.8 (24×24). The 320 toggle misses the 44 px design target by 3 px (P3-6).

**Other responsive measurements**

- Project diagram frame: desktop 1214/1214 (no horizontal scroll); mobile 348/704 at 390 and 278/736 at 320, scrollable, labelled "Scrollable system architecture diagram", keyboard ArrowRight moves `scrollLeft` 0→80 with a visible ring.
- Article body: 736 px wide, 20 px/34 px, first line 77 characters (P3-7).
- Project "On this page" rail is `display:none` below 768 px; mobile case-study pages (5145 / 5643 px tall) have no in-page nav (P2-3).

### 2.3 Interaction state

**Header hide / return** — at `scrollY 1400` (scrolling down) the header is `top:-72px` with `data-hidden`. Scrolling up to 1000 restores `top:0`; the threshold is ~100 px of upward scroll. At 733 it is visible. Returning is reliable once the 100 px threshold is crossed.

**In-page anchors (the actual defect)** — from `scrollY 500`, activating **Work** jumps to `#projects` at `scrollY 924`. Result:

```
header.top   = -72   (data-hidden)
nav.top      = -58
Notes rect   = { x: 974, y: -58, w: 52, h: 44 }
elementFromPoint(Notes centre) = null
```

The header is hidden *because the anchor jump is a downward scroll*, and it stays hidden, so the primary navigation is off-screen immediately after it was used. The user must scroll up ≥100 px to get it back. Focus itself is handled correctly: it moves to the target `<section tabindex="-1">`, the next Tab goes to in-view content ("View all work"), Shift+Tab goes to in-view hero links.

**Scroll spy** — at the top, no nav item is marked (`active: null`, `aria-current` absent). After scrolling: Work → Notes → About, each marked `aria-current="location"`. Values are correct for in-page sections.

**Theme switch** — `#theme-toggle`:

| Phase | Observed |
|---|---|
| Before | label "Switch to light theme", dark background `#0c0d0c` |
| 60 ms | `html.light`, body `#fafafa`, label already "Switch to dark theme" |
| Mid-transition | view transition `gif-then-expand` running (150 ms), background never blank |
| Final | `light` class, `data-theme="github-light-high-contrast"`, `localStorage.theme = "light"`, `theme-color #fafafa`, dark icon hidden / light icon shown |
| Assets | `/animation.gif` requested and returns **200** |

Transition settles around 900 ms; label, icon, storage and meta theme-color all stay in sync. No console or network errors during the switch.

**Project page** — rail "On this page" is sticky at top 128 with 5 links, each 44 px high; current item updates with scroll. Enlarge opens a 1408×405 dialog with a 1374 px-wide SVG (desktop) / 1024 px (mobile); Escape closes and restores focus. Next case study → `/project/url2short`.

**Article page** — TOC `<details>` open by default, 3 links, sticky at ≥1280 (top 96 after scrolling). Reading progress is a scroll-driven animation: `scaleX 0 → 0.4485` at `scrollY 1800`. Next note → `/post/what-is-big-o-notation-my`. "More about me" → `/about` (116×50).

**`aria-current` values (inconsistency)** — after hydration:

| Route | Marked link | Value |
|---|---|---|
| `/projects` | Work | `location` |
| `/about` | About | `location` |
| `/writing` | Notes | `page` |
| `/project/gencourse` | Work | `page` |
| `/post/…` | Notes | `page` |
| `/` | none at top; in-page section `location` on scroll | — |

Both values are valid ARIA, but mixing them for "current page" is inconsistent (P3-8).

### 2.4 Content / IA

| Check | Result |
|---|---|
| Home header links | `#projects`, `#writing`, `#about` (in-page anchors) |
| Inner-page header links | `/projects`, `/writing`, `/about` (absolute) |
| Footer links | `/writing` and `/about` present on all routes |
| Home Notes section | exactly the 3 newest posts; **no "View all notes"**; no `/writing` link inside the section |
| Home About section | **no `/about` link at all** |
| Writing index | lists the same 3 posts |
| Next-item links | case study → next case study; post → next note |
| `/404` | custom page, h1 "This page doesn't exist", HTTP 404 by design |

The two home sections therefore dead-end at the section boundary; the only route to `/writing` or `/about` from the home page is the footer (P3-4).

### 2.5 Performance / assets

- 27/27 loads: **0 failed requests, 0 bad responses, 0 console errors**. The only exception is `/404`, which intentionally returns HTTP 404 and logs one "Failed to load resource" line.
- `/animation.gif` returns 200 as an image; no missing asset on any route.
- 0 visible broken images; every rendered image is `complete` with `naturalWidth > 0`.
- Below-fold images are `loading="lazy"` (project previews, recognition photos); article images support `eager` + `fetchpriority="high"` when needed; the heading font is preloaded.
- No LCP/CLS lab instrumentation was run — this pass covers load errors, asset integrity, and layout stability (no horizontal overflow, no visible reflow observed during theme/dialog transitions), not Core Web Vitals scores.

---

## 3. What is solid

- Contrast is genuinely strong: exhaustive text check passes in both themes, and the diagram's real shape fills are 18.49:1 / 16.97:1.
- Focus indication is consistent and high-contrast in both themes (`#caff77` / `#18181b`, 2 px at 4 px offset) across links, buttons, cards, TOC, rail, and dialogs.
- Skip link works and lands on `main`, not behind the header.
- Exactly one h1 per route, no heading-level skips, labelled landmarks, no duplicate IDs.
- No horizontal overflow at 320/390/1440 on any of the 9 routes; header fits 320 without clipping.
- Tap targets are mostly ≥44 px; mobile TOC and footer links are 44 px high.
- Dialogs are correctly modal: focus moves in, Escape works even after a delay, focus returns to the opener, and page scroll is locked.
- Theme switch is complete: class, storage, meta theme-color, label, icon and animation all agree; no blank frame.
- Reduced motion is fully honoured (no sweep, no transforms, zero-duration transitions, auto scroll).
- The project diagram is scrollable by keyboard with a visible focus ring, and enlarging it preserves context on close.
- Article TOC, reading progress, next-note and next-case-study links all work; no console/network noise outside the intentional 404.

---

## 4. False positives / not issues

1. **Detector `broken-image`** — see §1. Invalid markup, but hidden in a closed dialog and populated by JS; no user-visible break. Still worth cleaning up.
2. **Naive SVG contrast failures on the architecture diagram** — the checker samples the SVG canvas background, not the node/label fills. Real ratios are 18.49:1 dark and 16.97:1 light.
3. **Empty `alt=""` on project previews and the 40×40 byline avatar** — decorative; adjacent headings/author name provide the accessible name.
4. **Lazy images "not loaded" below the fold** — expected; they load on scroll and are not broken.
5. **`/404` HTTP 404 + one console "Failed to load resource"** — intentional status for a not-found route, with a designed page.
6. **Desktop TOC `height: 0`** — intentional sticky-rail CSS; the inner nav is 208×144 at y=608, links are visible and hit-testable.
7. **Closed article `<details>`** — `getBoundingClientRect()` still reports 208×54, but `checkVisibility()` is false and `elementFromPoint` hits `body`; nothing is clickable while closed, so there is no collapse bug.
8. **Desktop TOC links 34 px high** — pass WCAG 2.5.8 (208×34 > 24×24) and are pointer targets on a desktop layout.
9. **320 theme toggle 41×44** — passes 24×24; it is only 3 px short of the 44 px design target (noted as P3-6, not a conformance failure).
10. **Mobile header email `0×0` at 390/320** — hidden by design (`hidden … sm:inline-flex`); hero email and footer mailto remain available.
11. **A 10 px upward scroll does not reveal the header** — the reveal threshold is ~100 px, and smooth scrolling needs to settle; 100 px reliably restores it.
12. **1440 hero is exactly 900 px tall with no next-section peek** — deliberate full-viewport hero, not a clipping bug.
13. **Inline text links smaller than 24 px** — WCAG 2.5.8 has a spacing/line-height exception for inline links; they are not treated as target-size failures.

---

## 5. Prioritized issues

### P0 — blocking
None.

### P1 — high
None. No accessibility blocker, broken flow, or data-loss path was found.

### P2 — medium

**P2-1. Header disappears after in-page navigation, leaving the nav unreachable**
- Repro: at 1440, load `/`, scroll to ~500, click **Work** in the header.
- Observed: jumps to `#projects` (`scrollY 924`); header `top:-72`, `data-hidden`; nav at `y=-58`; `elementFromPoint` on Notes returns `null`. Only scrolling up ≥100 px brings it back.
- Impact: the header is the only navigation on the home page, and it hides at the moment it is used. Every anchor click repeats this.
- Fix: don't apply hide-on-scroll-down for programmatic/anchor scrolls (e.g. suppress the hide for ~1 s after an anchor activation, or keep the header pinned while `:target` is active).

**P2-2. English runs inside Burmese articles are not language-marked (WCAG 3.1.2 AA)**
- Repro: open `/post/idempotency-keys-what-most-tutorials-dont-tell-you`; inspect `TL;DR`, `References`, and inline terms ("Payment App", "Backend", "request", "algorithm").
- Observed: `html lang="my"`; those elements have `lang: null` and inherit Burmese. The author aside is correctly `lang="en"`, which shows the pattern is understood but not applied to inline runs.
- Impact: screen readers pronounce English headings/terms with a Burmese voice; the two longest articles are affected.
- Fix: wrap English runs/headings in `lang="en"` (or add `lang` to the MDX heading/term components).

**P2-3. Mobile case-study pages have no in-page navigation**
- Repro: open `/project/gencourse` at 390 or 320.
- Observed: "On this page" rail is `display:none` below 768 px; the page is 5145 px (390) / 5643 px (320) tall with 5 major sections. No mobile TOC, jump menu, or back-to-top until the footer.
- Impact: long-form technical reading on phones has no way to jump between "The challenge", "System architecture", etc.
- Fix: render the rail as a collapsible `<details>`/jump menu on mobile, reusing the same anchors.

### P3 — low

**P3-4. Home Notes/About sections dead-end**
- Repro: on `/`, inspect the Notes and About sections. Notes contains exactly 3 posts with no "View all notes"; About has no link to `/about`. `/writing` and `/about` are reachable only from the footer.
- Fix: add a section-level "All notes" → `/writing` and "More about me" → `/about` (the article page already has the latter, 116×50).

**P3-5. Oversized click targets**
- Repro: at 1440, click at x≈700, y≈36 on the header wordmark → navigates home; on `/project/gencourse`, the "Enlarge diagram" button is 1228×44 across a 1216 px row.
- Impact: accidental activation when clicking empty space near these controls.
- Fix: constrain the wordmark link to its text box (the 64/36 grid stretches it to 748 px); size the enlarge button to its label instead of `md:col-span-12`.

**P3-6. 320 px theme toggle is 41×44**
- Repro: 320-wide viewport, measure `#theme-toggle` → 41×44. Passes WCAG 2.5.8 (24×24) but is 3 px under the 44 px design target used elsewhere.
- Fix: prevent flex shrink (`flex-shrink: 0`) or reserve 44 px in the header grid.

**P3-7. Article line length is 77 characters**
- Repro: `/post/idempotency-…` at 1440; body column 736 px, 20 px/34 px, first line 77 chars, `max-width: none`.
- Impact: above the comfortable 45–75 character range; reading long Burmese/English mixed lines is harder.
- Fix: cap the measure (e.g. `max-width: 66ch` / ~680 px) while keeping the current type scale.

**P3-8. `aria-current` uses two conventions**
- `/projects` and `/about` → `location`; `/writing`, `/project/*`, `/post/*` → `page`; home uses `location` for scroll-spy sections.
- Fix: use `page` for the current page link and `location` only for in-page sections, from one source of truth (the client scroll-spy currently overrides the server value).

**P3-9. Giant focus ring on the section target after a keyboard anchor activation**
- Repro: keyboard-activate **Work**; focus lands on `<section id="projects" tabindex="-1">` and paints a `2px solid #caff77` ring around a 1216×1593 px (up to ~2089 px) box.
- Impact: not a WCAG failure — focus is visible and correctly placed — but the outline reads as a page-wide lime frame.
- Fix: give programmatic targets a subtler focus style (`:focus-visible` only for real controls, or `outline: none` on `[tabindex="-1"]` sections while keeping the focus move).

---

## 6. Evidence index

| File | Contents |
|---|---|
| `assessment-b.json` | 27-load sweep: overflow, headings, landmarks, images, taps, header, first screen, theme, dialogs, TOC, IA, reduced motion |
| `assessment-b-focused.json` | detector DOM proof, Escape timing, diagram contrast, article measure/lang, 320 header, anchors, rail, theme frames, light focus, home IA |
| `b-probe2.json` | TOC collapse, `aria-current`, wordmark navigation |
| `b-probe3.mjs` | no-JS fallback, enlarge hit area, light focus rings |
| `b-probe4.mjs` | header return threshold |
| `b-probe5.json` | exhaustive contrast, heading outlines, mobile photo dialog, diagram keyboard |
| `b-probe6.json` | contrast on 5 routes × 2 themes, 320 photo dialog, delayed Escape |
| `b-probe7.mjs` | keyboard anchor focus / Shift+Tab, section ring size |
| `b-final-check.mjs` | enlarge button rect, anchor hit-test, 320 dialog rect |
| `b-aria-check.mjs` | `aria-current` per route after hydration |
| `b-dup-check.mjs` | duplicate-ID scan across all 9 routes |
