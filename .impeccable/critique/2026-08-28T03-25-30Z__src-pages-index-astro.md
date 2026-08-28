---
target: the landing page
total_score: 16
max_score: 24
na_heuristics: 5,7,9,10
p0_count: 0
p1_count: 3
timestamp: 2026-08-28T03-25-30Z
slug: src-pages-index-astro
---
# Homepage Design Critique

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---:|---|
| 1 | Visibility of System Status | 2 | Theme state is communicated, but homepage hash sections never receive an active navigation state. |
| 2 | Match System / Real World | 3 | Language is clear, but the play icon misrepresents an email action and the project CTA arrives before trust is established. |
| 3 | User Control and Freedom | 4 | Browsing is simple, link-based, and free of trapping flows. |
| 4 | Consistency and Standards | 2 | Editorial rows collide with a glossy CTA, neon glow, animated logo strip, and macOS-like dock. |
| 5 | Error Prevention | n/a | No meaningful input or destructive workflow exists on this surface. |
| 6 | Recognition Rather Than Recall | 3 | Header labels and project actions are explicit; the footer becomes icon-led and tooltip-dependent. |
| 7 | Flexibility and Efficiency | n/a | Not materially applicable to an Experience-mode portfolio. |
| 8 | Aesthetic and Minimalist Design | 2 | Strong spacing and restraint are diluted by effects that compete with the work. |
| 9 | Error Recovery | n/a | No error-producing workflow exists on this surface. |
| 10 | Help and Documentation | n/a | Not materially applicable to an Experience-mode portfolio. |
| **Total** | | **16/24** | **Acceptable foundation; substantial identity alignment needed** |

## Design Specificity Verdict

**Partially authored, visually inconsistent.** The content is unmistakably Wint's: real product screenshots, architecture-oriented case studies, bilingual writing, Myanmar context, and personal photography. The homepage does not turn that evidence into an equally distinctive composition. Its middle belongs to Wint; its opening and closing could belong to almost any developer portfolio.

The implementation also contradicts the recorded direction: a quiet off-white editorial canvas becomes dark by default; the promised staggered-name hero becomes a generic sentence; five projects replace the curated four; personal photography is absent; and the concise “Say hello.” close becomes a colorful OS-style dock.

The deterministic scan found **0 issues** across `src/pages/index.astro` and the four homepage section components. This is useful evidence that the page avoids the detector's known anti-patterns, but it does not invalidate the higher-order problems of specificity, hierarchy, and art-direction coherence. There were no detector false positives. Browser overlays were unavailable because the browser runtime returned `No browser is available`; no reliable user-visible overlay exists.

## Overall Impression

This is a technically mature, content-rich portfolio wearing three incompatible costumes. The editorial project and writing sections are the strongest layer. The glossy hero CTA, moving brand-logo strip, and macOS-like dock pull attention away from the artifacts and weaken the quiet, systems-oriented authority the page should project. The largest opportunity is to make the homepage itself demonstrate Wint's systems thinking rather than merely naming it.

## What's Working

- **Real artifacts carry credibility.** Screenshots connect directly to case studies and source code, giving both hiring teams and peers useful proof.
- **The information architecture serves two audiences.** Case studies support evaluation; source links and writing support technical discovery. Dates, project types, reading time, Burmese labeling, and empty states are thoughtful.
- **The accessibility baseline is strong.** Semantic headings, skip navigation, visible focus, generous targets, reduced-motion handling, meaningful link labels, and hidden duplicate carousel content are all present.

## Cognitive Load and Emotional Journey

Cognitive load is moderate. The main reading path is clear, but the header presents six simultaneous actions, the footer seven icon actions, and the 18-logo marquee demands attention without improving evaluation. Progressive disclosure breaks down after the writing section.

The opening feels competent but generic. The project screenshots create the strongest rise in credibility. The page then falls into an emotional valley through similarly weighted writing rows, four bio paragraphs, and the logo marquee. The large contact invitation begins a strong ending, but the colorful dock becomes the final visual memory; by the peak-end rule, visitors may remember an Apple-interface imitation more than Wint's engineering judgment.

## Priority Issues

### [P1] The homepage does not implement its defining art direction

**Why it matters:** The promised memorable moments are absent, so the page cannot earn distinctiveness through composition.

**Fix:** Make the neutral off-white canvas the authored default; compose “Wint / Khant / Lin” across the grid; curate four projects; use 2–3 personal images as the About rhythm break; close with the concise “Say hello.” invitation.

**Suggested command:** `$impeccable shape`

### [P1] Systems depth is stated, not demonstrated in the scan path

**Why it matters:** Wint's strongest differentiator is hidden one click deep. At homepage speed, the cards communicate familiar screenshots, descriptions, and stack labels.

**Fix:** Replace generic stack emphasis with one systems proof per project—an architecture boundary, reliability constraint, asynchronous workflow, or infrastructure decision. Vary the repeated 7/5 layout with diagram crops, event-flow excerpts, and architectural annotations.

**Suggested command:** `$impeccable layout`

### [P1] Four visual languages compete for authorship

**Why it matters:** Editorial serif sections, a glossy skeuomorphic CTA, green radial glow, multicolor Devicons, and a macOS dock feel assembled rather than directed.

**Fix:** Preserve the editorial grid and real artifacts; flatten the hero action; reduce accent effects; convert technologies to quiet text metadata; replace the dock with restrained textual contact and social links.

**Suggested command:** `$impeccable quieter`

### [P2] The human story arrives as an undifferentiated text block

**Why it matters:** Four equal 15px paragraphs create a scanning and emotional valley even though personal photography is already available.

**Fix:** Edit the biography to one strong statement and one supporting paragraph, then introduce an asymmetric photo sequence with concise factual captions.

**Suggested command:** `$impeccable layout`

### [P2] Navigation is duplicated and weaker at the end and on mobile

**Why it matters:** The footer repeats existing routes as seven icon tiles; the mobile header hides the contact CTA; and the dock can become horizontally constrained while relying on visual tooltips.

**Fix:** Keep one compact textual footer navigation with email, GitHub, and LinkedIn; preserve a visible mobile contact path; add current-section treatment for Work and Story if the fixed header remains.

**Suggested command:** `$impeccable adapt`

## Persona Red Flags

- **Jordan, first-time hiring reviewer:** The mobile headline drops both “software engineer” and “reliable systems.” “Start a project with me” asks for commitment before proof, and its play icon suggests media rather than email. Jordan cannot quickly distinguish backend engineer, generalist, student, or consultant.
- **Riley, deliberate technical evaluator:** “Selected work” renders every project at equal weight even though maturity ranges from work in progress to open source and hackathon work. Riley must open every case study to verify scope and architecture.
- **Casey, distracted mobile visitor:** Five full project rows delay writing and About; contact disappears from the mobile header; the moving logo strip adds attention cost; and the final dock is visually unlabeled and dense.

## Minor Observations

- The brief specifies four selected projects; the component maps all five.
- `--font-display` is loaded, but the shown theme does not map it; serif headings may be using the default serif stack.
- Project image alt text says only “product interface”; describe the actual screen shown.
- Sighted visitors must recognize technology logos while names remain screen-reader-only.
- “Love for over-engineering side projects” is personable but may imply weak scope discipline unless the copy immediately explains the learning value.
- The source implementation shows good defensive empty states and reduced-motion behavior.

## Questions to Consider

- What if the hero paired Wint's name with one architectural proposition and brought the first artifact into the initial viewport?
- Which four projects prove distinct systems capabilities rather than merely being the newest?
- If every glossy, colorful, and continuously animated element disappeared, would the work and photography create a stronger identity?
- Should the final emotional memory be an imitation OS dock or a direct invitation from Wint?
