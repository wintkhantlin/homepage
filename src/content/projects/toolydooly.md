---
name: ToolyDooly
type: productivity
description: A Todo application built with NestJS, Express, Vue, Postgres, and MongoDB, running in a Dockerized microservice architecture.
seoTitle: ToolyDooly Microservices Case Study | Wint Khant Lin
seoDescription: Explore ToolyDooly, a Dockerized microservices todo app built with Vue, NestJS, PostgreSQL, MongoDB, Redis, and RabbitMQ.
source: https://github.com/wintkhantlin/toolydooly
img: ../../assets/img/toolydooly.png
technologies: ["NestJS", "Express", "RabbitMQ", "Redis", "PostgreSQL", "MongoDB", "Docker", "Vue"]
publishedDate: 2025-11-05
featured: false
maturity: work-in-progress
context: personal
role: Backend architecture and application engineering
proofPoints:
  - title: Explicit service boundaries
    detail: "Separate gateway, authentication, and todo services make service boundaries explicit."
  - title: Multi-store persistence
    detail: "PostgreSQL, MongoDB, Redis, and RabbitMQ provide a practical multi-store learning environment."
color: "#b1badc"
caseStudy:
  status: Work in progress
  challenge: A familiar todo product can become a practical environment for learning service boundaries, authentication, queues, caching, and multiple persistence models.
  approach: ToolyDooly uses a monorepo of focused services for its API, authentication, todo operations, and Vue interface, with Docker Compose providing the shared development infrastructure.
  components:
    - nodes: [C, D, E]
      detail: API gateway with separate authentication and todo services.
    - nodes: [F, H]
      detail: PostgreSQL for authentication and MongoDB for todo data.
    - nodes: [G, I]
      detail: Redis-backed sessions and RabbitMQ messaging.
    - nodes: [B]
      detail: Vue web application inside a shared monorepo.
    - nodes: []
      detail: Docker Compose for local services and persisted development data.
  features:
    - text: Supports todo creation and management through dedicated services.
      nodes: [E]
    - text: Uses RS512 key pairs for JSON Web Tokens.
      nodes: []
    - text: Separates authentication and todo persistence concerns.
      nodes: [D, E]
    - text: Documents local prerequisites and containerized startup.
      nodes: []
  diagram: |
    flowchart LR
      A["User"] --> B["Vue Application"]
      B --> C["API Gateway"]
      C --> D["Authentication Service"]
      C --> E["Todo Service"]
      D --> F[("PostgreSQL")]
      D --> G[("Redis Sessions")]
      E --> H[("MongoDB")]
      D <--> I["RabbitMQ"]
      E <--> I
---
