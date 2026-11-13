# 04 — Heuristic Evaluation

**Score:** 25 / 32 (78%) — **Good**
**Independent A:** 26 / 32 (81%)
**Prior critique:** 20 / 32 (63%) — Acceptable

---

## 1. Score table

| # | Heuristic | Score | What is working | What is not |
|---|---|---:|---|---|
| 1 | Visibility of system status | **3 / 4** | Theme label updates, copy status, nav current state, TOC current section, reading progress, dialog `aria-busy` | Header hides after an anchor jump; mobile case studies have no in-page map; theme switch settles ~900ms |
| 2 | Match between system and real world | **3 / 4** | Plain language; honest technical vocabulary; “My role,” “Stage,” “Context” | Work naming drifts; “Winner Nominee” is ambiguous; proof appears before the problem |
| 3 | User control and freedom | **3 / 4** | Skip link, back links, close buttons, theme toggle, reduced-motion support | Header hides at the moment of use; photo close is ~0.73s; no persistent mobile nav |
| 4 | Consistency and standards | **3 / 4** | Strong tokens, components, focus color, type scale | `aria-current` mixes `page`/`location`; 404 hierarchy inverted; work naming drift |
| 5 | Error prevention | **3 / 4** | No forms; copy fallback; native dialogs; 404 recovery | No search (acceptable at this size); 404 visual hierarchy |
| 6 | Recognition rather than recall | **3 / 4** | Desktop rail/TOC; section exits; language labels; breadcrumbs | Mobile case studies remove the TOC; technology rail before the challenge; header hides |
| 7 | Flexibility and efficiency of use | **n/a** | — | No power-user workflow, settings, or search to evaluate |
| 8 | Aesthetic and minimalist design | **4 / 4** | Restrained, editorial, coherent; one accent; authored motion | Article measure is 77ch; dark default vs off-white brief is an open intent question |
| 9 | Help users recover from errors | **3 / 4** | 404 has three clear routes; copy failure fallback; dialogs close | 404 hierarchy; no search; header hide can strand a reader |
| 10 | Help and documentation | **n/a** | — | No in-product help/docs; notes are content, not help |
| **Total** | **8 scored heuristics** | **25 / 32** | **78% — Good** | |

### Score reconciliation

Assessment A scored **26/32**. The synthesis scored **25/32** after one change:

- **Heuristic 6: 4 → 3.** A gave recognition a 4. The desktop rail/TOC is excellent, but the mobile case study hides “On this page” and places the technology rail before the challenge. On a 5.6k page, that is a real recognition/memory cost. Three is the honest score.

Everything else matches A. The one-point difference is not a disagreement about the site; it is a disagreement about how much weight to give the mobile case-study TOC. Both land in the **Good** band.

The prior critique scored 20/32. The site has improved materially: the home exits, language labels, dialog behavior, reduced-motion handling, theme persistence, and responsive overflow are all stronger than the earlier snapshot.

---

## 2. Cognitive load checklist

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | One obvious primary action per screen | **Partial** | The hero offers email, copy, GitHub, and “See the work.” Email is the most prominent; “See the work” — the evaluation path — is the quietest. |
| 2 | Predictable names | **Partial** | Work / Selected work / View all work / All work / Explore the project / See the work. Notes and About are consistent. |
| 3 | Chunked and scannable | **Pass** | Sections, rows, 2–4 items, generous whitespace, strong headings. |
| 4 | Nothing essential requires memory | **Partial** | Desktop TOC/rail is strong; mobile case studies remove it; the header disappears after anchor jumps. |
| 5 | Choices are limited | **Pass** | Three nav links; 4 featured projects; 3 notes; 5 tool groups. |
| 6 | Feedback is immediate | **Pass** | Copy status, theme label at ~60ms, nav current state, dialog `aria-busy`, TOC current section. The theme mask settles at ~900ms but there is no blank. |
| 7 | Errors are prevented and recoverable | **Pass** | No forms; copy fallback; native dialogs; 404 has three routes back. |
| 8 | Reading order matches visual order | **Partial** | Mobile case study: technology rail before the challenge; proof points before the problem. The rest of the site is linear and well ordered. |

**Summary:** 4 pass, 4 partial, 0 fail. Assessment A marked reading order as a fail; the synthesis treats it as a partial because the story is still readable — the rail delays it rather than breaking it. The distinction matters for prioritization: this is a P2, not a P0.

---

## 3. Strengths

### 3.1 The hero is authored, not assembled

The name swell, the 64/36 split, the oversized type, the email pill, the copy control, the quiet “See the work” link, and the reduced-motion fallback form a first screen that could not be swapped into another portfolio without losing its identity. The hero fills 900px at 1440 — a deliberate full-screen statement — and still exposes the work transition through the “See the work” link.

### 3.2 The editorial system is coherent

One accent (lime focus), two typefaces (sans + mono for metadata), hairline rules, generous whitespace, restrained shadows, and a complete light/dark theme. The design does not rely on gradients, glassmorphism, or a component-library look. The tokens are used consistently across home, indexes, case studies, notes, About, and 404.

### 3.3 The case-study reading machine is strong

The sticky rail, full-bleed diagram, text architecture list, origin-aware back link, next case study, keyboard-scrollable diagram frame, and enlarge dialog are a real system. A peer can navigate the architecture without losing the narrative. This is the part of the site that most clearly says “engineer.”

### 3.4 Accessibility fundamentals are present

Skip link, landmarks, one h1 per route, visible focus, 44px targets (except the toggle), alt text, native dialogs, focus return, reduced-motion support, no horizontal overflow at 320/390/1440, and a complete light theme. These are not checkboxes added at the end; they are part of the build.

### 3.5 The home exits, language labels, and footer close are right

“View all work,” “All notes,” and “More about me” are visible. Burmese cards label “Burmese · X min read” and set `lang="my"`. The footer says “Say hello.” on every page. These are the details that make the site feel cared for.

---

## 4. Design specificity

### 4.1 The verdict

Assessment A’s line is the right one:

> **Authored at the surface, generic at the substance.**

That is not a dismissal. It is a precise diagnosis:

- **Surface:** the hero, motion, grid, diagram, back links, photo viewer, theme transition, and focus color are specific to this site. The visual system is not a template.
- **System:** the components are coherent and reusable without feeling generic. The case-study rail and the note TOC are designed for the content.
- **Substance:** the case studies are well framed but stop before the outcome/reflection; the About narrative is specific in its facts but generic in its arc; the work index promises “what I learned” and does not deliver it.

The site’s design is stronger than its evidence. That is an unusual and fixable position: the hard visual work is done; the remaining work is writing and navigation.

### 4.2 What is genuinely specific

- The name-swell interaction and its reduced-motion fallback.
- The 64/36 editorial split used by the hero, header, and footer.
- The full-bleed architecture diagram with a text list beside it.
- The origin-aware back link (“Back to notes” vs “Back to all notes”).
- The photo viewer with caption, count, arrow keys, and spring close.
- The theme mask transition.
- The lime focus color against a monochrome canvas.

### 4.3 What is genre-standard

- The dark/off-white monochrome palette.
- The large neo-grotesque sans + mono metadata.
- The one-accent focus color.
- The “selected work” index with rows, images, and tags.
- The editorial case-study grid.

These are not problems. They are the vocabulary the site uses well. Specificity comes from composition and interaction, not from inventing a new palette.

### 4.4 The open design-intent question

The surface brief calls for an off-white canvas; the shipped default is dark. The light theme is complete and passes contrast. This is not a defect — it is a decision that has not been reconciled with the brief. Either update the brief to “dark default, light option” or make the off-white canvas the default. Do not leave the brief and the product disagreeing.

### 4.5 The design-specificity score

Heuristic 8 is **4/4**. The site is visually disciplined and distinctive. The remaining gap is content and navigation, not aesthetics. A redesign would be the wrong response to this study.

---

## 5. What would move the score

| Fix | Heuristics | Potential |
|---|---|---|
| F1 header stays visible after anchor jumps | 1, 3, 6 | +1–2 |
| F2 case-study reflection + narrative order | 2, 6, 9 | +1–2 |
| F3 header geometry at 1024/wordmark | 3, 5 | +1 |
| F4 mobile case-study TOC/rail order | 1, 6 | +1 |
| F5 Burmese UI language marking | 4, 9 | +0–1 |
| F6 About availability/role target/résumé | 2, 6, 9 | +1 |
| F7 404 hierarchy | 4, 9 | +0–1 |
| F8 article measure | 8 | +0–1 |
| F9 `aria-current` consistency | 4 | +0–1 |
| F10 focus-ring scope | 3 | +0–1 |

If F1–F6 land, the site is plausibly **29/32 (91%)** — still “Good” by the band, but at the top of it. The score is a diagnostic, not a target; the goal is a site that delivers its promise, not a perfect number.

---

## 6. Why 7 and 10 are n/a

- **Heuristic 7 — Flexibility and efficiency of use.** The site has no settings, search, filters, saved views, keyboard shortcuts, or power-user workflow. With five projects and three notes, adding them would be over-engineering. The heuristic does not apply to this surface.
- **Heuristic 10 — Help and documentation.** There is no in-product help, onboarding, FAQ, or documentation. The notes are editorial content, not help. The heuristic does not apply.

Renormalizing to eight scored heuristics gives a comparable **/32** score and avoids penalizing the site for features it should not have.
