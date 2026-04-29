---
name: seo-optimization
description: >
  Use this skill for any SEO (Search Engine Optimization) task. Triggers include: optimizing web pages,
  writing or rewriting meta titles and descriptions, improving URL slugs, doing keyword research,
  auditing on-page SEO, creating SEO content briefs, analyzing competitor SEO, building internal linking
  strategies, writing schema markup (structured data), improving Core Web Vitals recommendations, creating
  XML sitemaps, writing robots.txt files, and generating SEO-friendly blog posts or landing pages.
  Also use when the user mentions "rank higher on Google", "improve search traffic", "SERP", "backlinks",
  "keyword density", "SEO audit", "technical SEO", "local SEO", "E-E-A-T", or any related terms —
  even if they don't use the word "SEO" explicitly.
---

# SEO Optimization Skill

A comprehensive skill for all SEO-related tasks, from quick on-page fixes to full technical audits and content strategy.

---

## Quick Reference — Task Router

| User asks for... | Go to section |
|---|---|
| Meta tags, title tags | [On-Page SEO](#on-page-seo) |
| Keyword research | [Keyword Research](#keyword-research) |
| Content writing/briefs | [SEO Content](#seo-content) |
| Site audit | [Technical SEO Audit](#technical-seo-audit) |
| Schema / structured data | [Structured Data](#structured-data) |
| Local SEO | [Local SEO](#local-seo) |
| Backlinks / link building | [Off-Page SEO](#off-page-seo) |
| Core Web Vitals / speed | [Technical SEO Audit](#technical-seo-audit) |
| Competitor analysis | [Competitive Analysis](#competitive-analysis) |

For deep dives, load the relevant reference file from `references/`.

---

## Guiding Principles

1. **Search intent first.** Every decision starts with understanding what the user *actually wants* when they search. Match content type, format, and angle to the dominant intent (informational, navigational, commercial, transactional).
2. **E-E-A-T always.** Google's quality framework: Experience, Expertise, Authoritativeness, Trustworthiness. Weave signals in naturally.
3. **People-first content.** Write for humans first. Optimize for crawlers second. Keyword stuffing is always wrong.
4. **Measurable outcomes.** Every recommendation should connect to a metric: impressions, clicks, CTR, rankings, conversions.

---

## On-Page SEO

### Title Tags
- **Length:** 50–60 characters (truncated at ~580px in SERPs)
- **Structure:** `Primary Keyword — Brand` or `Action + Keyword | Brand`
- **Rules:** Include primary keyword near the front. One title per page. Make it click-worthy.
- **Example:** `Buy Running Shoes Online | Free Shipping — BrandName`

### Meta Descriptions
- **Length:** 120–158 characters (mobile truncates earlier at ~120)
- **Purpose:** Not a ranking factor, but drives CTR. Treat it as ad copy.
- **Rules:** Include primary keyword (Google bolds it). Include a CTA. Unique per page.
- **Example:** `Shop 200+ running shoes from top brands. Free next-day delivery & easy returns. Find your perfect fit today.`

### Heading Structure
```
H1 (once only) — Primary keyword + topic
  H2 — Major subtopic / secondary keyword
    H3 — Supporting points
      H4 — Details (use sparingly)
```

### URL Slugs
- Lowercase, hyphens only (no underscores, no spaces)
- Short: 3–5 words max
- Include primary keyword
- Remove stop words (a, the, of, in...)
- Bad: `/blog/post?id=123&cat=shoes`
- Good: `/blog/best-running-shoes`

### Image SEO
- `alt` text: descriptive, keyword-relevant, not stuffed
- Filename: `blue-running-shoes-mens.webp` not `IMG_4032.jpg`
- Compress: WebP preferred, <100KB for above-fold images
- Add `width` and `height` attributes to prevent layout shift (CLS)

### Internal Linking
- Link from high-authority pages to pages you want to rank
- Use descriptive anchor text (not "click here")
- Aim for 3–5 internal links per piece of content
- Prioritize pages with few inbound links

---

## Keyword Research

### Process
1. **Seed keywords** — Start with the core topic. What would the ideal customer type?
2. **Expand** — Use modifiers: best, how to, [year], near me, vs, review, buy, cheap
3. **Cluster** — Group keywords by intent and topic similarity (one page per cluster)
4. **Prioritize** — Score by: Search Volume × (1/KD difficulty) × Business value

### Keyword Metrics to Evaluate
| Metric | What it means | Ideal for new sites |
|---|---|---|
| Search Volume | Monthly searches | >100 |
| Keyword Difficulty (KD) | How hard to rank 0–100 | <30 |
| CPC | Commercial intent proxy | Higher = more valuable |
| SERP Features | Featured snippets, People Also Ask | Opportunities |

### Long-Tail Strategy
- 3+ word phrases with lower volume but higher conversion intent
- Easier to rank, faster results
- Example: "best running shoes for flat feet women" > "running shoes"

### Keyword Intent Mapping
- **Informational:** how to, what is, guide, tutorial → blog posts
- **Commercial:** best, top, review, vs → comparison/review pages
- **Transactional:** buy, price, discount, near me → product/landing pages
- **Navigational:** brand name → homepage or brand page

---

## SEO Content

### Content Brief Structure
When creating a content brief, always include:
1. **Target keyword** (primary + 3–5 secondary)
2. **Search intent** (what the reader wants)
3. **Word count** (based on top 3 SERP competitors, ±20%)
4. **Recommended H2/H3 structure**
5. **E-E-A-T signals** (stats, quotes, author bio requirements)
6. **Internal links** (2–3 pages to link to/from)
7. **SERP features to target** (FAQ, how-to, table)

### Writing for Featured Snippets
- **Paragraph snippet:** 40–60 word answer immediately after the H2 that matches the query
- **List snippet:** Use `<ol>` or `<ul>` with 5–8 items
- **Table snippet:** Use `<table>` for comparisons, pricing, specs
- Start the answer immediately — don't bury it

### Content Freshness
- Add "Last updated: [date]" for evergreen content
- Re-optimize top pages every 6–12 months
- Update statistics, examples, and screenshots

---

## Technical SEO Audit

### Crawlability Checklist
- [ ] `robots.txt` — not blocking key pages/assets
- [ ] XML sitemap — submitted to Google Search Console, updated
- [ ] Canonical tags — correct `<link rel="canonical">` on all pages
- [ ] No redirect chains (A→B→C; should be A→C)
- [ ] No broken links (4xx errors)
- [ ] Hreflang (for multilingual sites)

### Indexability Checklist
- [ ] No `noindex` on pages that should rank
- [ ] Thin/duplicate content resolved (canonical or noindex)
- [ ] Pagination handled (`rel="next/prev"` deprecated — use canonical)

### Core Web Vitals Targets (2024)
| Metric | Good | Needs Work | Poor |
|---|---|---|---|
| LCP (Largest Contentful Paint) | ≤2.5s | 2.5–4s | >4s |
| INP (Interaction to Next Paint) | ≤200ms | 200–500ms | >500ms |
| CLS (Cumulative Layout Shift) | ≤0.1 | 0.1–0.25 | >0.25 |

### Common Technical Fixes
- **Slow LCP:** Preload hero image, use CDN, compress images, eliminate render-blocking JS
- **High CLS:** Set image dimensions, avoid inserting DOM above content, use `font-display: swap`
- **Poor INP:** Reduce JS execution time, defer non-critical scripts, use web workers

### robots.txt Template
```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /cart/
Disallow: /checkout/
Disallow: /*?*  # Optional: block URL parameters

Sitemap: https://example.com/sitemap.xml
```

### XML Sitemap Best Practices
- Include only canonical, indexable URLs
- Max 50,000 URLs or 50MB per sitemap file
- Use sitemap index for large sites
- Include `<lastmod>` in ISO 8601 format
- Submit via Google Search Console

---

## Structured Data

Read `references/schema-markup.md` for full schema templates.

### Priority Schema Types
| Page Type | Schema |
|---|---|
| Article/Blog | `Article`, `BlogPosting` |
| Product page | `Product`, `Offer` |
| Local business | `LocalBusiness` |
| FAQ section | `FAQPage` |
| How-to guide | `HowTo` |
| Recipe | `Recipe` |
| Event | `Event` |
| Review | `Review`, `AggregateRating` |

### Implementation
Always use JSON-LD (Google's preferred format):
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  ...
}
</script>
```

Validate at: [schema.org/validator](https://validator.schema.org) or [Rich Results Test](https://search.google.com/test/rich-results)

---

## Local SEO

### Google Business Profile (GBP) Optimization
- Complete every field: NAP, hours, categories, attributes
- Primary category matters most — be specific
- Add 10+ photos (interior, exterior, team, products)
- Respond to every review within 24h
- Post weekly updates (offers, events, news)

### NAP Consistency
Name, Address, Phone must be **identical** across:
- Website (footer + contact page)
- Google Business Profile
- Yelp, Bing Places, Apple Maps
- Industry directories

### Local Keywords
- `[service] + [city]`: "plumber in Austin"
- `[service] + near me`: optimized via GBP + local signals
- Neighborhood-level pages for multi-location businesses

### Local Link Building
- Chamber of commerce listings
- Local news/media mentions
- Sponsor local events
- Partner with complementary local businesses

---

## Off-Page SEO

### Link Building Strategies (White Hat Only)
1. **Digital PR** — Create data studies, surveys, or original research journalists cite
2. **Guest posting** — Write for authoritative sites in your niche
3. **Broken link building** — Find dead links on authority sites, offer your content as replacement
4. **Resource page links** — Get listed on "best tools/resources" pages
5. **HARO / Connectively** — Answer journalist queries for expert quotes

### Link Quality Signals
- Domain Authority (DA) / Domain Rating (DR) of linking site
- Topical relevance to your site
- Placement (editorial in body > footer/sidebar)
- Anchor text (branded/natural > exact-match)
- Do-follow vs no-follow (both have value)

### What to Avoid
- Buying links (Google penalty risk)
- Link farms / PBNs
- Exact-match anchor text over-optimization
- Reciprocal link schemes

---

## Competitive Analysis

### What to Analyze
1. **Ranking keywords** — What are they ranking for that you aren't?
2. **Top pages** — What content drives most of their traffic?
3. **Backlink profile** — Who links to them? Can you get those links too?
4. **Content gaps** — Topics they cover that you don't
5. **SERP features** — Are they winning featured snippets?

### Tools to Recommend
- **Free:** Google Search Console, Google Analytics, Bing Webmaster, PageSpeed Insights
- **Freemium:** Ahrefs (limited), Semrush (limited), Ubersuggest
- **Paid:** Ahrefs, Semrush, Moz Pro, Screaming Frog (desktop crawler)

---

## Deliverable Templates

### Quick On-Page Audit Output Format
```
PAGE: [URL]
PRIMARY KEYWORD: [keyword] | Volume: X | KD: X

✅ PASSING
- Title tag present and optimized
- Meta description present

⚠️ NEEDS IMPROVEMENT
- Title tag length: 72 chars (target: 50–60) → Suggested: "[new title]"
- H1 missing primary keyword → Suggested: "[new H1]"

❌ CRITICAL ISSUES
- Page returns 404 / no canonical tag / blocked by robots.txt
```

### Meta Tag Output Format
Always present as ready-to-copy code:
```html
<title>Your Optimized Title Here (55 chars)</title>
<meta name="description" content="Your meta description here — compelling, includes keyword, has CTA. (145 chars)">
<link rel="canonical" href="https://example.com/page-slug/">
```

---

## Reference Files

- `references/schema-markup.md` — Full JSON-LD templates for 10+ schema types
- `references/checklist-audit.md` — 50-point technical SEO audit checklist
- `references/keyword-brief-template.md` — Full content brief template

# Schema Markup Templates (JSON-LD)

All templates use JSON-LD format inside `<script type="application/ld+json">` tags.
Replace ALL_CAPS placeholders with real values.

---

## Article / Blog Post

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "ARTICLE TITLE (max 110 chars)",
  "description": "BRIEF DESCRIPTION",
  "image": "https://example.com/image.jpg",
  "author": {
    "@type": "Person",
    "name": "AUTHOR NAME",
    "url": "https://example.com/author/name"
  },
  "publisher": {
    "@type": "Organization",
    "name": "BRAND NAME",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  },
  "datePublished": "2024-01-15T08:00:00+00:00",
  "dateModified": "2024-06-01T12:00:00+00:00",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://example.com/article-slug/"
  }
}
```

---

## Product Page

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "PRODUCT NAME",
  "image": ["https://example.com/product-1.jpg", "https://example.com/product-2.jpg"],
  "description": "PRODUCT DESCRIPTION",
  "sku": "SKU123",
  "brand": {
    "@type": "Brand",
    "name": "BRAND NAME"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://example.com/product/",
    "priceCurrency": "USD",
    "price": "29.99",
    "priceValidUntil": "2025-12-31",
    "itemCondition": "https://schema.org/NewCondition",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": "128"
  }
}
```

---

## FAQ Page

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "QUESTION ONE?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Answer to question one. Keep it concise and factual."
      }
    },
    {
      "@type": "Question",
      "name": "QUESTION TWO?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Answer to question two."
      }
    }
  ]
}
```

---

## How-To

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "HOW TO [DO SOMETHING]",
  "description": "BRIEF DESCRIPTION OF THE PROCESS",
  "totalTime": "PT30M",
  "estimatedCost": {
    "@type": "MonetaryAmount",
    "currency": "USD",
    "value": "0"
  },
  "tool": [
    { "@type": "HowToTool", "name": "TOOL 1" }
  ],
  "supply": [
    { "@type": "HowToSupply", "name": "SUPPLY 1" }
  ],
  "step": [
    {
      "@type": "HowToStep",
      "name": "STEP 1 TITLE",
      "text": "STEP 1 INSTRUCTIONS",
      "image": "https://example.com/step1.jpg",
      "url": "https://example.com/how-to/#step1"
    },
    {
      "@type": "HowToStep",
      "name": "STEP 2 TITLE",
      "text": "STEP 2 INSTRUCTIONS"
    }
  ]
}
```

---

## Local Business

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "BUSINESS NAME",
  "image": "https://example.com/photo.jpg",
  "@id": "https://example.com",
  "url": "https://example.com",
  "telephone": "+1-555-555-5555",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main St",
    "addressLocality": "CITY",
    "addressRegion": "STATE",
    "postalCode": "12345",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "17:00"
    }
  ],
  "sameAs": [
    "https://www.facebook.com/BRAND",
    "https://www.yelp.com/biz/BRAND"
  ]
}
```

---

## BreadcrumbList

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://example.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Category",
      "item": "https://example.com/category/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Page Title",
      "item": "https://example.com/category/page/"
    }
  ]
}
```

---

## Event

```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "EVENT NAME",
  "startDate": "2024-09-15T19:00:00-05:00",
  "endDate": "2024-09-15T22:00:00-05:00",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "location": {
    "@type": "Place",
    "name": "VENUE NAME",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Venue St",
      "addressLocality": "CITY",
      "addressRegion": "STATE",
      "postalCode": "12345",
      "addressCountry": "US"
    }
  },
  "image": "https://example.com/event-image.jpg",
  "description": "EVENT DESCRIPTION",
  "organizer": {
    "@type": "Organization",
    "name": "ORGANIZER NAME",
    "url": "https://example.com"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://example.com/tickets",
    "price": "25",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "validFrom": "2024-07-01T00:00:00-05:00"
  }
}
```

# SEO Content Brief Template

Copy this template and fill in each section before writing.

---

## Brief Overview

| Field | Value |
|---|---|
| **Page URL (target)** | `/blog/[slug]` |
| **Content Type** | Blog Post / Landing Page / Product Page / Category Page |
| **Brief Author** | |
| **Writer** | |
| **Deadline** | |

---

## Target Keywords

| Type | Keyword | Monthly Volume | Difficulty |
|---|---|---|---|
| Primary (1) | | | |
| Secondary (2–3) | | | |
| Secondary (2–3) | | | |
| LSI / Related | | | |
| LSI / Related | | | |

**Search Intent:** Informational / Commercial / Transactional / Navigational

**User goal:** In one sentence, what does someone typing this query want to accomplish?

---

## SERP Analysis

**Top 3 ranking pages (URL + title):**
1.
2.
3.

**Average word count of top 3:** _____ words

**SERP features present:**
- [ ] Featured snippet (type: paragraph / list / table)
- [ ] People Also Ask
- [ ] Video carousel
- [ ] Image pack
- [ ] Local pack
- [ ] Shopping results

**Content angle of top competitors:** (e.g., "all list guides, no step-by-step tutorials")

**Content gap / differentiation opportunity:**

---

## Target Reader

**Who is this for?**

**What do they already know?** (beginner / intermediate / expert)

**What problem are they trying to solve?**

**What should they do after reading this page?**

---

## Recommended Content Structure

**Suggested Title (H1):**
*(Include primary keyword. Keep to 60 chars max.)*

**Suggested Meta Title:**
*(50–60 chars, includes primary keyword near front)*

**Suggested Meta Description:**
*(120–158 chars, includes keyword, ends with soft CTA)*

---

### Outline

```
H1: [Full article title]

Introduction (100–150 words)
- Hook sentence addressing the reader's pain
- What this article covers (1–2 sentences)
- Primary keyword in first 100 words

H2: [SECTION 1 — keyword-rich]
  H3: [Subsection if needed]
  H3: [Subsection if needed]

H2: [SECTION 2]
  H3:
  H3:

H2: [SECTION 3]

H2: Frequently Asked Questions  ← for FAQ schema
  H3: Question 1?
  H3: Question 2?
  H3: Question 3?

Conclusion (100–150 words)
- Summarize key takeaways
- Clear CTA
```

---

## E-E-A-T Requirements

- [ ] Author bio with relevant credentials
- [ ] Cite at least [X] authoritative external sources
- [ ] Include original data, research, or expert quote
- [ ] Date published + date last reviewed visible on page
- [ ] Link to related expert content on site

---

## Internal Linking

**Link FROM this page to:**
1. [URL] — suggested anchor text:
2. [URL] — suggested anchor text:
3. [URL] — suggested anchor text:

**Link TO this page from:**
1. [URL] — suggested anchor text:
2. [URL] — suggested anchor text:

---

## Schema Markup

**Recommended schema type(s):**
- [ ] Article
- [ ] FAQPage
- [ ] HowTo
- [ ] BreadcrumbList
- [ ] Other: ___

*(See schema-markup.md for templates)*

---

## Media Requirements

- **Featured image:** [description + alt text]
- **Screenshots/diagrams needed:** [list]
- **Video embed:** Yes / No
- **Infographic:** Yes / No

---

## Word Count Target

**Minimum:** _____ words
**Maximum:** _____ words
*(Based on competitor average ±20%. More isn't always better — match depth to intent.)*

---

## Success Metrics

| Metric | Current | Target (3 months) |
|---|---|---|
| Ranking position | Not ranking | Top 10 |
| Monthly clicks | 0 | [X] |
| CTR | — | ≥ 3% |

---

## Notes for Writer

*(Any tone, brand, or formatting guidelines, do's and don'ts)*

# Technical SEO Audit Checklist (50 Points)

Use this for comprehensive site audits. Mark each item: ✅ Pass | ⚠️ Warning | ❌ Fail | N/A

---

## 1. Crawlability & Indexing (10 points)

- [ ] `robots.txt` accessible at `/robots.txt` and not blocking key pages/assets
- [ ] XML sitemap exists and is submitted to Google Search Console
- [ ] Sitemap contains only canonical, indexable URLs (no 3xx/4xx/noindex pages)
- [ ] No important pages blocked by `noindex` meta tag
- [ ] No important pages blocked by `X-Robots-Tag` HTTP header
- [ ] Canonical tags present and correct on all pages
- [ ] No canonical chains (A canonicals to B which canonicals to C)
- [ ] Orphan pages addressed (pages with no internal links pointing to them)
- [ ] Pagination handled correctly (standalone pages or canonical to main)
- [ ] Hreflang implemented correctly (for multilingual sites)

---

## 2. Redirects & Status Codes (6 points)

- [ ] No broken internal links (404 errors)
- [ ] No broken external links on key pages (404 errors)
- [ ] All redirects are 301 (permanent), not 302 (temporary) unless intentional
- [ ] No redirect chains longer than 1 hop
- [ ] No redirect loops
- [ ] HTTPS redirect: HTTP → HTTPS working correctly

---

## 3. HTTPS & Security (4 points)

- [ ] Site fully on HTTPS (no mixed content warnings)
- [ ] SSL certificate valid and not expiring soon
- [ ] HSTS header present
- [ ] Security headers present (X-Frame-Options, CSP)

---

## 4. Site Architecture & URLs (5 points)

- [ ] URL structure is clean, readable, keyword-friendly
- [ ] No URL parameters creating duplicate content
- [ ] Consistent trailing slash usage (choose one, redirect the other)
- [ ] Site depth: important pages reachable within 3 clicks
- [ ] No excessively long URLs (>115 chars)

---

## 5. On-Page Elements (10 points)

- [ ] Every page has a unique, optimized `<title>` tag (50–60 chars)
- [ ] Every page has a unique meta description (120–158 chars)
- [ ] Each page has exactly one `<h1>` containing primary keyword
- [ ] Heading hierarchy logical (H1 → H2 → H3, no skips)
- [ ] Primary keyword in first 100 words of body content
- [ ] Images have descriptive `alt` text
- [ ] Images have `width` and `height` attributes
- [ ] Internal links use descriptive anchor text (not "click here")
- [ ] No keyword stuffing or hidden text
- [ ] Structured data / schema markup implemented where applicable

---

## 6. Core Web Vitals & Performance (7 points)

- [ ] LCP ≤ 2.5s (desktop and mobile)
- [ ] INP ≤ 200ms
- [ ] CLS ≤ 0.1
- [ ] Hero/above-fold images preloaded (`<link rel="preload">`)
- [ ] Images in next-gen format (WebP/AVIF)
- [ ] Render-blocking JS/CSS minimized
- [ ] Server response time (TTFB) ≤ 600ms

---

## 7. Mobile & Accessibility (4 points)

- [ ] Mobile-friendly (passes Google's Mobile-Friendly Test)
- [ ] Viewport meta tag present
- [ ] Touch targets ≥ 44×44px
- [ ] Text readable without zooming (font-size ≥ 16px for body)

---

## 8. Content Quality (4 points)

- [ ] No significant thin content pages (< 300 words without strong signals)
- [ ] No duplicate content issues (internal or external)
- [ ] Content demonstrates E-E-A-T signals
- [ ] Content freshness: pages updated within past 12 months where relevant

---

## Scoring

| Score | Result |
|---|---|
| 45–50 | Excellent — minor polish needed |
| 35–44 | Good — a few issues to address |
| 25–34 | Needs work — meaningful ranking impact likely |
| <25 | Critical — significant SEO problems |

---

## Priority Matrix

Fix in this order:
1. **P0 (Immediate):** Crawl blocks, mass noindex, redirect loops, broken HTTPS
2. **P1 (This Sprint):** Duplicate content, missing canonicals, CWV failures
3. **P2 (Next Sprint):** Meta tags, heading structure, internal linking
4. **P3 (Ongoing):** Content freshness, schema, CLS improvements
