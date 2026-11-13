# 03 — Journeys and Information Architecture

---

## 1. Information architecture

```text
/  Home
├── Hero ................ name, role, email, copy, See the work, GitHub
├── #projects .......... Selected work (4 of 5) → /projects
│   └── #recognition ... Competition results (owned by Work in the nav)
├── #writing ........... Notes (3) → /writing
├── #about ............. About brief → /about
└── Footer ............. Say hello, contact, site links, back to top

/projects  Work index (5)
└── /project/[slug]  Case study
    ├── Hero: name, description, facts, GitHub, image
    ├── Engineering highlights (2 proof points)
    ├── The challenge
    ├── The approach
    ├── System architecture (full-bleed diagram + text list)
    ├── How it is structured
    ├── What it includes
    └── Next case study

/writing  Notes index (3)
└── /post/[slug]  Note
    ├── Back link (origin-aware)
    ├── Byline, title, topics, description
    ├── Table of contents
    ├── Body
    ├── About the author
    └── Next note

/about  Profile
├── Story (2 paragraphs)
├── Facts (role, location, focus, languages, elsewhere)
├── Tools & technologies (5 groups)
└── Profiles (GitHub, LinkedIn)

/404  Recovery
├── 404 marker
├── H1 message
└── Back to home / See the work / Read the notes
```

### Navigation model

- **Global header:** Work, Notes, About, Say hello, theme toggle.
  - On `/`, Work/Notes/About are in-page anchors to `#projects`, `#writing`, `#about`.
  - On interior pages they are links to `/projects`, `/writing`, `/about`.
- **Global footer:** Say hello, email + copy, GitHub, LinkedIn, site links, back to top.
- **Home section exits:** “View all work” → `/projects`; “All notes” → `/writing`; “More about me” → `/about`.
- **Case study:** sticky “On this page” rail (desktop), technology list, diagram, next case study.
- **Note:** origin-aware back link, TOC, reading progress, author aside, next note.
- **Recovery:** 404 has three explicit routes back.

The global model is sound. The home anchors are not dead ends: each section has a visible exit. This is a correction to an earlier draft assumption.

---

## 2. Journeys

### J1 — First-time hiring scan (Priya)

| Step | What she sees | Friction |
|---|---|---|
| Land on `/` | Full-viewport hero; name, role, email, “See the work,” GitHub | The primary evaluation path (“See the work”) is the quietest of four actions |
| Scroll to Work | Four selected projects with images, stack, proof points, “View all work” | None; strong |
| Open a case study | Hero, facts, image, GitHub, **Engineering highlights**, then challenge | Proof arrives before the problem; the page is 5.1–5.6k on mobile |
| Read the case study | Challenge, approach, architecture, structure, includes | No outcome, reflection, duration, team, or “what I’d do differently” |
| Check About | Story, facts, tools, profiles | No availability, timeline, role target, or résumé |
| Contact | Footer “Say hello.” + email/GitHub/LinkedIn | Clear, but the case study never lands on a reason to write |

**Verdict:** the scan builds confidence, then loses the argument at the point of proof. The missing case-study reflection and the About hiring gap are the two biggest conversion leaks.

### J2 — Peer deep read (Min)

| Step | What he sees | Friction |
|---|---|---|
| Open a case study | Facts, GitHub, proof points, challenge | Proof before problem |
| Architecture | Full-bleed diagram, text list, sticky rail | Strong; diagram has only a generic `role="img"` label |
| Approach | Asynchronous design, provider isolation, gateway | Good; no explicit tradeoff or alternative considered |
| End | “What it includes” + next case study | No “what I’d change,” no code walkthrough, no demo |
| Notes | Two Burmese notes + one 2025 goals note | No English technical note; RSS exists but is not linked |

**Verdict:** the architecture is the strongest part of the site. A peer can learn from it. The missing reflection is what separates “a good project page” from “a senior engineer’s case study.”

### J3 — Burmese reader (Ko Aung)

| Step | What he sees | Friction |
|---|---|---|
| Notes index | Cards with “Burmese · X min read” and `lang="my"` titles | Good; the language is clear |
| Open a Burmese note | `<html lang="my">`; Burmese title/body; English byline, TOC, topics | English UI strings inherit Burmese; screen readers mispronounce them |
| TOC | “On this page,” “3 sections,” “Table of contents” | English labels unmarked; the TOC is desktop-first at 1280+ |
| Body | Burmese with English technical terms | Inline English runs are not marked |
| Next | “Next note” is correctly `lang="en"` | Good; this is the pattern to copy |

**Verdict:** the content language is handled well at the card level and in the author aside. The chrome is the gap. The fix is targeted, not a rewrite.

### J4 — Keyboard / screen reader (Alex)

| Step | What happens | Friction |
|---|---|---|
| Skip link | Visible on focus; jumps to `#main-content` | Good |
| Header | Tab 1 lands on the wordmark with a **748×44px** focus ring | Looks like the whole header is one link |
| Nav | Work → Notes → About → Say hello → theme | Logical; theme is 17×44 at 1024 |
| Anchor jump | Work click scrolls to `#projects`; header hides; focus lands on the section with a **1,216×1,593px** ring | Nav is off-screen; the ring is disorienting |
| Case study | Diagram frame is focusable and arrow-scrollable | Good |
| Dialogs | Native `<dialog>`, Escape, focus return | Good |
| `aria-current` | `/projects` and `/about` say `location`; `/writing`, `/project/*`, `/post/*` say `page`; footer says `page` | Inconsistent current-page semantics |
| Burmese note | English UI strings inherit `my` | Language-of-parts failure |

**Verdict:** the fundamentals are present. The failures are specific and fixable: focus geometry, header stability, current-state consistency, language marking.

### J5 — Mobile case study (Priya/Min on a phone)

| Step | What happens | Friction |
|---|---|---|
| Open `/project/gencourse` at 390 | Hero, facts, image, GitHub | Good |
| Scroll | **Technology rail** at y≈1348, then “The challenge” at y≈1681 | Metadata before the story |
| Look for the map | “On this page” is hidden below 768 | No way to jump |
| Diagram | 704px SVG inside a 348px scroller; “Enlarge” is visible (157×44) | Scroll is expected; the dialog fits and the SVG pans |
| Finish | 5,145–5,643px page | Long without a jump menu |

**Verdict:** the mobile case study is readable but not navigable. The rail order and the missing TOC are the fix.

### J6 — Recovery (404)

| Step | What happens | Friction |
|---|---|---|
| Land on `/404` | 72px “404” above a 20px “This page doesn’t exist” | Visual hierarchy is inverted |
| Read | Clear message and three routes back | Good recovery |
| Navigate | Back to home / See the work / Read the notes | Clear |

**Verdict:** recovery is good; the visual hierarchy is the only issue.

### J7 — Theme

| Step | What happens | Friction |
|---|---|---|
| Toggle | Label updates at ~60ms; mask transition settles ~900ms | No blank; the transition is a deliberate brand moment |
| Persist | `localStorage`; no flash | Good |
| Reduced motion | Instant; no view transition | Good |
| Light theme | Complete; faint text 4.63:1 | Passes AA; borderline for small meta |

---

## 3. Emotional journey

| Stage | Feeling | Why |
|---|---|---|
| Arrival | **Confidence** | The hero is composed, specific, and calm. The name and role are immediate. |
| Work | **Curiosity** | The rows are rich; the proof points are concrete; the images carry weight. |
| Case study | **Momentum → deflation** | The architecture is strong, but proof precedes the problem and the page ends before “what changed.” |
| About | **Context → hesitation** | The story and tools are credible, but there is no availability or role target. |
| Contact | **Clarity** | The footer is a consistent, generous close. |
| Notes | **Immersion → language break** | Burmese content is well labeled; the English chrome breaks the language frame. |
| 404 | **Smile → squint** | The voice is good; the hierarchy makes the error code louder than the message. |

The site’s emotional arc is “calm confidence → strong evidence → unfinished argument.” The missing ending is content, not visual design.

---

## 4. Where it breaks

| Break | Finding | Evidence |
|---|---|---|
| Header disappears after using the nav | F1 | Click Work at scroll 500 → scrollY 924; header `top:-72`, `data-hidden`; only ~100px up restores |
| Case-study proof precedes the problem | F2 | “Engineering highlights” renders before “The challenge” |
| Case-study promise is unfulfilled | F2 | Index says “what I learned building them”; project bodies are 0 words; no outcome/reflection |
| Header geometry at 1024 | F3 | Theme toggle 17×44; wordmark 584px |
| Mobile case study has no map | F4 | “On this page” hidden below 768; technology rail before challenge; 5.1–5.6k pages |
| Burmese UI language | F5 | `<html lang="my">`; byline/TOC/Topics unmarked; author aside correctly `lang="en"` |
| About stops before the hiring decision | F6 | No availability/timeline/role target/résumé |
| 404 hierarchy | F7 | 72px `<p>` above 20px `<h1>` |
| Article measure | F8 | 77 characters at 1440 |
| `aria-current` drift | F9 | `location` on `/projects`/`/about`; `page` elsewhere; footer `page` |
| Giant section focus ring | F10 | 1,216×1,593px outline |
| Diagram alternative | F14 | Generic `role="img"` label; architecture list is the de facto alternative |

---

## 5. What works

- **Home section exits.** “View all work,” “All notes,” and “More about me” are present and visible. The home is not a dead end.
- **Origin-aware back links.** Case studies and notes return to where the reader came from.
- **Case-study rail.** The desktop “On this page” + technology rail is a strong reading aid.
- **Full-bleed diagrams.** The architecture is the visual and intellectual center; the frame is keyboard-scrollable.
- **Language labels.** “Burmese · X min read” and `lang="my"` on titles/excerpts are exactly right.
- **Footer close.** “Say hello.” + contact on every page is a consistent conversion moment.
- **Theme system.** Persistent, complete, reduced-motion aware, with a distinctive transition.
- **Accessibility fundamentals.** Skip link, landmarks, one h1, focus styles, native dialogs, focus return, no overflow at 320/390/1440.

---

## 6. Naming drift

| Family | Labels in use | Recommendation |
|---|---|---|
| Work | Work / Selected work / View all work / All work / Explore the project / See the work | Use **Work** for destinations, **Selected work** for the home subset, **View project** for rows, **All work** for the back link. |
| Notes | Notes / All notes / Next note | Consistent; keep. |
| About | About / More about me | Consistent; keep. |
| Project | Case study / project / work | The page title is the project name; the index calls them projects; the copy calls them case studies. Pick one in navigation, keep “case study” for the artifact. |

The work family is the only meaningful drift. It is a P3 consistency issue, not a blocker.

---

## 7. `aria-current` note

The header server-renders `aria-current="page"` for the active section. The scroll-spy then overrides it with `location` on pages that happen to contain `#projects` or `#about`:

- `/projects` → Work becomes `location` (scroll-spy finds `#projects`).
- `/about` → About becomes `location` (scroll-spy finds `#about`).
- `/writing`, `/project/*`, `/post/*` → stay `page` (no matching section).
- Footer → always `page`.

The fix is one guard: run `trackActiveSection()` only when `location.pathname === "/"`. That restores `page` on interior pages and keeps `location` for home sections.
