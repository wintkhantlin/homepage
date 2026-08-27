---
name: Zay Chin
type: collaborative shopping
description: A collaborative shopping cart application that allows family members to create groups, add items to shared carts, and track shopping locations on a map.
seoTitle: Zay Chin Collaborative Shopping Case Study | Wint Khant Lin
seoDescription: Explore Zay Chin, a collaborative shopping app with family groups, shared carts, real-time updates, and map-based locations built in Flutter.
source: https://github.com/wintkhantlin/Zay-Chin
img: ../../assets/img/zay_chin.png
technologies: ["Flutter", "Dart", "Bun", "Fastify", "PostgreSQL", "PostGIS", "WebSocket"]
publishedDate: 2026-01-01
color: "#000"
caseStudy:
  status: Cross-platform project
  challenge: Family shopping is collaborative and location-aware, but ordinary lists do not keep group changes, item locations, and invitations synchronized.
  approach: Zay Chin combines a Flutter mobile client with a Fastify API, WebSocket updates, and PostGIS-backed location data so a group can maintain one shared view of a shopping trip.
  architecture:
    - Flutter application for iOS and Android.
    - Bun and Fastify backend with Drizzle ORM.
    - PostgreSQL with PostGIS geometry for item locations.
    - RS256 JWT authentication and secure device storage.
    - WebSocket channel for real-time cart synchronization.
  highlights:
    - Creates family groups and member invitations.
    - Synchronizes shared cart changes in real time.
    - Associates shopping items with map locations.
    - Displays saved locations through OpenStreetMap.
  diagram: |
    flowchart LR
      A["Family Member"] --> B["Flutter Application"]
      B --> C["Fastify API"]
      C --> D["Authentication"]
      C --> E["Shopping Cart Service"]
      E --> F[("PostgreSQL + PostGIS")]
      E -->|"Real-time updates"| G["WebSocket"]
      G --> B
      B --> H["OpenStreetMap"]
---
