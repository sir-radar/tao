# TAO Token Exchange Take-Home

This repository is a frontend engineering take-home exercise scaffold. It provides a small local backend that serves synthetic multi-token subnet market data, intentionally includes realistic API imperfections, and leaves the web application implementation to the candidate.

The exercise assesses how candidates translate designs into a polished interface, connect to a simple API, handle imperfect request behavior, organize maintainable frontend code, and work effectively with AI tooling.

## Quick Start

```bash
pnpm install
pnpm backend:dev
```

The backend runs on `http://localhost:4000` by default.

Useful checks:

```bash
pnpm backend:test
pnpm backend:typecheck
pnpm backend:build
```

## Repository Layout

```text
apps/backend      Local API for synthetic subnet token market data
apps/web-starter  Optional empty web starter area
```

Task instructions live in `CANDIDATE_BRIEF.md` and `DESIGN_BRIEF.md`.

## Designs

The Figma link and the exact frames in scope are documented in `DESIGN_BRIEF.md`. Candidates build two pages: **Explore Tokens** and **Token Details**, targeting desktop web (1728px default and 1024px condensed layouts).

## Candidate Task

Candidates build a responsive web app. They may use the starter folder or replace it with their preferred setup, as long as the submission is easy to run locally.

The expected timebox is 3-5 hours, with a maximum of 6 hours. Candidates should not overengineer. We care more about thoughtful product and engineering tradeoffs than a large feature surface.

The backend intentionally behaves like an imperfect real API. Candidates should account for slow requests, large responses, loading states, error states, empty states, and interaction feedback.

Submissions must include a README with run instructions, assumptions, and notable tradeoffs, plus an `AI_USAGE.md` describing how the candidate worked with AI tools.

## Backend API

- `GET /health`
- `GET /api/market/summary`
- `GET /api/tokens`
- `GET /api/tokens/:id`
- `GET /api/tokens/:id/history?range=1h|24h|7d|30d|90d|1y|all`
- `GET /api/tokens/:id/stats?range=1h|24h|7d|30d|90d|1y|all`
- `GET /api/tokens/:id/transactions`
- `GET /api/tokens/:id/events`

See `CANDIDATE_BRIEF.md` for full API documentation.
