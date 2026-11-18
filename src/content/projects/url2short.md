---
name: URL2Short
type: utility
description: A scalable URL shortener for custom links, fast redirects, and detailed click analytics.
seoTitle: URL2Short URL Shortener Case Study | Wint Khant Lin
seoDescription: Explore URL2Short, a scalable URL shortener for custom links, low-latency redirects, and click analytics with Redis, Kafka, and ClickHouse.
source: https://github.com/wintkhantlin/url2short
img: ../../assets/img/url2short.png
technologies: ["Go", "Redis", "Kafka", "ClickHouse", "PostgreSQL", "React", "TypeScript"]
publishedDate: 2026-01-01
featured: true
featuredOrder: 4
maturity: built
context: open-source
role: Backend and systems engineering
proofPoints:
  - title: Low-latency redirects
    detail: "Redis keeps destination lookups on a low-latency path without repeated database reads."
  - title: Decoupled analytics
    detail: "Kafka and ClickHouse move click analytics entirely outside the redirect response."
color: "#000"
caseStudy:
  status: Open-source project
  challenge: >-
    Redirects are the product's critical path: every extra database query makes a short link feel slower. At the same time, useful analytics require browser, location, and device events to be recorded reliably without delaying the visitor or overloading the transactional database.
  approach: URL2Short separates link management, redirect delivery, and analytics ingestion. Redis serves the fast lookup path; redirect events are published to Kafka and processed independently by a Go analytics service into ClickHouse. PostgreSQL remains the source of truth for link ownership and configuration.
  components:
    - nodes: [E]
      detail: A React and Vite dashboard lets users create links and inspect analytics.
    - nodes: [F, B]
      detail: TypeScript management and redirect services keep write operations separate from the latency-sensitive read path.
    - nodes: [G, C]
      detail: PostgreSQL stores canonical link records while Redis caches slug-to-destination lookups.
    - nodes: [D]
      detail: Kafka buffers click events so analytics failures do not block redirects.
    - nodes: [H, I]
      detail: A Go service aggregates events into ClickHouse for analytical queries.
  features:
    - text: Creates generated or custom short links through a management dashboard.
      nodes: [E]
    - text: Reports browser, country, and operating-system dimensions for each link.
      nodes: []
    - text: Keeps analytics processing completely outside the redirect hot path.
      nodes: []
    - text: Runs the multi-service environment locally with Docker Compose.
      nodes: []
  diagram: |
    flowchart LR
      A["Visitor"] --> B["Redirect Service"]
      B --> C[("Redis Cache")]
      C -->|"destination"| A
      B --> D["Kafka"]
      E["Management Dashboard"] --> F["Management API"]
      F --> G[("PostgreSQL")]
      D --> H["Go Analytics Service"]
      H --> I[("ClickHouse")]
      I --> E
---
