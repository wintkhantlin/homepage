---
target: src/pages/index.astro
total_score: 16
max_score: 28
na_heuristics: 7,9,10
p0_count: 0
p1_count: 3
timestamp: 2026-08-28T07-38-05Z
slug: src-pages-index-astro
---
### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|:-----:|-----------|
| 1 | Visibility of System Status | 2/4 | Hash section anchors (`#projects`, `#writing`, `#about`) have no active navigation state in the header. Theme mode is communicated correctly. Footer dock running dots are too subtle to read as navigation state. |
| 2 | Match System / Real World | 2/4 | `lucide:play` icon on a `mailto:` CTA is wrong — play is a universal media symbol. "Start a project with me" reads agency-freelance rather than engineer-open-to-opportunities. Nav label "Story" for the bio section doesn't match the anchor `#about` or the content. |
| 3 | User Control and Freedom | 3/4 | Navigation is simple and link-based. The tech marquee pauses on hover and respects `prefers-reduced-motion`. Touch users cannot pause it. |
| 4 | Consistency and Standards | 2/4 | Four incompatible button/CTA paradigms on one page: (1) glossy 3D bevel pill with play icon in Hero; (2) flat monochrome pill in Projects; (3) full-viewport structural colour inversion in Footer; (4) macOS Aqua coloured gradient dock tiles. These are design systems from four different eras and aesthetics. |
| 5 | Error Prevention | 3/4 | Mailto links have no preset subject/body. Minor. |
| 6 | Recognition Rather Than Recall | 2/4 | Footer dock is icon-only until hover — tooltips only appear on pointer devices. Award photography in RecognitionSection is entirely invisible on mobile (display: none below 900px). |
| 7 | Flexibility and Efficiency | n/a | Not applicable: linear portfolio reading surface. |
| 8 | Aesthetic and Minimalist Design | 2/4 | The editorial restraint in the middle sections (Projects, Writing) is real and earns attention. It is undermined by the glossy hero button, radial glow, moving tech marquee, and the elaborate dock. Each novelty element competes with the next. |
| 9 | Error Recovery | n/a | No user input flows exist on this surface. |
| 10 | Help and Documentation | n/a | Not applicable to a portfolio surface. |
| **Total** | | **16/28** | **Acceptable (57%) — Strong middle, weak framing at entry and exit** |

---

### Design Specificity Verdict

**Partially authored — the middle third is unmistakably Wint's; the opening and close belong to a template.**

**LLM Assessment**: The `ProjectsSection` and `WritingSection` are genuinely specific: maturity badges (`Built / Prototype / Work in progress`) surface the engineering lifecycle rather than hiding it; bulletted `proofPoints` pair technical decisions (Redis caching layer, distributed queue) alongside role labels; the `isMyanmar` Unicode detection in `PostCard.astro` quietly surfaces bilingual authorship to sighted readers. These patterns are authored for Wint's actual practice, not retrofitted.

But the page opens and closes in borrowed language. The hero is a single `<h1>` sentence — *"Hey! I'm Wint Khant Lin, a software engineer building reliable systems for useful products"* — followed by a glossy 3D pill with a play icon. The phrase is true but indistinguishable from a thousand portfolio templates. The surface brief promised a *"staggered composition where Wint's name settles"* — there is no compositional idea in the hero, only typography on a radial glow. The footer is a full macOS Aqua dock simulation: seven coloured gradient tiles with gloss-shine pseudo-elements, drop shadows, proximity magnification physics — a component from a "CSS things I built for fun" repository, not a quiet editorial close.

**Deterministic Scan (Assessment B)**: 2 findings confirmed on `dist/index.html`:
- `marquee` — `.tech-carousel-track` infinite loop animation. **Assessment B verdict: partial false positive** — full `prefers-reduced-motion` support, hover-pause, mobile static fallback, and sr-only text labels all implemented correctly. The issue is strategic rather than technical.
- `overused-font` — Plus Jakarta Sans in CSS fallback string. **Partial false positive** — `--font-heading` resolves to Plus Jakarta Sans from Astro's font system; the bespoke `LT Superior Serif` carries all display headings. Mitigated but worth reviewing.

Additionally, Assessment B found two genuine **accessibility-blocking issues not caught by the detector**:
- Three duplicate `<a>` elements per project card (image link + heading link + "Read case study" button) all pointing to the same URL — screen readers announce three consecutive same-URL links.
- `<li tabindex="0">` elements in RecognitionSection have no `role` or `aria-label` — focusable without an announced role or action.

---

### Overall Impression

The portfolio is two-thirds excellent and one-third distraction. The project proof points, bilingual writing markers, and typographic discipline are genuinely distinctive work. Strip the novelty wrapper — the 3D button, the dock, the marquee — and a confident, high-craft editorial portfolio appears underneath. The biggest opportunity is making the first and last things a visitor sees as strong as what sits between them.

---

### What's Working Well

1. **Proof-first project architecture**: `ProjectsSection.astro` surfaces maturity, context, and concrete engineering decisions before requiring a click. This is rare and earns credibility with technical evaluators in under 30 seconds.
2. **Bilingual craft signals**: The `isMyanmar` Unicode check in `PostCard.astro` and the explicit Myanmar location context in the bio are authentic differentiators. They give the site a genuine place in the world rather than a generic developer portfolio floating in a vacuum.
3. **Motion and accessibility discipline**: Comprehensive `prefers-reduced-motion` coverage across all animated elements, visible `:focus-visible` styling, skip link, forced-colors fallback, ARIA labels on external links, and structured JSON-LD schemas. This is production-quality engineering hygiene.

---

### Priority Issues

#### 🔴 [P1] Three identical links per project card break screen readers
- **What**: In `ProjectsSection.astro`, each project card renders an image `<a>`, an `<h3>` `<a>`, and a "Read case study" `<a>` — all pointing to the same `/project/${project.id}` URL. Screen reader users hear three consecutive links with the same destination.
- **Why it matters**: This fails WCAG 2.4.4 (Link Purpose). A screen reader user scanning headings or links cannot distinguish these from genuine navigation options. This is a blocking accessibility issue.
- **Fix**: Wrap the image and heading in a single `<a>`. The "Read case study" pill button can remain as a second (visually distinct) action, or carry `aria-hidden="true"` if the heading link already has sufficient label context.
- **Suggested Command**: `/impeccable harden`

#### 🔴 [P1] macOS Dock and skeuomorphic Hero CTA shatter the editorial identity
- **What**: `Footer.astro` renders a full macOS Aqua simulation — coloured gradient icon tiles, drop shadows, gloss pseudo-elements, proximity magnification physics, and running indicator dots. `HeroSection.astro` renders a 3D bevel button (`inset 0 1px 0 rgba(255,255,255,0.52)`, `0 4px 0 #3b3b3b`) with a media play icon pointing to a mailto link. Both are elaborate novelty components that belong in a CSS showcase, not a quiet editorial systems portfolio.
- **Why it matters**: For a hiring manager scanning the page in 45 seconds, the dock reads as a demo of Wint's interest in skeuomorphic UI rather than evidence of backend systems engineering depth. It also visually competes with the substantial project proof immediately above it.
- **Fix**: Replace the dock with a minimal editorial colophon — typography credits, stack note, social links as clean text or understated icon pairs, a quiet copyright line. Refactor the hero CTA to a flat monochrome pill matching the project buttons, with `lucide:mail` or `lucide:arrow-right`.
- **Suggested Command**: `/impeccable layout`

#### 🔴 [P1] Award photography is invisible on all touch and mobile devices
- **What**: In `RecognitionSection.astro`, `.award-preview` is gated to `@media (min-width: 900px) and (hover: hover) and (pointer: fine)`. Below 900px or on any touch device, the photos are `display: none` with no fallback. The hackathon wins are text-only rows on mobile.
- **Why it matters**: The GUSTO gold medals and winner-pose photographs are the most visually compelling proof of capability on the page. Mobile visitors — likely over 50% of traffic — see none of it. This is not a progressive-disclosure pattern; it's accidental omission.
- **Fix**: Add a small inline thumbnail strip (3 images, ~5rem tall) below the text rows on mobile. It doesn't need to be interactive — static images visible to all viewports is the baseline requirement.
- **Suggested Command**: `/impeccable adapt`

#### 🟡 [P2] Hero copy and CTA icon miscommunicate Wint's positioning
- **What**: "Start a project with me" + `lucide:play` reads as a freelance design or video agency CTA. Wint's actual positioning (backend systems engineering, hackathon builder in Myanmar, learning in public) is invisible above the fold. The first viewport conveys: *cheerful greeting → agency pitch*.
- **Why it matters**: A technical recruiter or engineering manager spending 45 seconds on the page will not scroll to the projects section if the above-the-fold signal is mismatched with the role they're hiring for.
- **Fix**: Rewrite copy to a one-line engineering statement (*"Get in touch"*, *"Email me"*, or *"Discussing roles and projects"*) with `lucide:mail`. Consider whether the hero can expose one architectural signal — Wint's systems focus, a current project, or the Myanmar/bilingual dimension — before the CTA.
- **Suggested Command**: `/impeccable clarify`

#### 🟡 [P2] Auto-scrolling tech marquee flattens the systems hierarchy
- **What**: 18 devicon logos scroll as an undifferentiated sequence. Go, Docker, RabbitMQ, and PostgreSQL (core systems tools) are presented at the same visual weight as Tailwind CSS, Git, and Vue.js. The loop animation is well-implemented technically (reduced-motion pause, hover pause, sr-only labels) but the content is unweighted.
- **Why it matters**: The `ProjectsSection` worked hard to establish systems engineering depth. The tech section immediately undoes it by implying equal competency across 18 tools with no hierarchy.
- **Fix**: Replace with a two or three-row categorised static grid: *Systems & Data* (Go, PostgreSQL, Redis, RabbitMQ, Docker) / *Web & APIs* (Node.js, NestJS, TypeScript) / *Tooling* (Linux, Git, Astro). No animation needed. The categorisation is the signal.
- **Suggested Command**: `/impeccable clarify`

---

### Persona Red Flags

**Jordan — Engineering Manager or Technical Recruiter (45-second scan):**
- Opens the page: sees a cheerful greeting, a glossy button saying "Start a project with me" with a play icon. Reads as freelance design or content creation.
- Scrolls past the hero glow: sees "Selected work" in a large serif — this lands well. Reads proof points — good, credible.
- Reaches the footer: encounters a macOS dock. Wonders if Wint is a UI component developer.
- Net signal: talented but unclear specialisation, possibly a freelancer.

**Alex — Open Source Peer looking for GitHub link:**
- Scrolls past hero: no GitHub link in the header.
- Reaches the footer: sees seven tiles, none labelled. Hovers to find "GitHub". On touch, can't find it at all.
- Checks header: only Work, Notes, Story, theme toggle. No GitHub.
- GitHub link is only discoverable via the footer dock — unlabelled on touch, tooltip-only on desktop.

**Casey — Mobile Visitor:**
- Lands on hero: reads "Hey, I'm Wint. I build useful software." (mobile variant) — shorter and less distinctive.
- Scrolls to Recognition: sees "First runner-up, GUSTO Innovation Awards" — text only. No photos. No visual proof.
- Scrolls to About: reads a dense 2-column 18-row tech list. No hierarchy visible.
- Reaches the footer: dock is layout-stable on touch but completely unlabelled (no hover tooltips on touch).

---

### Minor Observations & Small Details

1. **Hero viewport over-emptiness**: `min-h-[100svh]` + `items-end` + `pb-20` pushes all content to the bottom of the viewport. On 1440p+ screens, the upper 70% of the hero is a radial glow and nothing else. The brief describes a *staggered composition* — this is not it.
2. **`--font-display` loaded but unused on the homepage**: `LT Superior Serif` is loaded via `astro.config.mjs`. The `font-serif` Tailwind class resolves to this only if `--font-display` is mapped to the serif slot. In `global.css`, `--font-sans` and `--font-mono` are defined, but no explicit `--font-serif` mapping is set. Astro's font system writes the CSS variable, but Tailwind's `font-serif` references the browser default serif unless explicitly remapped.
3. **Date format inconsistency across three sections**:
   - Projects: year only (`2026`)
   - Posts: `Aug 28, 2026` (US locale, `en-US`, short month + 2-digit day)
   - Recognition: `August 2026` (full month, no day)
   - These three formats for temporal data on one page is a small but visible editorial inconsistency.
4. **Duplicate `<h2>` with `sr-only` in AboutSection**: The visible heading hierarchy jumps from `Selected work` → `Notes & writing` → [no visible h2] → `Let's talk.`. Screen readers get `About Wint Khant Lin` from the sr-only element; sighted visitors see no section break or label. This creates a different structural experience between modalities.
5. **`!important` overrides in `.invert-on-hover`**: `color: var(--bg) !important; border-color: var(--bg) !important;` applied to all descendants risks overriding nested SVG fill colours, badge tokens, or any custom-coloured child added in future.
6. **Raw hex `#bdbdbd` on CTA icon**: The `.hero-cta-icon` icon colour (`color: #bdbdbd`) is outside the token system. All other text colours use `var(--text-*)` tokens.
7. **`will-change: transform` permanently on carousel track**: This holds an unnecessary GPU compositing layer even when the animation is paused or in `prefers-reduced-motion` mode (where the rule `will-change: auto` is set — correct — but only inside the media query, not at reset).
8. **`font-weight: 650` in dock tooltip**: Variable font weight `650` works only if the loaded font supports it. Plus Jakarta Sans does — but this is an implicit coupling that should be documented.
9. **View transition GIF mask at 1.4s**: A 1.4-second blocking mask animation on every theme toggle is disproportionate for a portfolio that values performance. 0.5–0.7s would feel snappy rather than loading-state-slow.
10. **`object-contain` on project images**: If any project image is not 16:9, `object-contain` will produce letterboxing with colour bars rather than cropping to fill. `object-cover` is safer for a gallery grid.

---

### Questions to Consider

1. *"If the hero had to convey Wint's systems focus and Myanmar context within 2 seconds — no scrolling — what would be there instead of the radial glow?"*
2. *"What if the last thing a visitor saw was a quiet, confident editorial close — the site's stack, typography credit, city of origin — instead of an imitation of Apple's dock?"*
3. *"The site celebrates Wint writing Big-O notation explainers in Burmese. What would a site look like that made that bilingual technical voice structurally visible, not just a badge in a post card?"*
