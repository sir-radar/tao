# AI Usage

## Tools

I used Codex to inspect the repository, plan the work, edit code, run checks, and control the local production app in a browser. I split the implementation into repository setup, Explore, Token Details, resilience, documentation, and cleanup passes. The repository's `AGENTS.md` required a review pause after each milestone.

The Figma design-context workflow attempted to read file `ShGOnid4sBkwGybMICX0qh`, nodes `5:678`, `5:2035`, and `5:4313`. The connected identity lacked editor access, so the workflow stopped after the file-level error. The Stats request returned debug UUID `22c5e20b-1330-46e9-a4d0-2febe270ff71`. I inspected the supplied PNG and CSS exports plus the TAO logo, movement, control, token-link, and trading SVGs instead and recorded the access gap in the README.

The frontend-design and frontend-skill guidance shaped the dense exchange layout, visual hierarchy, responsive composition, and decision to keep the market surface flat. The stop-slop skill guided the documentation edit.

Browser control exercised the running app, route states, keyboard behavior, request failures, document overflow, and console output. I used shadcn's documented Next.js, theming, Table, and Toggle Group patterns. I pinned initialization to `pnpm dlx shadcn@4.16.0`; pnpm resolved the installed package to `shadcn@4.16.2`.

I used Fallow 3.14.0 for a frontend-only static cleanup pass. Its dead-code graph found three unreachable UI files and 19 unused exports. I used its dry-run fixer and trace commands before changing code, then compared mild and semantic duplicate reports before and after cleanup.

I added Playwright 1.57 for production-build end-to-end coverage. Browser-level route interception supplies typed, deterministic API fixtures while preserving the real Next.js routes, React rendering, TanStack Query behavior, URL state, keyboard interaction, and accessibility tree. The initial suite also records screenshots, video, traces, and uncaught browser errors when a test fails.

After a browser extension injected attributes into the root elements, I added React's `suppressHydrationWarning` to `<html>` and `<body>` to prevent extension-only hydration warnings without changing application behavior.

## Workflow

I read the briefs, package manifests, backend token generation, API normalization, current components, tests, workspace configuration, and Git state before editing. Backend response shapes and failure behavior drove the frontend contracts. The visual exports supplied layout evidence after Figma access failed.

For Explore, I mapped the frame to the header, market band, view controls, table, menu, and footer. I corrected the condensed geometry while retaining API resilience, stable sorting, links, and all 250 rows.

For the icon updates, I compared SHA-256 hashes before and after adding the six user-provided market-view SVGs and `Settings2.svg`. The hashes matched, so the repository copies preserve the supplied bytes.

For Token Details, I mapped the 1920x2042 export into the 164px token band, 1322px workspace, 430px rail, chart controls, grouped stats, and disabled trade previews. I kept query caching, stale-request cancellation, partial errors, URL-backed ranges, and backend normalization. The browser exposed a missing keyboard activation path on the range controls, so I added Enter and Space handling plus a component test.

For the cleanup pass, I accepted Fallow's 12-item export preview after its traces showed no external references. I removed the unused component bodies and three unreachable files by hand. I also consolidated duplicate list/history normalization into one keyed-item helper and moved shared history/stats query options into one hook.

For the Playwright pass, I started with the runner and Explore route as one reviewable unit. I generated 250 deterministic token rows, exercised the optimized production server, and used the first failing browser run to refine locators against Chromium's computed accessibility names. I preserved the unrelated generated `next-env.d.ts` change throughout.

Each milestone ended with focused checks, a diff audit, and a commit. I kept the user-owned `.gitignore` edit out of the cleanup commit.

## Accepted decisions

- I kept the suggestion to use shadcn source-owned primitives with custom exchange compositions. Generated primitive behavior stayed intact; semantic variables and application classes replaced the default visual treatment.
- I used TanStack Query range keys, abort signals, retained previous data, scoped retries, and sibling resource boundaries.
- I used Lightweight Charts for the 13,141-point `all` range and retained the full normalized dataset after the smoke test showed no visible interaction failure.
- I kept a semantic table and custom comparator instead of adding TanStack Table. The API returns 250 rows and needs no filtering, pagination, selection, or column configuration.
- I kept the 604px scroll region that shows ten rows at the 1728px reference while preserving all 250 rows.
- I kept URL-backed sorting, accessible row links, a closed-by-default row menu, 100px condensed numeric columns, 122.22px default columns, and the exported Token Details geometry.
- I kept range-specific API data across highlights, financials, subnet data, trading volume, and price history.
- I accepted Fallow's traced removal of unused UI primitives, export markers, and formatting helpers.
- I added shared normalization and range-query helpers for the two meaningful semantic duplicate groups.
- I kept Playwright API mocks at the browser boundary so tests cover the application transport and normalization layers without inheriting the backend's intentional jitter and intermittent history failure.
- I run Playwright against `next build --webpack` and `next start`, matching the documented production path instead of relying on development-server behavior.

## Reworked or rejected suggestions

- I rejected a generic shadcn dashboard card grid. The summary follows the screenshot's compact metric rhythm, while the token table remains the dominant surface.
- I rewrote generated styling around the supplied screenshots: tighter radii, muted purple surfaces, thin borders, tabular numbers, and restrained green and red movement cues.
- I replaced the first 1680px max-width pass with the CSS export's 1728px frame and 64px gutters after browser measurements showed the mismatch.
- I kept backend-driven market values instead of copying placeholder numbers from the screenshot.
- I omitted screenshot trend badges when the API did not supply a matching percentage change.
- I kept market-cap sorting even though synthetic filler tokens can outrank the featured ten. Reordering the result would make the active sort label inaccurate.
- I rejected generated token and subnet artwork plus unprovided brand marks because I could not retrieve those Figma assets. I kept the supplied TAO logo and SVG assets for market controls, token links, and the trading rail.
- I rejected TanStack Table, Zod, a second icon package, animation packages, wallet behavior, and functional trading controls. None reduced P0 risk enough to justify the added surface.
- I replaced the first Token Details layout after browser measurements showed that it was 36px wider than the page. A fieldset's intrinsic width caused the overflow; setting an explicit zero minimum restored the 430px rail.
- I rejected semantic clone suggestions across alert and table primitives because each wrapper preserves different HTML semantics and prop types.
- I kept repeated numeric fields explicit in the API contracts. Type intersections would shorten the file but make each response shape harder to audit against the backend.
- The initial build used Next 16's Turbopack default. It failed because this sandbox denied an internal worker port. I changed the package build script to `next build --webpack` after the same production build passed with Webpack.
- I rewrote the first Playwright sortable-header locators. Exact column-header names did not account for the nested button's accessible label, so the final tests target the public “Sort by …” button name and locate its owning header for `aria-sort` assertions.

## Verification

I reviewed the diff and preserved the user's existing `.gitignore` change. I ran strict type checking, component and data tests, lint and formatting checks, backend checks, and production builds.

Implementation checks:

```bash
pnpm backend:test
pnpm backend:typecheck
pnpm backend:build
pnpm web:lint
pnpm web:typecheck
pnpm web:test
pnpm web:build
pnpm web:e2e
```

The implementation web suite contained 28 tests across 10 files. It checked tolerant decoders, stable sorting, URL range handling, number formatting, chart summaries, API error classification, missing metric behavior, keyboard table scrolling, range selection, and disabled trading semantics.

Production browser checks covered:

- `/`
- `/?sort=changePercent24h&dir=asc`
- `/tokens/gradients?range=24h`
- `/tokens/gradients?range=all`
- `/tokens/vanta?range=24h`
- `/tokens/does-not-exist`

I switched ranges in quick succession and confirmed the last selection stayed current. I stopped the backend, confirmed two independent Explore errors, restarted it, and recovered both sections through their Retry buttons.

Across browser verification passes, Explore ran at 1728x1117, 1024x1117, and 1280x900. Token Details ran at 1920x1080 and the same three desktop widths. The final cleanup pass repeated Explore at those three widths and Token Details at 1024x1117. The checks covered document overflow, frame geometry, stat panel bounds, the disabled rail, range URLs, last-choice behavior, keyboard activation, accessible names, and console output. The icon pass checked each asset source, 16x16 rendered and natural dimensions, load completion, and console output at 1024x1117.

Cleanup checks:

```bash
pnpm web:typecheck
pnpm web:test
pnpm web:lint
pnpm exec next build --webpack
git diff --check
pnpm dlx fallow dead-code --root apps/web-starter
pnpm dlx fallow duplicates --root apps/web-starter --preset mild
pnpm dlx fallow duplicates --root apps/web-starter --preset semantic
```

The cleanup web suite passed with 32 tests across 12 files. The Fallow rerun reported zero dead-code findings and zero mild duplicate groups. Semantic duplication fell from 7.24% to 4.79%; I reviewed the nine remaining groups as typed API field repetition, HTML wrapper structure, or two short endpoint-specific hook calls.

The first Playwright milestone passed 5 Chromium tests against the optimized production build. It covered the six market metrics, all required table columns and all 250 rows, both movement-sort directions with reload persistence, keyboard horizontal scrolling, row menu semantics, token-detail navigation, stable loading geometry, and uncaught browser errors. The sandbox initially denied the local server port and the fresh Playwright install lacked Chromium; I reran the scoped server command with permission and installed only Playwright's pinned Chromium binary before trusting the result.

One verification caveat: `pnpm web:build` now runs `next build --webpack` in `apps/web-starter/package.json`. The direct Turbopack build path failed in this sandbox because it could not create or bind an internal worker port.
