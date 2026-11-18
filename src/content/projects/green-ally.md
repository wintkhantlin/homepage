---
name: Green Ally
type: agritech
description: An explainable crop-rotation planner that tests next-season options against NASA Earth observations and ten years of past weather.
seoTitle: Green Ally Crop Rotation Planner Case Study | Wint Khant Lin
seoDescription: Explore Green Ally, a NASA Space Apps 2026 prototype that compares whole crop rotations for Myanmar farms using NASA POWER weather, satellite layers, and soil data.
source: https://github.com/wintkhantlin/green-ally
demo: https://greenally.vercel.app
img: ../../assets/img/green_ally.png
technologies: ["Next.js", "TypeScript", "Mapbox GL", "NASA POWER", "SoilGrids", "Zod", "Vitest"]
publishedDate: 2026-11-14
featured: true
featuredOrder: 1
maturity: prototype
context: hackathon
role: Full-stack and data engineering
proofPoints:
  - title: Historical replay
    detail: "Each rotation is replayed against the same 2016–2025 daily weather, so options are compared on identical seasons."
  - title: Evidence on every result
    detail: "Recommendations carry their dataset, resolution and limits, and missing observations never become favourable scores."
color: "#2f6b4f"
caseStudy:
  status: NASA Space Apps Challenge 2026 prototype
  challenge: >-
    Satellite products are not crop plans. A farmer in the Ayeyarwady Delta or the Central Dry Zone needs to know what to plant after this harvest and what could go wrong, but raw NASA data arrives at regional scale, with gaps and scientific terminology that make it hard to act on.
  approach: >-
    Green Ally compares whole crop sequences rather than ranking single crops. Candidate rotations come from regional crop templates and sowing windows, then are replayed against ten past seasons of NASA POWER weather to find dry spells, heat and rain shortfalls that hit sensitive growth stages. A minimax-regret comparison highlights options that are rarely a poor choice, and every result explains why in plain language.
  components:
    - nodes: [A]
      detail: A phone-first Next.js app stores fields in the browser with IndexedDB, so no account is needed.
    - nodes: [C, E]
      detail: Route handlers fetch weather, soil and remote-sensing data in separate lanes, because each source arrives at a different speed.
    - nodes: [E, C]
      detail: NASA POWER drives FAO-56 reference evapotranspiration; SoilGrids supplies soil texture, pH and water retention.
    - nodes: [B, A]
      detail: A rotation engine scores suitability, water demand, disease carryover and income ranges against farmer priorities.
    - nodes: [G]
      detail: An evidence layer attaches source, resolution and date to every claim and shows what is unknown.
  features:
    - text: Compares the current rotation with at least two alternatives over the same historical weather.
      nodes: []
    - text: Lets farmers weight soil health, water saving and income to decide what "best" means.
      nodes: [A]
    - text: Screens flood, heat, water and erosion vulnerability for a drawn field.
      nodes: []
    - text: Reports a 51% NASA POWER rainfall underestimate in Mandalay instead of hiding it.
      nodes: [C]
  diagram: |
    flowchart LR
      A["Farmer's field and priorities"] --> B["Rotation candidates"]
      C["NASA POWER weather"] --> D["Historical replay 2016–2025"]
      E[("SoilGrids soil")] --> B
      B --> D
      D --> F["Regret-based comparison"]
      F --> G["Plain-language reasons and evidence"]
      G --> A
---
