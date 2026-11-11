# Assessment A — Independent Design & UX Review

**Site:** Wint Khant Lin portfolio (`http://localhost:4321`)
**Surface reviewed:** Experience — home, work index, case study, notes index, note, about, 404
**Date:** 11 November 2026
**Reviewer:** Independent assessment A (design/UX)
**Method:** Source-first review, then live measurement in Chrome via Playwright

---

## 1. Method and scope

I read the site's source before looking at the rendered site: every page in `src/pages`, the shared layout and header/footer, home sections, case-study components, design tokens and global CSS, content collections, and all five project files and three posts. I then measured the live site at 320, 375, 390, 768, 820, 1024, 1280, 1440, and 1920px widths, including keyboard tab order, focus rings, theme persistence, the copy-email control, the diagram dialog, and `prefers-reduced-motion`.

I did **not** run the project's detector, read `ux-detector-raw.json`, `ux/evidence/audit.json`, `ux/evidence/focused.mjs`, or any prior critique snapshots. Scores and observations below are my own, derived from source and live behavior. Contrast ratios were computed from the token values; no automated audit tool was used.

**Not evaluated:** real user research (the personas are hypotheses drawn from the product brief, not interviews), analytics, server performance, SEO ranking, and content accuracy beyond what the repository states. Nielsen heuristics 7 (Flexibility & efficiency) and 10 (Help & documentation) are marked n/a — see §3.

**Product brief used as the standard:** `PRODUCT.md` — mixed audience of hiring teams and developer peers; differentiation on systems depth; success measured by whether a visitor can quickly understand what he builds, how he thinks, and why to contact him; "support both evaluation and discovery without forcing a single audience path."

---

## 2. Design specificity verdict

**Verdict: authored at the surface, generic at the substance.**

The first five seconds are unmistakably this person's site. The hero is a real composition, not a template: the name is set as three staggered lines with the alias tucked in as a whisper, the lede and actions sit beside the last line, and the letters answer the pointer on springs. The index rows, the case-study rail with its full-bleed diagram, the theme-mask animation, and the "Winner Nominee" stamp all read as decisions someone made. The craft is consistent: rules instead of cards, one accent, a type scale that holds at every width, and motion that respects `prefers-reduced-motion`.

But move one layer down and the specificity thins out. The palette (warm off-white / near-black with a lime accent), Plus Jakarta Sans, mono eyebrow labels, pill buttons, and rounded-2xl screenshots are the current default costume of the tasteful developer portfolio. The About copy — "deeply passionate," "curiosity turned into a love for over-engineering side projects," "every project I ship teaches me something new" — could be swapped onto a thousand portfolios without anyone noticing. Most importantly, the case-study spine (Challenge → Approach → Architecture → Structure → Includes) is a well-built container with no outcome inside it: no result, no scale, no team, no duration, no reflection. The site's own index promises "what I learned building them," and the project page never delivers that sentence.

So the design specificity is real where it is hardest to fake — composition, motion, editorial rhythm — and absent where it is easiest to fake: voice and evidence. The site looks like nobody else's; it does not yet *argue* like nobody else's.

---

## 3. Heuristic evaluation

Scale: 0 = unusable, 1 = major problems, 2 = notable problems, 3 = minor problems, 4 = no significant problems.

| # | Heuristic | Score | Evidence | Gap |
|---|---|---|---|---|
| 1 | Visibility of system status | **3** | Theme toggle reflects and persists state; copy-email announces "Copied" in an `sr-only` status; nav scroll-spy marks the current section on home; hover/focus states are consistent; external links carry "(opens in a new tab)" for screen readers. | No language marker on note cards, so a Burmese note is indistinguishable from an English one until opened. Mobile loses the in-page TOC entirely, so position in a long case study is only implied by scroll. |
| 2 | Match between system and real world | **3** | Plain, conversational labels ("See the work," "Say hello," "Back to all work"); dates and project facts use familiar terms; the 404 speaks like a person. | "Winner Nominee" is unexplained (award? competition? shortlist?). "Engineering highlights" arrives before the challenge, so proof points are read without the problem they answer. "Explore the project" vs "View all work" vs "See the work" name the same kind of action three ways. |
| 3 | User control and freedom | **3** | Origin-aware back link ("Back to selected work" vs "Back to all work"); dialog closes via button, backdrop, and Escape; diagram is keyboard-scrollable; theme choice survives navigation. | The "Enlarge diagram" dialog uses `min-width: 64rem`, so on a phone the enlarged view is *wider* than the screen it was meant to escape. |
| 4 | Consistency and standards | **3** | One nav pattern, one focus treatment, one link style, one accent; 44px minimum targets on primary controls; heading levels are mostly coherent. | Same destination, different names (Work / Selected work / All work / Explore the project). The 404 inverts the visual hierarchy: a 72px "404" paragraph above a 20px `<h1>`. Ordinals ("01 /") decorate proof points without aiding scan. |
| 5 | Error prevention | **3** | No forms to fail; mailto and copy-email give two paths to contact; 404 offers three recovery routes; no broken internal links found across the five projects and three notes. | No search or filter, which is correct at five projects but leaves no recovery path for someone who half-remembers a project name. Copy-email has no visible fallback instruction if the clipboard API is unavailable. |
| 6 | Recognition rather than recall | **4** | Nav is always visible; current page/section is marked; the case-study rail lists all five sections on desktop; project facts are surfaced as a `<dl>`; next-case-study link removes the need to go back. | On mobile the TOC and rail are hidden, so the reader must remember where they are in a long page. |
| 7 | Flexibility and efficiency of use | **n/a** | — | The site has five projects and three notes, no repeated power-user task, no search/filter, and no documentation workflow. A shortcut layer would be speculative, not useful. |
| 8 | Aesthetic and minimalist design | **4** | Genuinely restrained: two typefaces, one accent, generous whitespace, rules instead of boxes, no decorative gradients, no stock imagery, consistent rhythm from 320 to 1920. | Content-level redundancy undercuts the minimalism: "Engineering highlights" repeats what the case study later says; "What it includes" repeats the architecture list; index rows offer a whole-row link plus a second "Explore" affordance. |
| 9 | Help users recognize, diagnose, and recover from errors | **3** | The 404 explains what probably happened, avoids blame, and offers home / work / notes; no dead ends; error copy is human. | The giant "404" is the loudest element and the actual message is the quietest; there is no search or "try these projects" suggestion for a mistyped slug. |
| 10 | Help and documentation | **n/a** | — | This is a portfolio, not a tool. The nearest equivalents — About, project facts, and the case-study rail — are assessed under heuristics 1, 4, and 6. |

**Total: 26 / 32 applicable (81%) — band: Good (75–89).**
Bands: Excellent 90–100 · Good 75–89 · Fair 50–74 · Poor <50.

The score is held up by visual craft (h8) and findability on desktop (h6). It is held back by the same thing in three places: the site is better at *showing* than at *telling* — labels drift (h2/h4), status is thinner on mobile (h1/h6), and recovery is polite but shallow (h9).

---

## 4. Cognitive load checklist

Eight checks applied across the reviewed pages. **Pass** = no meaningful friction; **Partial** = works, but costs the reader something; **Fail** = breaks the task.

1. **One obvious primary action per screen — Partial.**
   The hero offers email, copy-email, "See the work," and GitHub in one cluster. Two of those are the same action (email) and the primary next step for a hiring visitor ("see the work") is the quietest. The project page adds GitHub, live demo, back, and next-case-study; the 404 offers three equal-weight routes with one filled button.
2. **Predictable names for the same destination — Partial.**
   Work / Selected work / All work / Explore the project / See the work all point at project content. "About" is a home section and a separate page with the same heading and the same paragraphs. "Notes" is consistent between nav, index, and home — the one naming system that holds.
3. **Content is chunked and scannable — Pass.**
   Clear h1 → h2 → h3 hierarchy, short paragraphs, a facts `<dl>`, index rows with meta/name/description/stack, and a rail that exposes the case-study shape before scrolling.
4. **Nothing essential requires memory — Partial.**
   Desktop is well supported (rail, TOC, current-section marking, origin-aware back link). Mobile hides the TOC below `md` and puts the "Technology" rail *before* the challenge, so the reader holds a tool list in working memory before knowing what the tools were for.
5. **Choices are limited — Pass.**
   No filters, no search, no modal onboarding, no cookie theatre. Five projects and three notes do not need a control panel. The theme toggle is the only persistent preference, which is the right amount.
6. **Feedback is immediate and visible — Pass.**
   Copy confirms with "Copied," theme changes instantly and persists, nav marks the current section, links and rows have distinct hover/focus states, and the dialog closes predictably.
7. **Errors are prevented and recoverable — Pass.**
   No input surfaces to fail; 404 has three exits; internal links resolve; the diagram scroller is focusable and labelled. The only soft spot is the lack of a name-based recovery path (search) on a 404.
8. **Reading order matches visual order — Fail (mobile case study).**
   At 390px the project screenshot ends around y=1107, the "Technology" aside starts at y=1348, and "The challenge" does not begin until y=1681 — 253px of metadata before the story. The diagram is 704px wide inside a 350px scroller, and the "enlarge" dialog enforces a 1024px minimum width. Visual order and narrative order disagree at exactly the width most social traffic arrives on.

**Net:** the page is calm at the top and on desktop; the cognitive cost is concentrated in the case-study mobile column and in the number of names for "work."

---

## 5. Emotional journey

**Arrival (0–5s): intrigue and confidence.** The staggered name, the alias, the quiet field, the lede in two tones — it feels considered. The pointer response is a small delight that says "someone sweated the details." At 1440×900 the hero is exactly one screen (900px) and the work heading begins at y=1048, so there is no visual promise of more; the only cue is "See the work." On a 390px phone the hero is 639px and the work heading appears at y=695, so mobile actually flows better than laptop.

**Scroll through work: calm, then admiration.** The index rows are generous and editorial; screenshots get room; the meta line (type, year, stage) answers the first questions without a click. The "Winner Nominee" mark adds a flicker of curiosity — followed by "what was it nominated for?"

**Opening a case study: momentum, then deflation.** The header is strong: big name, honest description, a facts row, GitHub as the filled action, a full-width screenshot. Then "Engineering highlights" (h2 at y=708 on desktop) delivers two proof points before the challenge has been stated, so the reader is asked to admire a solution to a problem they haven't met. The challenge and approach are readable, the diagram is impressive, and then the page ends with "What it includes" and a next-project link. There is no moment of "here is what changed because this existed." The emotional arc rises on craft and flatlines on meaning.

**About: warmth, then a dead end.** The voice is likable and the photo/facts layout is good. But the paragraphs are the same ones already read on the home page, there is no availability, no timeline, no CV, and no "here is what I want next." The page that should convert curiosity into contact simply stops. It is also only reachable from the footer on the home page — the nav's "About" scrolls to the home section, which has no "More about me" link.

**Notes: curiosity, with an immersion break.** The index is clean and the cards are inviting. Two of three notes are Burmese, but the cards don't say so; opening one switches `<html lang="my">` while the byline ("Posted on"), the TOC ("On this page"), and the "Topics" aria-label stay English without `lang="en"`. For a Burmese reader this is a small "oh — this part wasn't made for me" moment inside a page that otherwise was.

**404: a smile, then a squint.** The copy is human and the exits are clear, but the 72px "404" shouts while the 20px `<h1>` whispers, so the page leads with its error code instead of its explanation.

**Overall arc:** a strong opening, a thin middle, and no closing move. The site's emotional peak is the hero; its trough is the end of a case study and the whole of About. Nothing on the site ever asks for the thing the product brief says it exists to earn: contact.

---

## 6. What's working

**1. The hero is a genuine piece of design, not a layout.**
Three staggered lines, the alias set as a quiet aside, the lede and actions aligned to the last line, and pointer physics that swell and lean letters on springs. It respects `prefers-reduced-motion`, holds at 320px (aside from the alias wrap noted below), and gives the site a memorable first sentence. This is the strongest evidence of authorial intent on the site.

**2. Editorial discipline holds across every page.**
One accent, two typefaces, rules instead of cards, consistent 44px targets, visible focus, theme persistence, no layout shift, no stock imagery, no decorative gradient. The 320–1920 range is stable, the reading measure is controlled, and the type scale does the hierarchy work. It feels like one site, not five templates.

**3. The case-study reading machine is well built.**
The sticky rail with scroll-spy, the full-bleed diagram that lets labels breathe, the origin-aware back link that remembers whether you came from home or the index, and the next-case-study footer are all thoughtful. The container is ready for a better argument; the problem is what's inside it, not how it's framed.

---

## 7. Priority issues

### P1 — Case studies stop before the point: no outcome, contribution, duration, team, or learning

**What.** All five projects follow the same spine: description → facts (My role, Type, Year, Stage) → screenshot → "Engineering highlights" → Challenge → Approach → System architecture → How it is structured → What it includes → next project. There is no result, no measure of scale, no statement of what shipped, no team size, no duration, and no reflection. The work index explicitly promises "The products, the systems behind them, and what I learned building them." The learning never appears.

**Why.** The product brief says the site exists so a visitor can quickly understand what he builds, how he thinks, and why to contact him, and that it should differentiate on systems depth. A hiring manager can see that the architecture is thoughtful; they cannot see whether it worked, what was hard, what he owned, or what he would do differently. "Engineering highlights" before the challenge compounds this: proof is offered before the problem, so it reads as a feature list rather than judgment. This is the single largest gap between the site's promise and its delivery.

**Fix.** Add a short, honest outcome block after the challenge or approach — what shipped, what changed, what was learned, what you'd do differently — using only what the repository can support (no invented metrics, clients, or testimonials). Add `Duration` and `Team` to the facts row where true. Move "Engineering highlights" after "The approach" so each proof point answers a stated problem. Fold "What it includes" into the highlights or the architecture list instead of repeating it. One specific paragraph per project will do more than another section.

### P1 — The About page duplicates the home section and omits the hiring decision

**What.** `/about` renders the same `AboutSection` as the home page: the same two paragraphs, the same four facts ("Based in," "Currently," "Focus," "Writes in"), the same tools grid. There is no availability, no timeline or education detail, no working style, no resume/CV file anywhere in the repo, and no contact call to action. The page is reachable only from the footer on the home page; the nav's "About" scrolls to the home section, which has no "More about me" link.

**Why.** For the hiring half of the audience, About is the decision page, not a second introduction. Right now it answers "who is this" but not "should I email him, and what would I be emailing him about?" The brief explicitly asks the site to support evaluation and discovery "without forcing a single audience path"; the current home nav forces the evaluation path to end at a section with no exit.

**Fix.** Make `/about` the canonical long version: a short "What I'm looking for" / availability line, a three-to-four-entry timeline (education, roles, significant projects), working style and collaboration preferences, a downloadable PDF resume if one exists, and a direct contact block. Link to it from the end of the home About section ("More about me"). Keep the home section as the teaser; don't render the identical component twice.

### P2 — Home navigation dead-ends and drifts in naming

**What.** On `/`, the header links are `#projects`, `#writing`, `#about` rather than `/projects`, `/writing`, `/about`. The home About section has no link to `/about`; the only route to the full page is the footer. The work section is called "Work" in the nav, "Selected work" as its heading, "View all work" as its link, "See the work" in the hero, and "Explore the project" on each row. "Notes" is consistent, which makes the work naming look accidental rather than stylistic.

**Why.** A visitor who decides on the home page that they want the full work index or the full About page has to discover the footer. That is the opposite of "quickly understand … and why to contact him." The naming drift also weakens the recognition heuristic: five phrases for one destination makes the site feel larger and less navigable than it is.

**Fix.** Keep the home section jumps (they are good), but end each section with a visible exit: "All work" under Selected work, "More about me" under About, and a persistent "All notes" already exists for writing. Standardize on "Work" and "Notes" for destinations and reserve "Selected work" for the home subset only. Make the home "About" heading itself link to `/about` if the visual treatment allows it.

### P2 — The header breaks at 1024px and the brand link has an oversized focus target

**What.** At 1024px (iPad landscape) the nav column is 328px against 356px of content, and the theme toggle collapses to **17×44px**; it recovers around 1100px. At 320px the toggle is 23×44. Separately, the brand `<a>` stretches to **584px at 1024** and **748px at 1440**, so keyboard focus paints a 748×44 lime rectangle across mostly empty space.

**Why.** 1024 is a standard tablet width and a common split-screen laptop width. A 17px-wide control is hard to hit and looks broken. The oversized focus ring is worse than cosmetic: it tells keyboard users the entire header is one link and makes the actual target ambiguous. Both are visible in the first tab press, which is exactly when trust is formed.

**Fix.** Constrain the brand anchor with `w-fit` / `inline-flex` and let it size to its text; give the nav `grid-template-columns: auto 1fr auto` or `flex` with `flex: 0 0 auto` on the toggle so space is never distributed into it. Re-test at 1024, 1080, and 1100. The toggle should never fall below 44×44.

### P2 — Mobile case-study reading order and diagram make the phone the worst place to read the best content

**What.** At 390px: screenshot ends ~y=1107, "Technology" aside begins y=1348, "The challenge" begins y=1681. The TOC is hidden below `md`. The architecture diagram renders at 704px inside a 350px horizontal scroller (`min-w-168`), and the "Enlarge diagram" dialog sets `min-width: 64rem` (1024px), so enlarging on a phone produces a canvas wider than the viewport. The button is also hidden below `md`, so the affordance that might help isn't offered where it's needed.

**Why.** Most social and messaging traffic arrives at 390px. Those readers meet 253px of tool names before the problem statement, then a diagram they must drag sideways, then no way to enlarge it. The narrative order (problem → approach → architecture) is correct in the DOM for desktop but is visually interrupted on mobile by the rail. This is the one place where the site's craft actively works against its content.

**Fix.** On mobile, order: name → description → facts → actions → screenshot → challenge → approach → diagram → structure → includes. Move the technology list after the challenge or collapse it into a `<details>`. Make the diagram fit the viewport (responsive SVG or `width: 100%`) and change the dialog to `width: min(64rem, 100vw - 2rem)`. Show "Enlarge" on touch, or drop the dialog and rely on pinch-zoom with a properly scaled SVG. Add a compact "Jump to" control on mobile if the page stays long.

---

## 8. Persona red flags

### Persona 1 — Daw Mya, 34, engineering manager at a Yangon fintech, hiring a backend engineer

Arrives from LinkedIn on a laptop, gives the site about 90 seconds, then opens one case study.

- Case studies never state what shipped, at what scale, with what team, or what changed. She can see the architecture is considered; she cannot see whether it worked or what he owned.
- "My role" is a label, not a contribution statement; "Stage: Built" says nothing about maturity or usage.
- The About page has no availability, no resume, no timeline, and no "what I'm looking for." She would have to email to learn whether he is even job-seeking.
- "Winner Nominee" is unexplained, so it reads as decoration rather than proof.
- There is no closing "contact for hiring" moment; the site ends each path in another page.

**Her sentence:** "I can see the craft. I can't see the impact."

### Persona 2 — Ko Aung, 22, CS student in Mandalay, reads Burmese, arrives from Facebook on a mid-range Android

Lands on a note shared in a Burmese developer group, then browses the work index.

- Two of three notes are Burmese, but the cards don't mark language; he doesn't know which ones he can read until he opens them.
- On a Burmese note, `<html lang="my">` is correct, but the byline ("Posted on"), TOC ("On this page"), and `aria-label="Topics"` are English without `lang="en"`, so a screen reader pronounces them with Burmese phonetics.
- The TOC disappears on mobile, so a long note has no map.
- The diagram scrolls sideways and the enlarge control isn't offered at his width.
- RSS exists at `/rss.xml` but is not exposed anywhere in the UI, so there is no low-data way to follow the writing.

**His sentence:** "I didn't know this one was in Burmese until I opened it."

### Persona 3 — Priya, 31, accessibility-minded frontend engineer, keyboard and screen reader, iPad landscape

Tabs through the header, opens a case study, and inspects the diagram.

- At 1024px the theme toggle is 17px wide; she misses it twice before using the keyboard.
- The first Tab paints a 584px-wide focus ring around the brand link, implying the whole header is one target.
- The architecture diagram is a `role="img"` with the generic label "System architecture diagram" and no text alternative, so the most substantive artifact on the page is silent to her.
- The enlarge dialog enforces a 1024px minimum width and is not offered below `md`.
- On Burmese pages, English UI strings are not marked `lang="en"`, so pronunciation and voice switching are wrong.

**Her sentence:** "The focus ring tells me the whole header is one link."

---

## 9. Minor observations

- **Hero alias wraps badly at 320–360px.** "also known as Happer" drops to its own indented line (alias x=114, y=279; name box grows from 143px to 165px). It recovers at 375px. A smaller alias size or a deliberate two-line treatment at the narrowest widths would look intentional rather than broken.
- **404 hierarchy is inverted.** The 72px "404" is a `<p>` and the 20px "This page doesn't exist" is the `<h1>`; visually the error code leads and the explanation follows. Swap the weight or make the h1 the large element.
- **"Winner Nominee" needs a referent.** Add the award/competition name and year, or drop it.
- **Hashtags are non-interactive spans** styled like links; either make them filter/link or make them look like plain metadata.
- **Duplicate affordances on index rows.** The whole row is a link and "Explore the project ↗" is a second call to action inside it. Keep one; the row already has hover/focus feedback.
- **"01 /" ordinals on proof points** add visual noise without helping scanning; the heading text is already the label.
- **No visible RSS link.** The feed is declared in `<head>` but nothing in the footer or notes index points to it.
- **`ProjectName` sets a `view-transition-name`** but there is no `ClientRouter`, so the name never travels between pages. Harmless, but dead code that implies motion the site doesn't have.
- **Light-theme `--text-faint` is 4.63:1** (dark 5.35:1). It passes AA for normal text but only just; 14px meta labels sit at the edge. Nudging the token darker would make the faint layer less fragile.
- **Borders are 1.39:1 (dark) / 1.80:1 (light)** and function as decoration, not information; that's acceptable, but don't rely on them alone for grouping.
- **Font preloads five static weight files (400–800).** If the family is loaded as static cuts, the `font-variation-settings` weight swell in the hero may be inert; worth verifying visually against the intended effect.
- **`public/animation.gif` is 76KB at 331×498** and is used as a theme mask; a small WebM/AVIF would cut bytes without changing the effect.
- **No search/filter** is the right call at five projects; revisit around fifteen, and add a name-based recovery path on the 404 before then.
- **Home hero fills the entire 1440×900 first screen** (work heading at y=1048), so desktop visitors get no glimpse of the work below. This is a defensible editorial choice, but it makes "See the work" carry more weight than a text link usually should.

---

## 10. Provocative questions

1. If the case studies were deleted tomorrow, would the site still prove you can build reliable backend systems? What is the one artifact a hiring manager should remember an hour later?
2. The index promises "what I learned building them." Where is that sentence on the project page — and if it isn't there, what is the index promising?
3. You call yourself a software engineer and a college student in the same breath. Which one is the site selling, and what would change on the page if you picked one as the headline?
4. Is "Happer" a name for people who already know you, or a handle for people who don't? Should the alias carry its own link, or stay a whisper beside the name?
5. What is the site's closing move? Every path currently ends in another page. Where is the single moment that asks a convinced reader to email you?
6. If a visitor only sees the 390px first screen, what do they know? They get the name, the role, the email, and "See the work" — but not that there are five case studies waiting.
7. The product brief says "show engineering thinking, not just outcomes." You have the thinking. What would it take to show one outcome you can honestly stand behind?
