# Backend

Local Express API serving synthetic multi-token subnet market data for the TAO.com take-home.

## Setup

```bash
pnpm install
pnpm --filter @tao-takehome/backend dev
```

The API runs on `http://localhost:4000` unless `PORT` is set.

## Configuration

Copy `.env.example` from the repository root if you want to change defaults.

```bash
PORT=4000
ENABLE_HISTORY_LATENCY=true
HISTORY_LATENCY_MULTIPLIER=1
ENABLE_API_INSTABILITY=true
```

## Routes

- `GET /health`
- `GET /api/market/summary`
- `GET /api/tokens`
- `GET /api/tokens/:id`
- `GET /api/tokens/:id/history?range=1h|24h|7d|30d|90d|1y|all`
- `GET /api/tokens/:id/stats?range=1h|24h|7d|30d|90d|1y|all`
- `GET /api/tokens/:id/transactions`
- `GET /api/tokens/:id/events`

The API intentionally behaves like a real-world service and is not uniformly fast or perfect. Simulated latency and instability are enabled by default.
