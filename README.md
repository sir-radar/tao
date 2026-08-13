# TAO Token Exchange

## Overview

This repository contains a desktop token exchange interface for TAO subnet markets. The implementation covers two routes:

| Route         | Purpose                                                                     |
| ------------- | --------------------------------------------------------------------------- |
| `/`           | Market summary and a sortable table containing all 250 tokens               |
| `/tokens/:id` | Token price history, range-based stats, and a disabled trading preview rail |

Explore keeps its sort state in `sort` and `dir` URL parameters. Token Details keeps the selected history range in `range` and uses `24h` by default. Invalid parameters return to the documented defaults.

## Stack and architecture

- Next.js 16 App Router, React 19, strict TypeScript, and Tailwind CSS v4.
- shadcn/ui with the Radix base and `radix-nova` style. Components live in `apps/web-starter/src/components/ui` so the application owns their source.
- TanStack Query manages caching, cancellation, retained range data, and scoped retries.
- Lightweight Charts renders the price series, crosshair, tooltip, and UTC axes.

The browser calls `/api/*` through a same-origin Next rewrite. API transport and tolerant payload normalization live under `src/lib/api`; presentation components receive normalized values and render unusable leaves as an em dash. History normalization drops invalid points, keeps the last duplicate timestamp, and sorts the result by time.

The token list uses a semantic shadcn table with memoized stable sorting. The API returns 250 rows, and the table remains responsive without a virtualization dependency. Market cap and movement sorting use token ID as the deterministic tie-breaker and place missing values last.

## Running locally

Requirements: Node.js 20 or newer and pnpm 9.

```bash
pnpm install
pnpm --filter @tao-takehome/web-starter exec playwright install chromium
cp apps/web-starter/.env.example apps/web-starter/.env.local
```

Start the backend and web app in separate terminals:

```bash
pnpm backend:dev
```

```bash
pnpm web:dev
```

Open [http://localhost:3000](http://localhost:3000). The backend listens on `http://localhost:4000`.

### API configuration

`API_BASE_URL` controls the server-side rewrite target and defaults to `http://127.0.0.1:4000`. `NEXT_PUBLIC_API_BASE_URL` bypasses the rewrite and sends browser requests to the supplied origin. The same-origin default avoids cross-origin configuration in the web app.

## Commands

```bash
pnpm backend:test
pnpm backend:typecheck
pnpm backend:build

pnpm web:lint
pnpm web:typecheck
pnpm web:test
pnpm web:e2e
pnpm web:build
pnpm web:start
```

The production web build uses Webpack because Turbopack tries to open an internal worker port that this evaluation sandbox denies.

## Product behavior

- Explore fetches the market summary and token list as independent resources. Either section can fail and retry without hiding the other.
- Token Details fetches identity first, then history and stats for the same range. A range change retains the last valid content with an accurate displayed-range label until the new response arrives.
- Query functions consume TanStack Query's abort signal. Requests use range-specific cache keys, so a late response cannot replace the selected range.
- Unknown tokens show a dedicated 404 state. Empty, malformed, network, and HTTP failures receive distinct scoped states where the distinction helps recovery.
- Trading controls sit inside a disabled fieldset. The app has no mutation endpoint, wallet handler, swap handler, or order handler.

The chart canvas stays outside the accessibility tree. A figure caption reports the range, point count, open, close, high, low, and direction. Movement values pair color with an arrow, sign, and screen-reader direction. The table exposes sortable header semantics and keyboard horizontal scrolling.

## Design source and assumptions

The connected Figma identity lacked editor access to file `ShGOnid4sBkwGybMICX0qh`. The unavailable nodes were:

- Explore default: `5:678`
- Explore condensed: `5:2035`
- Token Details Stats: `5:4313`

I used PNG screenshot images, CSS exports, TAO logo, movement arrows, and control, link, and trading SVGs to match the dark palette, dense table, compact type scale, restrained borders, chart placement, and fixed desktop trading rail. I could not retrieve per-token artwork or reusable components, so token identity uses initials and Lucide icons fill action slots without supplied assets. I did not fabricate token or subnet artwork.

The Explore page follows the frame's measured geometry:

- 72px header and 64px desktop gutters
- 108px market cards inside a 140px summary band
- 78px market-view controls
- 44px table header and ten 56px visible rows
- 84px footer

At 1024px, the layout uses 24px gutters, six 149.33px market cards, the icon-only 36px search control, and complete Download and wallet controls. Numeric table columns condense from 122.22px to 100px so the initial viewport exposes Price, all three movement periods, 24H Net Volume, and Buy Volume before the sticky action rail.

Token Details follows the Stats frame's 1920x2042 geometry:

- 72px header and a 164px full-width token context band
- 1322px chart and stats workspace beside a 430px preview rail, with a 40px gap
- 542px chart block and a 1706px content region
- 236px Highlights, 354px Financials, 334px Subnet data, 402px Trading volume, and 196px Price history blocks
- 560px swap preview, 356px position preview, and 228px orders preview

The grouped blocks render every usable value from the stats response. The implementation leaves out screenshot badges that would require made-up percentage changes. The position and orders rail remains disabled preview content.

The app targets desktop widths. At narrow desktop widths, the table scrolls inside a labelled region and the detail rail moves below the chart at 900px. Mobile-specific navigation and trading layouts remain outside the brief.

## Tests and verification

Vitest covers boundary normalization, API error classification, formatting, range parsing, stable sorting, chart summaries, flat price domains, missing market values, range selection, table semantics, keyboard table scrolling, and disabled trading controls.

Playwright runs against an optimized Next production build with deterministic browser-level API fixtures. The browser suite covers all 250 Explore rows, required columns and market metrics, sorting in both directions with URL persistence, keyboard table scrolling, row action semantics, token-detail navigation, and loading geometry. Token Details coverage includes the headline, chart, grouped stats, disabled trading rail, all seven URL-backed ranges, invalid-range normalization, out-of-order response safety, and fresh-range cache reuse. Every test also fails on uncaught page and console errors. Failure artifacts are written to `apps/web-starter/test-results`; the HTML report is written to `apps/web-starter/playwright-report`.

The latest verification pass ran:

```bash
pnpm backend:test
pnpm backend:typecheck
pnpm backend:build
pnpm web:lint
pnpm web:typecheck
pnpm web:test
pnpm exec next build --webpack
```

The web test suite passed with 32 tests across 12 files after the cleanup pass.

Production browser checks covered:

- `/`
- `/?sort=changePercent24h&dir=asc`
- `/tokens/gradients?range=24h`
- `/tokens/gradients?range=all`
- `/tokens/vanta?range=24h`
- `/tokens/does-not-exist`

I switched ranges in quick succession and confirmed the last selection stayed current. I stopped the backend, confirmed two independent Explore errors, restarted it, and recovered both sections through their Retry buttons.

Across browser verification passes, Token Details also ran at 1920x1080, 1728x1117, and 1280x900. The final cleanup pass repeated Explore at 1728x1117, 1280x900, and 1024x1117, plus Token Details at 1024x1117. Explore loaded all 250 token links at each width and produced no document overflow. Token Details loaded `Gradients` at `24h`, rendered the chart canvases and disabled controls, and produced no application console warnings or errors.

## Tradeoffs and known limits

- API values remain the source of truth, so market totals and sorted token names can differ from placeholder data in the screenshot.
- The default table sort remains market-cap descending even when synthetic filler tokens rank above the ten featured subnet definitions.
- USD and TAO controls, market filters, wallet preview, download control, and swap buttons have visual treatment without product side effects.
- The fixed table viewport keeps the 1728px page and footer aligned with the reference while preserving every token through internal scrolling.
- The repository lacks the exact Haffer font and per-token artwork.
- Token Details uses a high-contrast initial mark in the frame's lime treatment instead of drawing subnet logos from the screenshot.
- The chart sends the normalized `all` series to Lightweight Charts. The supplied 13,141-point response passed the production smoke test, but the app does not record render timing or switch to a 2,000-point extrema-preserving series.
- Transactions, wallet connection, orders, transfers, portfolio data, and chart annotations stay outside scope.

The highest-value follow-up is a visual pass against the three Figma nodes with working editor access, followed by screenshot comparisons on target hardware. Adaptive chart downsampling comes next if profiling shows a long task.

## AI usage

[`AI_USAGE.md`](AI_USAGE.md) records the tools, accepted decisions, rewrites, failures, cleanup audit, and verification used during implementation.
