# 01 — Scope and Method

**Study date:** 11 November 2026
**Surface:** Experience (the public portfolio)
**Site:** Astro 7 + Tailwind 4, local dev server at `http://localhost:4321`

---

## 1. What was reviewed

### Routes

| Route | Surface | Deep measurement |
|---|---|---|
| `/` | Home: hero, selected work, competition results, notes, about brief, footer | Yes — 1440, 390, 320 |
| `/projects` | Work index (5 projects) | Yes — 1440, 390, 320 |
| `/project/gencourse` | Case study (AI EduTech) | Yes — 1440, 390, 320 |
| `/project/url2short` | Case study (URL shortener) | Yes — 1440, 390, 320 |
| `/writing` | Notes index (3 posts) | Yes — 1440, 390, 320 |
| `/post/idempotency-keys-what-most-tutorials-dont-tell-you` | Burmese technical note | Yes — 1440, 390, 320 |
| `/post/what-is-big-o-notation-my` | Burmese beginner note | Source + route sweep |
| `/about` | Profile | Yes — 1440, 390, 320 |
| `/404` | Error recovery | Yes — 1440, 390, 320 |

The remaining three case studies (`chate-sat`, `toolydooly`, `zaychin`) and the English note (`my-plan-for-2025`) share the same templates and were reviewed in source/frontmatter. The browser sweep covered nine routes: the home, both indexes, two case studies, two Burmese notes, About, and 404.

### Source surfaces

- `src/pages/` — all routes.
- `src/components/` — header, footer, home sections, post card, case-study components, project rail, table of contents, copy-email, back link, MDX components.
- `src/layouts/BaseLayout.astro` — metadata, skip link, landmarks, theme boot, structured data.
- `src/styles/global.css`, `src/styles/tokens.css` — tokens, focus, reduced motion, forced colors, theme transition.
- `src/lib/seo.ts`, `src/lib/content.ts`, `src/lib/animation/spring.ts`.
- `src/content.config.ts`, all five project frontmatters, all three post frontmatters.
- `PRODUCT.md`, the `.impeccable/surfaces/src-pages-index-astro.md` brief, and prior critique snapshots.

---

## 2. Method

### Step 1 — Source-first review

Every route, shared component, layout, token, content file, and SEO helper was read before judging the rendered site. This prevents “screenshot criticism” and catches things the eye cannot see: `aria-current` sources, `lang` inheritance, `scroll-mt` math, focus selectors, empty project bodies, and the difference between a real dead end and a missing visual cue.

### Step 2 — Independent Assessment A (design/UX)

A separate reviewer read the source first, then measured the live site at 320, 375, 390, 768, 820, 1024, 1280, 1440, and 1920px. A tested keyboard order, focus rings, theme persistence, the copy-email control, the diagram dialog, and reduced motion. A did not run the detector or read the other assessment. Output: `ux/evidence/assessment-a.md`.

### Step 3 — Independent Assessment B (detector + browser evidence)

A second reviewer ran the project detector and a Playwright Chrome sweep across 9 routes × 3 viewports (1440×900, 390×844, 320×844), plus focused probes for dialogs, theme transitions, header behavior, anchors, contrast, and reduced motion. B did not read Assessment A. Outputs: `ux/evidence/assessment-b.md`, `assessment-b.json`, `assessment-b-focused.json`, and `b-probe*.json`.

### Step 4 — Synthesis and reconciliation

The two assessments were compared line by line. Every claim that mattered was re-checked against the current source and the live DOM. This step removed stale assumptions and false positives:

- Home **does** have “All notes” and “More about me” exits.
- Post cards **do** label Burmese notes.
- The diagram **passes** contrast.
- The photo dialog **honors** reduced motion.
- The About page is **not** a duplicate of the home brief.
- The “Enlarge diagram” button **is** visible on mobile.
- The footer **does** provide a closing contact moment.

The final documents in `ux/` are the synthesized source of truth. The raw assessments remain for traceability.

### Step 5 — Prioritization

Findings were rated by user impact, not by how easy they are to see:

- **P0** — blocks a core task or makes content inaccessible to a group.
- **P1** — seriously undermines a core task for a meaningful group; fix before the next release.
- **P2** — causes friction, confusion, or a WCAG AA failure; schedule.
- **P3** — polish, consistency, content opportunity, or hygiene; backlog.

There are **no P0 findings**. The site is usable.

---

## 3. Tools and evidence

### Detector

```bash
node /Users/happer/.agents/skills/impeccable/scripts/detect.mjs \
  --json src/pages src/components src/layouts
```

Exit code **2**, one warning:

- `broken-image` at `src/components/home/RecognitionSection.astro:128` — `<img>` without `src` in the closed photo dialog.

Raw output: `ux/evidence/detector-raw.json` (moved from the repo root). Assessment B's detector output: `ux/evidence/detector-b.json`.

### Browser audit

- `ux/evidence/audit.mjs` — 22 records across 8 routes, desktop/mobile screenshots and measurements.
- `ux/evidence/focused.mjs` — dialog behavior, lazy images, dark-theme focus ring, header geometry, 320px reflow, diagram contrast.
- `ux/evidence/assessment-b.mjs` / `assessment-b-focused.mjs` — B's sweep and focused probes.
- Screenshots: `ux/evidence/*.png` (both first-pass and verified sets).

The first-pass `audit.json` contains naive false positives for lazy images (natural width 0 before load), SVG text color (it uses `fill`, not `color`), and the theme toggle measured during its transition. **Use Assessment B's verified data for numbers.** The synthesis does.

### Viewports

- Desktop: 1440×900, plus 1280/1920 spot checks.
- Tablet: 768, 820, 1024, 1080, 1100.
- Mobile: 390×844 and 320×844.
- Input: keyboard tab order, focus-visible, Escape, arrow keys, reduced motion.

---

## 4. Confidence

| Area | Confidence | Why |
|---|---|---|
| Header geometry, overflow, target sizes | **High** | Direct DOM measurements at multiple widths. |
| Contrast | **High** | Computed styles and pixel-level checks; diagram re-checked with `fill`. |
| Language/ARIA semantics | **High** | Source + DOM inspection; WCAG mapping. |
| Dialog behavior and reduced motion | **High** | Reproduced with Playwright, including a reduced-motion close measurement. |
| Content/IA judgments | **Medium** | Source and copy reviewed; no real-user sessions. |
| Personas and jobs | **Low–medium** | Hypotheses derived from `PRODUCT.md`; not validated with visitors. |
| SEO impact | **Medium** | Metadata and structure verified; no Search Console/traffic data. |
| Visual/design specificity | **Medium** | Expert judgment; strong source evidence, no user perception study. |

---

## 5. Limitations

- **No moderated usability testing.** This is a heuristic and browser-evidence study. The personas and journeys are hypotheses.
- **No manual screen-reader pass.** Semantics, ARIA, and language were inspected, but VoiceOver/NVDA output was not recorded.
- **Chrome only.** Safari/Firefox behavior (especially `view-transition`, `dialog`, and `animation-timeline`) was not tested.
- **No zoom/text-spacing/forced-colors manual pass.** The CSS supports reduced motion and forced colors, but those modes were not exhaustively exercised.
- **No analytics or conversion data.** We cannot say which pages visitors actually use.
- **Dev server snapshot.** Measurements reflect the current working tree, not a production build.
- **Concurrent site edits.** The working tree was being edited by another process during the study. The study itself only adds `ux/`; the site files were left untouched. All measurements are from the post-edit state.
- **Content constraints.** The product brief says not to invent outcomes or client proof. The case-study recommendation is honest reflection, not fabricated metrics.

---

## 6. Score definitions

The heuristic review uses the ten Nielsen heuristics, with **7 (flexibility/efficiency)** and **10 (help/documentation)** marked `n/a` for a small portfolio with no power-user workflow, settings, search, or in-product documentation. The remaining eight are scored 0–4 and renormalized to **/32**:

- **4** — excellent; no meaningful gap.
- **3** — good; minor problems that do not block the task.
- **2** — acceptable; noticeable friction or missing support.
- **1** — poor; task is hard or unreliable.
- **0** — unusable.

Bands: **0–15 Poor**, **16–23 Acceptable**, **24–31 Good**, **32 Excellent**.

The synthesis score is **25/32 (78%) — Good**. Independent A scored 26/32. The one-point difference is heuristic 6: A gave 4, the synthesis gives 3 because the mobile case study removes the in-page TOC. Both are defensible; the synthesis is the conservative call.

---

## 7. What this study is not

- It is **not a redesign**. The visual system is a strength; the recommendations protect it.
- It is **not a code review**. Findings are framed by user impact; the technical notes are there to make fixes actionable.
- It is **not a content rewrite**. The content recommendations are specific and respect the “do not invent” guardrail.
- It is **not a claim of statistical significance**. There are no user sessions, no A/B tests, and no analytics.

---

## 8. Reproduce the evidence

```bash
# Detector (from repo root)
node /Users/happer/.agents/skills/impeccable/scripts/detect.mjs \
  --json src/pages src/components src/layouts

# First-pass browser audit
node ux/evidence/audit.mjs

# Focused interaction/geometry checks
node ux/evidence/focused.mjs

# Assessment B's sweep and focused probes
node ux/evidence/assessment-b.mjs
node ux/evidence/assessment-b-focused.mjs
```

The dev server must be running at `http://localhost:4321`. It was already running when the study began and was left running.
