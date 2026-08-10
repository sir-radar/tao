# Candidate Brief

## Overview

Build the two core pages of a TAO subnet token exchange as a responsive web app, using the provided local backend and the supplied Figma designs:

1. **Explore Tokens** — a token discovery page with a global market stats bar and a sortable token table.
2. **Token Details** — a single-token page with the current price, a historical price chart with timeframe switching, and a stats section.

The backend serves synthetic data and intentionally behaves like a real-world API: it is not uniformly fast, and it is not always perfect. Treat that as part of the product problem.

## Objective

Create a polished, usable token exchange front end that fetches data from the backend, presents it clearly, and stays responsive when API requests are slow or imperfect.

## Core Requirements

### Explore Tokens page

- Display the global market summary stats bar.
- Display the token table: name, subnet, market cap, price, price movement (24H / 7D / 1M), volumes, transactions, and emissions.
- Support sorting the table by at least market cap and price movement.
- Navigating to a token opens its Token Details page.
- The table should remain smooth and responsive with the full token list the API returns.

### Token Details page

- Display the token name, subnet, current price, and 24H movement.
- Render a historical price chart.
- Support timeframe switching: `1H`, `24H`, `7D`, `30D`, `90D`, `1Y`, `All`.
- Display the Stats tab content for the selected token: highlights, financials, subnet data, trading volume, and price history blocks.
- Build the right-hand column (swap panel, position card, orders card) as **static, non-functional UI** matching the design. No transaction logic is required.

### Both pages

- Handle loading, error, and empty states.
- Keep the interface feeling responsive despite slower or imperfect requests.
- Be responsive across common desktop viewport sizes (the design includes a 1728px default and a 1024px condensed layout).

## Required Deliverable: AI Usage Writeup

Alongside your code, include an `AI_USAGE.md` in your submission describing how you used AI tooling while building this exercise. We expect most engineers to use AI tools; we want to understand *how* you use them. Cover:

- Which tools you used and what you used them for.
- Your workflow: how you prompted, iterated, and broke down the work.
- Examples of AI output you accepted, and output you rejected or rewrote — and why.
- How you verified AI-generated code before trusting it.

Honesty matters more than volume. "I did not use AI for X because Y" is a valid and useful answer.

## API Documentation

The backend runs on `http://localhost:4000` by default.

### `GET /health`

```json
{ "ok": true }
```

### `GET /api/market/summary`

Global market stats for the Explore page stats bar.

```json
{
  "generatedAt": "2026-06-05T10:30:00.000Z",
  "marketCap": 29233701123,
  "marketCapChangePercent24h": 0.82,
  "volume24h": 82265372.03,
  "volumeChangePercent24h": 0.98,
  "volumeToMarketCapPercent": 0.28,
  "dailyTrades": 1246618,
  "dailyTradesChangePercent24h": -0.13,
  "dailyTraders": 285971,
  "dailyTradersChangePercent24h": 1.13,
  "activeWallets": 2100000,
  "activeWalletsChangePercent24h": -0.6
}
```

### `GET /api/tokens`

The full token list for the Explore table.

```json
{
  "tokens": [
    {
      "id": "gradients",
      "name": "Gradients",
      "symbol": "GRAD",
      "subnet": "SN56",
      "price": 5.67,
      "marketCap": 9185400,
      "changePercent24h": -1.42,
      "changePercent7d": 3.86,
      "changePercent30d": -8.05,
      "netVolume24h": -2801.47,
      "buyVolume24h": 10125.31,
      "sellVolume24h": 12926.78,
      "transactions24h": 4342,
      "emissionsPerDay": 0.55
    }
  ],
  "meta": { "latencyMs": 1240, "latencyEnabled": true }
}
```

### `GET /api/tokens/:id`

Current pricing and headline figures for one token.

```json
{
  "id": "gradients",
  "name": "Gradients",
  "symbol": "GRAD",
  "subnet": "SN56",
  "currency": "USD",
  "price": 5.67,
  "change24h": -0.0817,
  "changePercent24h": -1.42,
  "marketCap": 9185400,
  "circulatingSupply": 1620000,
  "maxSupply": 21000000,
  "netVolume24h": -2801.47,
  "traders24h": 589,
  "lastUpdated": "2026-06-05T10:30:00.000Z"
}
```

### `GET /api/tokens/:id/history?range=1h|24h|7d|30d|90d|1y|all`

Historical price points for the requested range. This endpoint may be slower than other endpoints, and longer ranges return substantially more data. Treat both as part of the product problem.

```json
{
  "id": "gradients",
  "symbol": "GRAD",
  "range": "24h",
  "generatedAt": "2026-06-05T10:30:00.000Z",
  "points": [
    { "timestamp": "2026-06-04T10:30:00.000Z", "price": 5.7517 }
  ],
  "meta": { "latencyMs": 1470, "latencyEnabled": true }
}
```

### `GET /api/tokens/:id/stats?range=1h|24h|7d|30d|90d|1y|all`

Grouped stats for the Token Details stats blocks: `price` (open, close, high, low, change, all-time high/low), `financials` (market cap, FDV, supplies, staking), `trading` (volumes, transactions, buyers and sellers), and `subnetData` (emissions, validators, miners, registration).

### `GET /api/tokens/:id/transactions`

Recent synthetic trades for the token (supports the Transactions tab stretch goal).

```json
{
  "id": "gradients",
  "symbol": "GRAD",
  "generatedAt": "2026-06-05T10:30:00.000Z",
  "transactions": [
    {
      "id": "gradients-tx-1",
      "timestamp": "2026-06-05T10:22:14.000Z",
      "side": "buy",
      "price": 5.64,
      "tokens": 37842.91,
      "valueUsd": 213433.99,
      "valueTao": 517.64,
      "coldkey": "1a2b3c4d5e6f...",
      "fee": 0.12
    }
  ]
}
```

### `GET /api/tokens/:id/events`

Optional chart annotation events.

```json
[
  { "timestamp": "2026-06-04T14:00:00.000Z", "title": "Subnet rewards update", "type": "network" }
]
```

## Design Expectations

Use the Figma file linked in `DESIGN_BRIEF.md`. Aim for a close implementation of the intended layout, spacing, hierarchy, and interaction states while making reasonable decisions where the spec is incomplete.

We want both design fidelity and a genuinely usable interface, so treat them as a single bar rather than a choice. Where the two conflict — or where the design does not cover a state you had to build, such as loading, error, or empty — make the call you think is right and explain it in your notes. We are as interested in the reasoning as in the result.

The design includes a default desktop layout (1728px) and a condensed layout (1024px). Your implementation should adapt sensibly between them.

## Loading, Error, and Empty States

The app should handle incomplete or delayed data gracefully. Consider the user experience when switching timeframes, navigating between tokens, refreshing data, losing a request, or receiving no usable data.

## Submission Instructions

Submit your completed app as a repository or archive, following the instructions from the recruiting team.

Your submission should include:

- Setup and run instructions
- `AI_USAGE.md` (see above)
- Any assumptions you made
- Tradeoffs you chose because of the timebox
- Anywhere you departed from the design, and the reasoning behind it
- Anything unfinished that you would improve with more time
- Any tests you added and how to run them

## Timebox

Plan to spend 3-5 hours. Please stop at 6 hours maximum.

We would rather see a focused, thoughtful implementation than a broad but fragile one. If you run short on time, prioritize the Token Details page and its chart behavior.

## Optional Stretch Goals

- Implement the Transactions tab on the Token Details page using the transactions endpoint.
- Build the "Connect wallet" flow entry point as it appears in the designs (UI only — no real wallet or browser-extension integration is expected).
- Use the events endpoint as chart annotations.
- Add lightweight automated tests around data handling or key UI behavior.
- Add accessible keyboard and screen reader affordances.
- Add a small amount of polish to interactions or transitions.

## What We Care About

- Clear product judgment
- Reliable API integration
- Thoughtful handling of slow, large, and failed responses
- Maintainable component and state organization
- Clean TypeScript where applicable
- Faithful implementation of the design, held together with genuine usability
- Clear reasoning wherever those two pulled against each other
- Accessible and responsive UI behavior
- A candid, specific account of how you worked with AI tools

## What We Do Not Care About

- Rebuilding a full design system
- Functional swaps, portfolios, wallets, auth, payments, or deployment
- Overly complex infrastructure
- Adding features that distract from the two core pages
