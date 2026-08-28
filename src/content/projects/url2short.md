---
name: URL2Short
type: utility
description: A scalable URL shortener for custom links, fast redirects, and detailed click analytics.
seoTitle: URL2Short URL Shortener Case Study | Wint Khant Lin
seoDescription: Explore URL2Short, a scalable URL shortener for custom links, low-latency redirects, and click analytics with Redis, Kafka, and ClickHouse.
source: https://github.com/wintkhantlin/url2short
img: ../../assets/img/url2short.png
technologies: ["React", "TypeScript", "Go", "PostgreSQL", "ClickHouse", "Redis", "Kafka"]
publishedDate: 2026-01-01
featured: true
featuredOrder: 2
maturity: built
context: open-source
role: Backend and systems engineering
proofPoints:
  - Redis keeps destination lookups on a low-latency path without repeated database reads.
  - Kafka and ClickHouse move click analytics entirely outside the redirect response.
color: "#000"
caseStudy:
  status: Open-source project
  challenge: >-
    Redirects are the product's critical path: every extra database query makes a short link feel slower. At the same time, useful analytics require browser, location, and device events to be recorded reliably without delaying the visitor or overloading the transactional database.
  approach: URL2Short separates link management, redirect delivery, and analytics ingestion. Redis serves the fast lookup path; redirect events are published to Kafka and processed independently by a Go analytics service into ClickHouse. PostgreSQL remains the source of truth for link ownership and configuration.
  architecture:
    - A React and Vite dashboard lets users create links and inspect analytics.
    - TypeScript management and redirect services keep write operations separate from the latency-sensitive read path.
    - PostgreSQL stores canonical link records while Redis caches slug-to-destination lookups.
    - Kafka buffers click events so analytics failures do not block redirects.
    - A Go service aggregates events into ClickHouse for analytical queries.
  highlights:
    - Creates generated or custom short links through a management dashboard.
    - Reports browser, country, and operating-system dimensions for each link.
    - Keeps analytics processing completely outside the redirect hot path.
    - Runs the multi-service environment locally with Docker Compose.
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
