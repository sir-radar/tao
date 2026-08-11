# TAO Token Exchange

This repository contains a desktop exchange interface for TAO subnet markets. The web app implements two routes:

| Route         | Purpose                                                               |
| ------------- | --------------------------------------------------------------------- |
| `/`           | Market summary and a sortable table with all 250 tokens               |
| `/tokens/:id` | Token history, range-based stats, and a disabled trading preview rail |

Explore stores sorting in the `sort` and `dir` URL parameters. Token Details stores its selected history range in `range` and defaults to `24h`.

## Run locally

Requirements: Node.js 20 or newer and pnpm 9.

```bash
pnpm install
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

`API_BASE_URL` controls the Next.js rewrite target and defaults to `http://127.0.0.1:4000`. `NEXT_PUBLIC_API_BASE_URL` sends browser requests to a supplied origin instead.

## Architecture

- Next.js 16 App Router, React 19, strict TypeScript, and Tailwind CSS v4
- TanStack Query for caching, cancellation, retained range data, and scoped retries
- Lightweight Charts for price history, crosshair behavior, UTC axes, and tooltips
- Boundary normalization under `apps/web-starter/src/lib/api`
- Memoized stable sorting with token ID tie-breakers

The Explore page fetches its summary and token list as separate resources. Each section can fail and retry without hiding usable data from the other request. The 604px token-table viewport shows ten rows at the 1728px reference size and scrolls through all 250 API rows. Sort headers use real buttons and `aria-sort`; token names use links.

Token Details keys detail, history, and stats queries by token and range. Range changes retain valid content while the next request resolves. The trading rail sits inside a disabled fieldset and has no wallet, swap, or order mutation.

## Design evidence

The connected Figma identity lacked editor access to file `ShGOnid4sBkwGybMICX0qh`. I used the supplied 1728px screenshot, the pasted Figma CSS export, and the supplied SVG files instead.

The Explore page uses the frame's measured geometry:

- 72px header and 64px desktop gutters
- 108px market cards inside a 140px summary band
- 78px market-view controls
- 44px table header and ten 56px visible rows
- 84px footer

The header uses the supplied TAO.com logo. Market-summary badges use the supplied 12px up and down arrows. The source material did not include token-logo files, so token rows retain neutral initial avatars instead of fabricated subnet marks. The CSS export names Haffer, but the repository contains no Haffer font file; the font stack uses Haffer when installed and falls back to Inter or the system sans-serif.

The default row menu opens on the fourth sorted row to reproduce the attached reference state. It only exposes disabled preview actions. Users can close and reopen it with the row's ellipsis button.

## Verification

Run the checks from the repository root:

```bash
pnpm backend:test
pnpm backend:typecheck
pnpm backend:build

pnpm web:lint
pnpm web:typecheck
pnpm web:test
pnpm web:build
```

Browser checks covered Explore at 1728×1117, 1024×1117, and 1280×900. The 1728px measurement matched the supplied frame geometry, the 1024px table scrolled inside its labelled region, and none of the three widths produced horizontal document overflow. The checks also covered menu toggle behavior, ascending and descending market-cap URL state, `aria-sort`, and browser console warnings.

## Assumptions and tradeoffs

- API values remain the source of truth, so market totals and sorted token names can differ from placeholder data in the screenshot.
- The default table sort remains market-cap descending even when synthetic filler tokens rank above the ten featured subnet definitions.
- USD and TAO controls, market filters, wallet preview, download control, and swap buttons have visual treatment without product side effects.
- The fixed table viewport keeps the 1728px page and footer aligned with the reference while preserving every token through internal scrolling.

## Known limits

- The repository lacks the exact Haffer font and per-token artwork.
- Transactions, wallet connection, orders, and transfers remain outside the required scope.
- The chart renders the normalized full-history series. The app does not downsample the 13,000-point `all` range.

[`AI_USAGE.md`](AI_USAGE.md) records the AI-assisted workflow and verification for this work.
