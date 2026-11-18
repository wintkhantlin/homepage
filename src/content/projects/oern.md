---
name: Oern
type: logistics
description: A door-to-door delivery platform where customers follow their parcel live from rider handoff to their door.
seoTitle: Oern Delivery Platform Case Study | Wint Khant Lin
seoDescription: Explore Oern, a delivery logistics platform for Yangon with live parcel tracking, rider dispatch, multi-stop routing, and cash-on-delivery reconciliation on Supabase.
source: https://github.com/wintkhantlin/Oern
demo: https://oern-app.vercel.app
img: ../../assets/img/oern.png
technologies: ["Next.js", "TypeScript", "Supabase", "PostgreSQL", "Mapbox GL", "RxJS", "Playwright"]
publishedDate: 2026-10-20
featured: true
featuredOrder: 2
maturity: prototype
context: hackathon
role: Full-stack engineering
proofPoints:
  - title: Live parcel tracking
    detail: "Tracking starts when a rider collects the parcel and streams location over Supabase Realtime until delivery closes."
  - title: Role-scoped data
    detail: "Five workspaces share one database, with row-level security deciding what each role can read and change."
color: "#c2410c"
caseStudy:
  status: 2026 hackathon project
  challenge: >-
    Local delivery loses visibility the moment a parcel leaves the seller. Customers cannot see where it is, riders plan routes by hand, managers reconcile cash on delivery manually, and support staff answer complaints with no shared context.
  approach: >-
    Oern puts customers, riders, managers, sellers and support on one workflow. Dispatch recommends riders and vehicles from availability, workload, proximity and parcel capacity; ETAs are recalculated from route progress, vehicle speed and manager-verified road reports, and cash on delivery is tracked from collection to hand-over.
  components:
    - nodes: [B]
      detail: Next.js workspaces for customers, riders, managers, sellers and support share Supabase Auth.
    - nodes: [C]
      detail: PostgreSQL row-level security enforces each role's access, with versioned migrations and transactional SQL workflow tests.
    - nodes: [D]
      detail: Supabase Realtime streams rider location to the customer's tracking map once a parcel is collected.
    - nodes: [E, F]
      detail: An adaptive large neighbourhood search plans multi-stop, multi-vehicle routes using the Mapbox Matrix API.
    - nodes: [G]
      detail: Complaints are classified by an LLM through OpenRouter, with a pattern-based fallback when it is unavailable.
  features:
    - text: Customers request a pickup in three steps and follow their own orders on a live map.
      nodes: [A]
    - text: Riders verify each parcel ID at handover and record cash on delivery per stop.
      nodes: [R]
    - text: Managers reconcile expected against collected cash and flag short payments.
      nodes: [M]
    - text: Playwright suites cover customer, rider and manager flows, accessibility and dark mode.
      nodes: []
  diagram: |
    flowchart LR
      A["Customer"] --> B["Next.js workspaces"]
      R["Rider"] --> B
      M["Manager"] --> B
      B --> C[("Supabase Postgres + RLS")]
      R -->|"GPS after pickup"| D["Supabase Realtime"]
      D --> A
      M --> E["Route planner (ALNS)"]
      E --> F["Mapbox Matrix API"]
      B --> G["Complaint classifier"]
---
