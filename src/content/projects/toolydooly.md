---
name: ToolyDooly
type: productivity
description: A Todo application built with NestJS, Express, Vue, Postgres, and MongoDB, running in a Dockerized microservice architecture.
seoTitle: ToolyDooly Microservices Case Study | Wint Khant Lin
seoDescription: Explore ToolyDooly, a Dockerized microservices todo app built with Vue, NestJS, PostgreSQL, MongoDB, Redis, and RabbitMQ.
source: https://github.com/wintkhantlin/toolydooly
img: ../../assets/img/toolydooly.png
technologies: ["Vue", "NestJS", "Express", "PostgreSQL", "MongoDB", "Redis", "RabbitMQ", "Docker"]
publishedDate: 2025-11-05
color: "#b1badc"
caseStudy:
  status: Work in progress
  challenge: A familiar todo product can become a practical environment for learning service boundaries, authentication, queues, caching, and multiple persistence models.
  approach: ToolyDooly uses a monorepo of focused services for its API, authentication, todo operations, and Vue interface, with Docker Compose providing the shared development infrastructure.
  architecture:
    - API gateway with separate authentication and todo services.
    - PostgreSQL for authentication and MongoDB for todo data.
    - Redis-backed sessions and RabbitMQ messaging.
    - Vue web application inside a shared monorepo.
    - Docker Compose for local services and persisted development data.
  highlights:
    - Supports todo creation and management through dedicated services.
    - Uses RS512 key pairs for JSON Web Tokens.
    - Separates authentication and todo persistence concerns.
    - Documents local prerequisites and containerized startup.
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
