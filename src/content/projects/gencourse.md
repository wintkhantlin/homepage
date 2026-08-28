---
name: GenCourse
type: AI EduTech
description: GenCourse, an AI web app that turns your learning prompts into structured, interactive courses.
seoTitle: GenCourse AI Learning Platform Case Study | Wint Khant Lin
seoDescription: Explore GenCourse, an AI learning platform that turns prompts into structured courses using React, Hono, Python, Go, RabbitMQ, and PostgreSQL.
source: https://github.com/wintkhantlin/gencourse
technologies: ["React", "TypeScript", "Hono", "Python", "Go", "PostgreSQL", "RabbitMQ", "Ory"]
img: ../../assets/img/gencourse.png
publishedDate: 2026-03-14
featured: true
featuredOrder: 1
maturity: built
context: open-source
role: Product and systems engineering
proofPoints:
  - RabbitMQ separates long-running AI course generation from the learner-facing request path.
  - A Go WebSocket service returns live progress while PostgreSQL remains the source of truth.
color: "#e6abf4"
caseStudy:
  status: Open-source project
  challenge: A learner expects a useful course from only a short prompt, but generating an outline, lessons, and quizzes is a long-running AI workflow. The product must coordinate that work without freezing the interface, losing progress, or coupling the learning experience to one model provider.
  approach: GenCourse treats course generation as an asynchronous system. A management service owns course data, a Python worker handles model orchestration through RabbitMQ, and a Go notification service streams progress back to the browser. Ory handles identity at the gateway so each service can remain focused on one responsibility.
  architecture:
    - React and Vite provide the learner-facing course workspace behind the Oathkeeper gateway.
    - A TypeScript management service built with Hono and Drizzle persists course state in PostgreSQL.
    - A Python worker consumes RabbitMQ jobs, coordinates AI providers, and publishes course-generation events.
    - A Go notification service converts progress events into WebSocket updates for the active browser session.
    - Ory Kratos manages identity and sessions while Oathkeeper protects service boundaries.
  highlights:
    - Generates a structured outline, lessons, and quizzes from a learner's prompt.
    - Keeps long-running work visible through real-time progress notifications.
    - Allows model providers to change inside the worker without rewriting the product interface.
    - Reproduces the supporting services locally through Docker Compose.
  diagram: |
    flowchart LR
      A["Learner"] --> B["React + Vite"]
      B --> C["Oathkeeper Gateway"]
      C --> D["Course Management API"]
      C --> I["Ory Kratos"]
      D --> E[("PostgreSQL")]
      D --> F["RabbitMQ"]
      F --> G["Python AI Worker"]
      G --> F
      F --> H["Go Notification Service"]
      H -->|"WebSocket progress"| B
---
