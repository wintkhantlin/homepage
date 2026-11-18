---
name: Chate Sat
type: disaster relief
description: Chate Sat is an application designed to facilitate the coordination of volunteers during disasters.
seoTitle: Chate Sat Disaster Relief App Case Study | Wint Khant Lin
seoDescription: Explore Chate Sat, a disaster relief app connecting volunteers, aid requests, relief centers, donors, and verified information on a shared map.
source: https://github.com/wintkhantlin/chate-sat
technologies: ["PostgreSQL", "Next.js", "Leaflet", "Better Auth", "TypeScript", "Tailwind CSS"]
img: ../../assets/img/chatesat.png
publishedDate: 2025-11-09
featured: true
featuredOrder: 6
maturity: prototype
context: hackathon
role: Product and application engineering
proofPoints:
  - title: Unified relief map
    detail: "A shared Leaflet map brings relief centers, requests, volunteer groups, and disaster zones into one view."
  - title: Trusted information
    detail: "Admin verification workflows distinguish trusted operational information from community submissions."
color: "#e6abf4"
caseStudy:
  status: 2025 hackathon project
  challenge: Disaster response in Myanmar can be slowed by scattered communication, duplicated work, and the absence of one trusted map for requests, teams, and relief centers.
  approach: Chate Sat centers coordination around a shared map and an admin-verified information model connecting volunteer groups, relief centers, donors, help requests, and disaster zones.
  components:
    - nodes: [B]
      detail: Next.js application with TypeScript and Tailwind CSS.
    - nodes: [E, C]
      detail: PostgreSQL persistence with Better Auth.
    - nodes: [G, H]
      detail: Leaflet and OpenStreetMap for map-centered coordination.
    - nodes: [F]
      detail: Administrative workflows for approving volunteers and reports.
  features:
    - text: Maps relief centers, volunteer groups, disaster zones, and help requests.
      nodes: [G]
    - text: Supports relief-center capacity and status information.
      nodes: []
    - text: Provides community requests and donation campaigns.
      nodes: []
    - text: Includes localized safety guidance and administrative controls.
      nodes: []
  diagram: |
    flowchart LR
      A["Volunteers and Donors"] --> B["Next.js Application"]
      B --> C["Better Auth"]
      B --> D["Coordination API"]
      D --> E[("PostgreSQL")]
      D --> F["Admin Verification"]
      B --> G["Leaflet Map"]
      G --> H["OpenStreetMap"]
---
