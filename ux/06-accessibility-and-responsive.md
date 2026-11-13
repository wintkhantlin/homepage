# 06 — Accessibility and Responsive Behavior

**Verdict:** strong fundamentals, with four specific gaps: header stability after anchor jumps, the 1024px theme toggle, language-of-parts on Burmese notes, and focus geometry. No P0 accessibility blockers.

---

## 1. Pass/fail summary

### Passes

- **Skip link** — visible on focus, jumps to `#main-content`.
- **Landmarks** — header, primary nav, footer nav, main, asides, dialog.
- **One h1 per route** — home, indexes, case studies, notes, About, 404.
- **Heading order** — h1 → h2 → h3; no skipped levels on the sampled routes.
- **Focus visibility** — 2px outline, 4px offset, 11.2:1 dark / 5.1:1 light; visible on links, buttons, summaries, TOC, dialogs.
- **Keyboard operability** — nav, copy, theme, TOC, dialogs, diagram frame, footer; no keyboard traps.
- **Native dialogs** — `showModal()`, Escape, focus return, focus containment, backdrop.
- **Alt text** — content images have alt; decorative images are empty; the diagram has a label plus the architecture list.
- **Reduced motion** — theme, reveals, name swell, scroll, press/card/header springs, and the photo close all honor `prefers-reduced-motion`.
- **Theme persistence** — `localStorage`; no flash; complete light theme.
- **No horizontal overflow** — 320, 390, 768, 1024, 1440, 1920 spot check.
- **Reflow** — 320px single column; no clipped content; the diagram scrolls intentionally.
- **Language labels on cards** — “Burmese · X min read” and `lang="my"` on titles/excerpts.
- **Current-section indication** — header, TOC, and rail use `aria-current` (with the F9 inconsistency).
- **Reading progress** — scroll-driven, hidden from assistive technology.
- **Copy feedback** — status message via `aria-live`.
- **Touch targets** — 44×44 for nav, footer, buttons, TOC, photo controls, diagram close; the theme toggle is the exception.

### Fails / risks

| Issue | Severity | Finding |
|---|---|---|
| Header hides after in-page anchor navigation | P1 | F1 |
| Theme toggle 17×44 at 1024 | P2 | F3 |
| Burmese UI/English runs unmarked | P2 (WCAG 3.1.2) | F5 |
| Giant programmatic section focus ring | P3 | F10 |
| `aria-current` mixes `page`/`location` | P3 | F9 |
| 404 visual hierarchy inverted | P3 | F7 |
| Diagram alternative is generic | P3 | F14 |
| Light faint text 4.63:1 | P3 (passes, borderline) | F17 |
| `Topics` `aria-label` on a generic `div` | P3 | F27 |
| Reduced-motion anchor fallback does not move focus | P3 | F25 |
| Photo close ~0.73s normal | P3 (not a reduced-motion failure) | F21 |

---

## 2. WCAG 2.2 mapping

| Criterion | Level | Status | Evidence / note |
|---|---|---|---|
| 1.1.1 Non-text Content | A | **Pass** | Content images have alt; diagram has a label + architecture list. Improve the diagram label (F14). |
| 1.3.1 Info and Relationships | A | **Pass** | Landmarks, headings, lists, tables, dialog roles. `Topics` label is unreliable (F27). |
| 1.3.2 Meaningful Sequence | A | **Partial** | Mobile case study puts the technology rail before the challenge; the story is still readable. F4. |
| 1.3.5 Identify Input Purpose | AA | **n/a** | No personal-data forms. |
| 1.4.1 Use of Color | A | **Pass** | Links are underlined; focus is not color-only; current state is not color-only. |
| 1.4.3 Contrast (Minimum) | AA | **Pass** | Text 18.7:1; muted 7.4:1; faint 4.63:1 light; focus 5.1:1 light; diagram 16.97:1 light. F17 is a nudge, not a failure. |
| 1.4.4 Resize Text | AA | **Not tested** | Relative units; no manual 200% pass. |
| 1.4.10 Reflow | AA | **Pass** | 320px single column; no horizontal page scroll; diagram scrolls inside its frame. |
| 1.4.11 Non-text Contrast | AA | **Pass** | Focus ring 5.1:1 light / 11.2:1 dark; diagram shapes pass; decorative borders are not required. |
| 1.4.12 Text Spacing | AA | **Not tested** | No manual spacing override. |
| 2.1.1 Keyboard | A | **Pass** | All controls keyboard-operable. |
| 2.1.2 No Keyboard Trap | A | **Pass** | Dialogs contain and release focus; no trap. |
| 2.2.2 Pause, Stop, Hide | A | **Pass** | No auto-moving content; reduced motion supported. |
| 2.3.3 Animation from Interactions | AAA | **Pass** | Springs honor reduce; theme/photo close instant under reduce. |
| 2.4.1 Bypass Blocks | A | **Pass** | Skip link. |
| 2.4.3 Focus Order | A | **Pass** | Logical; header hide is a stability issue, not an order issue. |
| 2.4.4 Link Purpose (In Context) | A | **Pass** | Link text is descriptive; “View larger” labels include the photo alt. |
| 2.4.6 Headings and Labels | AA | **Pass** | Descriptive headings; 404 h1 is correct semantically. |
| 2.4.7 Focus Visible | AA | **Pass** | Visible focus on all interactive controls. |
| 2.4.11 Focus Not Obscured | AA | **Pass** | The fixed header does not cover the focused target; it hides instead. |
| 2.4.13 Focus Appearance | AAA | **Pass** | 2px outline, sufficient contrast. |
| 2.5.1 Pointer Gestures | A | **n/a** | No multi-point/path gestures. |
| 2.5.4 Motion Actuation | A | **n/a** | No device-motion controls. |
| 2.5.5 Target Size (Enhanced) | AAA | **Fail** | Theme toggle 41×44 at 320 and 17×44 at 1024; below 44×44. |
| 2.5.8 Target Size (Minimum) | AA | **At risk** | 17×44 at 1024 is below 24×24 unless the spacing exception applies; verify. 41×44 at 320 passes 24. |
| 3.1.1 Language of Page | A | **Pass** | `lang="en"` or `lang="my"` on `<html>`. |
| 3.1.2 Language of Parts | AA | **Fail** | English UI/terms inside `lang="my"` pages are unmarked. F5. |
| 3.2.3 Consistent Navigation | AA | **Pass** | Header/footer consistent; home anchors vs interior links are a deliberate model. |
| 3.2.4 Consistent Identification | AA | **Pass** | Icons/labels consistent. |
| 3.3.1 Error Identification | A | **n/a** | No forms. |
| 3.3.3 Error Suggestion | AA | **n/a** | No forms. |
| 4.1.2 Name, Role, Value | A | **Pass** | Toggle label, dialog names, TOC nav, current state. `Topics` caveat (F27). |
| 4.1.3 Status Messages | AA | **Pass** | Copy status uses `aria-live`. |

**Bottom line:** one clear AA failure (3.1.2), one at-risk AA target-size case (2.5.8), and one AAA target-size failure (2.5.5). The rest is strong.

---

## 3. Responsive behavior

| Width | Header | Overflow | Case study | Notes / article |
|---|---|---|---|---|
| **320** | Wordmark 91×44; nav 173; toggle **41×44**; fits | None | No TOC; rail before challenge; 5.1–5.6k | Article in flow; alias wraps |
| **390** | Wordmark 93×44; toggle 44; fits | None | No TOC; rail at y≈1348; challenge y≈1681 | Article 3,079; line length comfortable |
| **768** | Header flex; toggle 44; fits | None | Rail becomes sidebar; “On this page” visible | TOC visible |
| **1024** | Grid 64/36; wordmark **584**; toggle **17×44**; nav 328 | None | Rail sidebar; TOC visible | Article TOC visible |
| **1080** | Toggle **37×44** | None | Rail sidebar | TOC visible |
| **1100** | Toggle 44 | None | Rail sidebar | TOC visible |
| **1440** | Wordmark **748**; toggle 44; nav 420 | None | Rail sidebar | Article **77ch**; hero fills 900 |
| **1920** (spot) | Fine | None | Fine | Fine |

### What this means

- **Mobile reflow is solid.** The page never scrolls horizontally; the header fits; the diagram scrolls inside its frame; the photo dialog fits.
- **The tablet header is the weak point.** At 1024 the toggle is squeezed to 17px. At 1080 it is 37px. It recovers at 1100. The wordmark hit/focus area is 584px at 1024 and 748px at 1440.
- **The mobile case study is long but readable.** The missing TOC and the rail order are the problems, not the type or the diagram.
- **The desktop article is slightly wide.** 77 characters is over the comfortable range; the rest of the type system is good.

---

## 4. Keyboard and screen reader notes

### Keyboard

Observed tab order on the home page:

1. Skip link
2. Wordmark (748px focus ring at 1440)
3. Work
4. Notes
5. About
6. Say hello (desktop)
7. Theme toggle
8. Hero email
9. Copy email
10. GitHub
11. See the work
12. …sections, project rows, footer.

The order is logical. The two geometry problems are the wordmark’s oversized ring and the section’s giant ring after an anchor jump. The dialogs contain focus and return it to the opener. The diagram frame is focusable and scrolls with arrow keys. The TOC and rail links are reachable.

**Fix:** F3 (wordmark/toggle), F10 (section ring), F1 (header stays visible), F9 (`aria-current`).

### Screen reader

- **Landmarks/headings:** strong. One h1 per route; sections labelled; asides labelled; nav labels distinct (“Primary,” “Footer navigation,” “Table of contents,” “On this page”).
- **Current state:** the header uses `aria-current`; the TOC/rail use `aria-current="location"`. The inconsistency on `/projects`/`/about` is F9.
- **Dialogs:** native `<dialog>` with accessible names; Escape; focus return. Good.
- **Theme toggle:** `aria-label="Switch to light theme"` describes the action; the icon is hidden. Good.
- **Copy:** `aria-live` status. Good.
- **Language:** the main AA failure. English chrome on Burmese pages inherits `my`. The author aside and next-note label are correctly `lang="en"`; copy that pattern.
- **Diagram:** `role="img"` with a generic label; the architecture list is the practical alternative. Improve the label (F14).
- **Reading progress:** hidden from AT; good.

### Reduced motion

Measured behavior under `prefers-reduced-motion: reduce`:

- Theme switch: instant; no view transition.
- Reveals: start at full opacity; no slide.
- Name swell: disabled.
- Anchor scroll: native/instant.
- Header/card/press springs: the shared spring library finishes instantly.
- Photo dialog close: **~0.3ms** (instant).
- Normal photo close: **~734ms**; theme transition: **~900ms**; no blank frames.

One inconsistency: under reduced motion, the anchor fallback does not move focus to the target section (F25). The native anchor scrolls, but focus stays on the nav link. Move the focus logic before the reduced-motion early return.

---

## 5. Contrast

| Token / element | Dark | Light | Verdict |
|---|---:|---:|---|
| Body text | 18.7:1 | 18.7:1 | Pass |
| Muted text | 7.4:1 | 7.4:1 | Pass |
| Faint text | ~5.2:1 | **4.63:1** | Pass AA; borderline for 12–14px meta (F17) |
| Focus ring | 11.2:1 | 5.1:1 | Pass |
| Diagram shape fills | 18.49:1 | 16.97:1 | Pass |
| Diagram text | Light `fill` | Dark `fill` | Pass; earlier “dark-on-dark” claim was false |

The diagram check matters: the SVG uses `fill`, not CSS `color`. A naive computed-style audit reports the wrong value. The pixel/computed-fill check passes in both themes.

---

## 6. Dialogs

### Photo viewer

- Native `<dialog>`; `showModal()`.
- Close button focused on open; Escape closes; focus returns to the opener.
- Backdrop click closes.
- Arrow keys navigate; caption and count update; `aria-busy` while loading.
- Close animation ~734ms normal; ~0.3ms reduce.
- `<img>` without `src` in the closed dialog — invalid markup, not user-visible (F11).
- Reduced motion is honored; do not report a failure.

### Diagram viewer

- Native `<dialog>`; close button; Escape; focus return.
- Dialog fits the viewport at 390; the 1,024px SVG pans inside.
- The “Enlarge” button is visible on mobile (157×44); the earlier “hidden” claim was false.
- The desktop button hit area spans the row (F12).

---

## 7. Tap targets

| Control | Size | Verdict |
|---|---|---|
| Header nav links | ≥44×44 | Pass |
| Theme toggle 320 | 41×44 | Pass 24; 3px below 44 design target |
| Theme toggle 1024 | **17×44** | At risk for 2.5.8; fail 2.5.5 |
| Theme toggle 1100+ | 44×44 | Pass |
| Wordmark | 91×44 (text); hit area 584–748 | Target large; focus geometry wrong (F3) |
| Hero email/copy/GitHub | 44 | Pass |
| Project rows | Full-row link | Pass |
| TOC/rail links | 44 | Pass |
| Photo controls | 44 | Pass |
| Diagram close | 44 | Pass |
| “Enlarge” | 157×44 mobile; 1,228×44 desktop | Target large; desktop hit area too wide (F12) |
| Footer links | 44 | Pass |

---

## 8. Mobile case study specifics

- At 390: technology rail y≈1348, challenge y≈1681.
- “On this page” hidden below 768.
- Page height 5,145–5,643px for the sampled projects.
- Diagram 704px wide in a 348px scroller; labels 16px; horizontal scroll expected.
- “Enlarge” 157×44; dialog fits; SVG 1,024px pans.
- No horizontal page overflow.
- The story is readable; the navigation is missing. F4.

---

## 9. Test gaps

- No manual VoiceOver/NVDA session; semantics/ARIA were inspected, not heard.
- No Safari/Firefox; `dialog`, `view-transition`, and `animation-timeline` behavior may differ.
- No 200% zoom / text-spacing override / forced-colors / Windows High Contrast manual pass.
- No Burmese screen-reader pronunciation test.
- No real-user sessions; the personas are hypotheses.
- No automated axe/Lighthouse run in this study; the detector covered static issues, not the full a11y tree.

**Recommended next test:** one 30-minute session with a screen-reader user on (a) home → Work → case study, (b) Burmese note → TOC → next, (c) photo dialog open/close, (d) 200% zoom at 1024.

---

## 10. Fix order

1. **F1** — header stays visible after anchor jumps.
2. **F3** — 1024px header geometry; toggle ≥44; wordmark `w-fit`.
3. **F9** — `aria-current` home-only scroll-spy.
4. **F10** — exclude `[tabindex="-1"]` from the focus outline.
5. **F5** — `lang="en"` on byline/TOC/Topics/English runs.
6. **F4** — mobile case-study TOC and rail order.
7. **F8** — article measure.
8. **F7** — 404 hierarchy.
9. **F11** — photo viewer markup.
10. **F12** — enlarge button width.
11. **F14** — diagram description.
12. **F17** — faint text nudge.
13. **F27** — Topics semantics.
14. **F25** — reduced-motion anchor focus.

The first four are small code changes and remove most of the accessibility risk.
