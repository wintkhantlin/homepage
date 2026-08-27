---
name: Chate Sat
type: disaster relief
description: Chate Sat is an application designed to facilitate the coordination of volunteers during disasters.
seoTitle: Chate Sat Disaster Relief App Case Study | Wint Khant Lin
seoDescription: Explore Chate Sat, a disaster relief app connecting volunteers, aid requests, relief centers, donors, and verified information on a shared map.
source: https://github.com/wintkhantlin/chate-sat
technologies: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL", "Leaflet", "Better Auth"]
img: ../../assets/img/chatesat.png
publishedDate: 2025-11-09
color: "#e6abf4"
caseStudy:
  status: 2025 hackathon project
  challenge: Disaster response in Myanmar can be slowed by scattered communication, duplicated work, and the absence of one trusted map for requests, teams, and relief centers.
  approach: Chate Sat centers coordination around a shared map and an admin-verified information model connecting volunteer groups, relief centers, donors, help requests, and disaster zones.
  architecture:
    - Next.js application with TypeScript and Tailwind CSS.
    - PostgreSQL persistence with Better Auth.
    - Leaflet and OpenStreetMap for map-centered coordination.
    - Administrative workflows for approving volunteers and reports.
  highlights:
    - Maps relief centers, volunteer groups, disaster zones, and help requests.
    - Supports relief-center capacity and status information.
    - Provides community requests and donation campaigns.
    - Includes localized safety guidance and administrative controls.
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
