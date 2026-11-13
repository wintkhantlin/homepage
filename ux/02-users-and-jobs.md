# 02 — Users and Jobs

**Product purpose (from `PRODUCT.md`):** a personal portfolio for Wint Khant Lin (Happer), a backend software engineer and college student from Myanmar. It should show **what he builds, how he thinks, and why his work is worth following or contacting him about** — engineering thinking, not just outcomes.

**Primary audience:** hiring managers, technical recruiters, and developer peers.
**Secondary audience:** the Burmese developer community and readers who arrive from a shared note.

---

## 1. Personas

These are hypotheses, not validated segments. Each has a job, a context, a success condition, and the evidence that would make them leave.

### Priya — hiring manager / technical recruiter

- **Context:** 34, engineering manager at a product company; 8–12 open roles; reviews portfolios in 5–10 minutes, often on a phone between meetings.
- **Job:** “When I open a portfolio, I want to see what this person builds and how they think, so I can decide whether to interview them.”
- **What she scans:** hero role/level → selected work → one case study → About → contact.
- **Success:** she can explain the candidate’s strongest system, his role, and one reason to interview him without opening a second tab.
- **Red flags:** proof before problem; no outcome or reflection; no availability/role target; no résumé; a 5,600px mobile case study with no jump menu; a header that disappears.
- **What would win her:** a case study that names the problem, the constraints, the tradeoff, what changed, and what he learned — in that order.

### Min — developer peer

- **Context:** 28, backend engineer; reads case studies and notes on desktop; cares about architecture, tradeoffs, and code.
- **Job:** “When I read a case study or note, I want to see the system and the decisions, so I can learn something or judge whether this person has taste.”
- **What he scans:** architecture diagram → challenge/approach → GitHub → notes.
- **Success:** he learns one non-obvious thing or finds a reason to follow the writing.
- **Red flags:** architecture without tradeoffs; no “what I’d do differently”; no English technical notes; RSS not linked; a diagram with only a generic label.
- **What would win him:** a short “tradeoffs / what I’d change” block and one English systems note.

### Ko Aung — Burmese reader

- **Context:** 24, junior developer in Myanmar; reads on a phone; comfortable in Burmese and technical English.
- **Job:** “When I open a Burmese note, I want the interface and the English terms to be marked correctly, so I can follow without switching mental languages.”
- **What he scans:** title → language label → TOC → body → next note.
- **Success:** he reads the note without pronunciation or layout friction and knows the note is Burmese before opening it.
- **Red flags:** English UI strings inheriting Burmese; the byline/TOC/Topics unmarked; a TOC that is hard to reach on mobile.
- **What would win him:** `lang="en"` on the UI chrome and English headings; the existing “Burmese · X min read” label; a compact mobile TOC.

### Alex — keyboard / screen-reader user

- **Context:** 31, uses VoiceOver/NVDA and a keyboard; evaluates whether the site is usable without a pointer.
- **Job:** “When I navigate, I want to know where I am, what each control does, and how to get to the content and contact.”
- **What he scans:** skip link → landmarks → nav → headings → links → dialogs → footer.
- **Success:** he reaches the work, opens a case study, opens/closes a dialog, and contacts the author without losing focus.
- **Red flags:** a 748px wordmark focus ring; a 1,216×1,593px section focus ring; the header disappearing after an anchor jump; `aria-current` changing meaning between pages; a 17px theme toggle; English UI strings in Burmese pages.
- **What would win him:** predictable focus, correct `aria-current`, marked languages, and a visible, stable header.

### Mobile-first reader (a context, not a separate persona)

Priya and Ko Aung both read on a phone. The mobile context adds:

- 390×844 and 320×844; no horizontal overflow.
- A 5,145–5,643px case study with no in-page map.
- A technology rail before the story.
- A 704px diagram inside a 348px scroller, with a visible “Enlarge” button.
- A 41×44 theme toggle at 320 (passes WCAG 24; 3px below the 44px design target).

---

## 2. Jobs to be done

| # | Job | Primary persona | Success looks like | Current friction |
|---|---|---|---|---|
| J1 | Decide whether to interview this person | Priya | Can name the strongest system, the role, and one reason to talk | Case studies lack outcome/reflection; About lacks availability/role target |
| J2 | Judge engineering judgment | Min / Priya | Sees problem, constraints, tradeoff, and what changed | Proof before problem; no “what I’d do differently” |
| J3 | Learn from a note | Min / Ko Aung | Finishes a note and finds the next one | English technical writing is thin; English UI strings unmarked in Burmese notes |
| J4 | Read comfortably in Burmese | Ko Aung | Reads without language/pronunciation friction | Byline/TOC/Topics inherit Burmese; TOC is desktop-first |
| J5 | Navigate without a pointer | Alex | Reaches work, case study, dialog, contact with predictable focus | Header hides after anchor; giant focus rings; 17px toggle; `aria-current` drift |
| J6 | Finish a case study on a phone | Priya / Min | Can jump to the section they need and finish | No mobile TOC; technology rail before challenge |
| J7 | Contact the author | All | Finds email/GitHub/LinkedIn and a reason to write | Footer contact is strong; About does not say what to write about |

---

## 3. Contexts

| Context | What matters | Evidence |
|---|---|---|
| Desktop scan (1440) | Fast hierarchy; proof; contact | Hero fills 900px; work heading at 900; article 77ch; wordmark 748px |
| Tablet (1024) | Header controls remain usable | Theme toggle 17×44; wordmark 584px |
| Mobile (390/320) | Narrative order; jump navigation; tap targets | No case-study TOC; rail before challenge; 41px toggle at 320; no overflow |
| Keyboard | Focus order; visible focus; stable header | Skip link works; giant section ring; header hides after anchor |
| Screen reader | Landmarks; headings; language; current state | Good landmarks/h1s; language-of-parts gap; `aria-current` drift |
| Burmese reader | Language labels; mixed-language marking | Cards label Burmese; byline/TOC/Topics do not mark English |
| Reduced motion | No non-essential motion | Theme, reveals, scroll, photo close all honor reduce |

---

## 4. Assumptions to validate

1. **Hiring teams are the primary visitor.** If most traffic is peers or the Burmese community, the About/hiring gap is lower priority and the English technical writing is higher.
2. **Visitors read at least one full case study.** If they only scan the home, the index promise and the proof-point order matter more than the deep sections.
3. **A résumé exists or can be produced.** If not, the About recommendation should be an availability/role-target block only.
4. **Outcome data exists for at least some projects.** If not, “what I learned / what changed” is the honest substitute; do not invent metrics.
5. **Mobile is a meaningful share of traffic.** The mobile case-study TOC and rail order are P2 only if people actually read case studies on phones.
6. **Burmese readers use screen readers or language switching.** The `lang` gap is a WCAG AA issue regardless, but its practical impact depends on the audience.

Recommended validation: five short sessions (one hiring manager, one peer, one Burmese reader, one keyboard/screen-reader user, one mobile reader) on four tasks:

- “Find a case study and tell me what problem it solves.”
- “Find what he learned building it.”
- “Find out whether he is available and how to contact him.”
- “Read a Burmese note and find the section on X.”

---

## 5. What success looks like

A visitor should be able to answer, in order:

1. **Who is this?** — hero name, role, location, one-line positioning.
2. **What does he build?** — selected work, with maturity and stack.
3. **How does he think?** — challenge, approach, architecture, tradeoffs.
4. **What changed / what did he learn?** — the missing case-study block.
5. **Should I talk to him?** — About availability/role target, then contact.

The site currently answers 1–3 well, 4 not at all, and 5 partially. That is the study in one sentence.
