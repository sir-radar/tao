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

The connected Figma identity lacked editor access to file `ShGOnid4sBkwGybMICX0qh`, including the condensed Explore frame at node `5:2035` and the Token Details Stats frame at node `5:4313`. The Stats request returned debug UUID `22c5e20b-1330-46e9-a4d0-2febe270ff71`. I stopped after each failed context call and used the supplied screenshots, CSS exports, and SVG files.

The Explore page uses the frame's measured geometry:

- 72px header and 64px desktop gutters
- 108px market cards inside a 140px summary band
- 78px market-view controls
- 44px table header and ten 56px visible rows
- 84px footer

At 1024px, the layout uses 24px gutters, six 149.33px market cards, the icon-only 36px search control, and the complete Download and wallet controls. Numeric table columns condense from 122.22px to 100px so the initial viewport exposes Price, all three movement periods, 24H Net Volume, and Buy Volume before the sticky action rail.

The header uses the supplied TAO.com logo. Market-summary badges use the supplied 12px up and down arrows, and the market-view tabs render the six supplied 16px SVGs. The filter control uses the supplied `Settings2.svg`. The source material did not include token-logo files, so token rows retain neutral initial avatars instead of fabricated subnet marks. The CSS export names Haffer, but the repository contains no Haffer font file; the font stack uses Haffer when installed and falls back to Inter or the system sans-serif.

Row menus are closed by default and open beneath the active row's ellipsis button. They expose disabled preview actions only. Transaction counts use ungrouped digits to match the supplied table treatment.

Token Details follows the Stats frame's 1920×2042 geometry:

- 72px header and a 164px full-width token context band
- 1322px chart and stats workspace beside a 430px preview rail, with a 40px gap
- 542px chart block and a 1706px content region
- 236px Highlights, 354px Financials, 334px Subnet data, 402px Trading volume, and 196px Price history blocks
- 560px swap preview, 356px position preview, and 228px orders preview

The grouped blocks render every usable value from the stats response. The implementation leaves out screenshot badges that would require made-up percentage changes. The position and orders rail remains disabled preview content.

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

Token Details checks covered 1920×1080, 1728×1117, 1280×900, and 1024×1117 viewports. The 1920px full-page render measured 1920×2042 with no document overflow. The 1728px and 1280px layouts retained the paired stat blocks. The 1024px layout kept the 632px workspace and 320px rail while stacking the stat blocks inside the workspace. A rapid `1H` → `7D` → `30D` sequence finished with the 30D URL, selected control, stats, and 721-point chart. Enter activated the focused 1Y control, and the final check restored 24H. A clean reload produced no console warnings or errors. Explore retained its 1600px and 976px table regions after the route-specific header and footer changes.

## Assumptions and tradeoffs

- API values remain the source of truth, so market totals and sorted token names can differ from placeholder data in the screenshot.
- The default table sort remains market-cap descending even when synthetic filler tokens rank above the ten featured subnet definitions.
- USD and TAO controls, market filters, wallet preview, download control, and swap buttons have visual treatment without product side effects.
- The fixed table viewport keeps the 1728px page and footer aligned with the reference while preserving every token through internal scrolling.
- Token artwork was not supplied. Token Details uses a high-contrast initial mark in the frame's lime treatment instead of drawing the subnet logo from the screenshot.
- Screenshot values for unavailable stat deltas were omitted. The API remains the source for market, range, supply, trading, subnet, and price-history values.

## Known limits

- The repository lacks the exact Haffer font and per-token artwork.
- Transactions, wallet connection, orders, and transfers remain outside the required scope.
- The chart renders the normalized full-history series. The app does not downsample the 13,000-point `all` range.

[`AI_USAGE.md`](AI_USAGE.md) records the AI-assisted workflow and verification for this work.
