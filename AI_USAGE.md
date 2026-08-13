# AI Usage

## Tools

I used Codex to inspect the repository, plan the work, edit code, run checks, and control the local production app in a browser. I split the implementation into repository setup, Explore, Token Details, resilience, documentation, and cleanup passes. The repository's `AGENTS.md` required a review pause after each milestone.

The Figma design-context workflow attempted to read file `ShGOnid4sBkwGybMICX0qh`, nodes `5:678`, `5:2035`, and `5:4313`. The connected identity lacked editor access, so the workflow stopped after the file-level error. The initial Stats request returned debug UUID `22c5e20b-1330-46e9-a4d0-2febe270ff71`; the later Stats precision pass received the same blocker with debug UUID `1955aedc-f335-426b-9678-9198b639dcb9`. A later Explore-only precision pass retried `5:678` after authentication and received debug UUID `62cdafe7-98bc-4e6c-b457-570b0d2c83aa`. The condensed follow-up retried `5:2035` and received debug UUID `43c46d71-3852-46b5-a315-826bb8268163`. I inspected the supplied PNG and CSS exports plus the TAO logo, movement, control, token-link, and trading SVGs instead and recorded the access gap in the README.

The frontend-design and frontend-skill guidance shaped the dense exchange layout, visual hierarchy, responsive composition, and decision to keep the market surface flat. The stop-slop skill guided the documentation edit.

Browser control exercised the running app, route states, keyboard behavior, request failures, document overflow, and console output. I used shadcn's documented Next.js, theming, Table, and Toggle Group patterns. I pinned initialization to `pnpm dlx shadcn@4.16.0`; pnpm resolved the installed package to `shadcn@4.16.2`.

I used Fallow 3.14.0 for a frontend-only static cleanup pass. Its dead-code graph found three unreachable UI files and 19 unused exports. I used its dry-run fixer and trace commands before changing code, then compared mild and semantic duplicate reports before and after cleanup.

I added Playwright 1.57 for production-build end-to-end coverage. Browser-level route interception supplies typed, deterministic API fixtures while preserving the real Next.js routes, React rendering, TanStack Query behavior, URL state, keyboard interaction, and accessibility tree. The suite records screenshots, video, traces, and uncaught browser errors when a test fails. I added `@axe-core/playwright` 4.11.0 to scan representative success and error states against WCAG 2.0/2.1 A and AA rules.

After a browser extension injected attributes into the root elements, I added React's `suppressHydrationWarning` to `<html>` and `<body>` to prevent extension-only hydration warnings without changing application behavior.

## Workflow

I read the briefs, package manifests, backend token generation, API normalization, current components, tests, workspace configuration, and Git state before editing. Backend response shapes and failure behavior drove the frontend contracts. The visual exports supplied layout evidence after Figma access failed.

For Explore, I mapped the frame to the header, market band, view controls, table, menu, and footer. I corrected the condensed geometry while retaining API resilience, stable sorting, links, and all 250 rows.

For the later Explore precision pass, I compared the running 1728x1117 page with the newly supplied screenshot and its 20,575-line CSS export. Browser measurements found that the shared Token Details header had widened Explore's Download button from 122px to 133px, shifting the complete search/action cluster 11px left. I restored route-specific button geometry, fixed the six market-tab widths and footer groups to the export, mapped the supplied 430/570 text weights to the Explore components, and prevented the long condensed market-ratio label from wrapping into its value. I kept the action menu closed by default and validated the screenshot's open-menu state after activating the fourth-row control instead of making an obstructive interaction state the page default.

Review feedback then identified that the table-to-footer gap only existed when the viewport supplied spare height. At 1280x900 the footer touched the table even though the exported content frame is 961px tall. I made that minimum explicit on Explore and added a browser assertion that preserves at least the reference's 139px gap at every required desktop viewport.

The condensed follow-up compared the running page with the supplied 697x670 screenshot and its 20,483-line CSS export. The image maps to the 1024px frame at the browser viewport ratio. The existing layout matched the exported header, gutters, summary, controls, table, and footer geometry. I kept those dimensions and replaced the decorative header search container with a search input at full desktop widths and an icon button at condensed widths. I replaced the currency spans with a disabled radio fieldset. A new Playwright check fixes the 1024x1117 landmarks to their exported boxes and checks the native control semantics.

For the icon updates, I compared SHA-256 hashes before and after adding the six user-provided market-view SVGs and `Settings2.svg`. The hashes matched, so the repository copies preserve the supplied bytes.

For Token Details, I mapped the 1920x2042 export into the 164px token band, 1322px workspace, 430px rail, chart controls, grouped stats, and disabled trade previews. I kept query caching, stale-request cancellation, partial errors, URL-backed ranges, and backend normalization. The browser exposed a missing keyboard activation path on the range controls, so I added Enter and Space handling plus a component test.

The later Stats precision pass reconciled the 18,690-line CSS export with the new screenshot and the running page. It moved the divider to the bottom of the exported 164px token band, restored the Highlights row gap, split Financials into the Figma's 92px and 166px groups, filled the five-row Subnet grid, rebuilt Trading volume around the exported divider and 54px comparison rows, and inserted the missing rail divider. The user clarified that API-supported leaves should remain live while design-only leaves may use static Figma values. I applied that boundary explicitly and marked each static leaf in the DOM rather than converting the whole page into screenshot data.

For the cleanup pass, I accepted Fallow's 12-item export preview after its traces showed no external references. I removed the unused component bodies and three unreachable files by hand. I also consolidated duplicate list/history normalization into one keyed-item helper and moved shared history/stats query options into one hook.

For the Playwright pass, I started with the runner and Explore route as one reviewable unit. I generated 250 deterministic token rows, exercised the optimized production server, and used the first failing browser run to refine locators against Chromium's computed accessibility names. I preserved the unrelated generated `next-env.d.ts` change throughout.

The next Playwright milestone extended the same typed boundary fixtures with range-specific delays and request observation. I used those controls to prove that a slower abandoned range cannot replace the final selection and that revisiting a fresh range reuses both cached history and cached stats. Browser failures also corrected two test-only assumptions: Lightweight Charts uses multiple canvas layers, and the visible Stats heading shares its name with the chart's screen-reader heading.

The final Playwright milestone added per-resource failure counts, malformed and empty payloads, unknown-token responses, and scoped retries. I checked both routes at three desktop widths, keyboard focus and activation, reduced motion, and Axe results. During the first focused run, I separated expected HTTP console noise from unexpected runtime errors and observed that Radix arrow keys move radio focus without activating the selection. I also found two Token Details accessibility defects. I made the chart library's decorative subtree inert, replaced prohibited labels on plain elements with semantic screen-reader text or image roles, and reran the complete suite.

A final traceability audit found that the design brief's two Token Details loading states lacked direct browser assertions. I added semantic busy regions to the initial skeleton and two tests: one measures the chart/stats and trading-rail skeleton geometry, and one verifies that a range refetch retains the prior chart and stats while live text announces the pending range.

Each milestone ended with focused checks, a diff audit, and a commit. I kept the user-owned `.gitignore` edit out of the cleanup commit.

## Accepted decisions

- I kept the suggestion to use shadcn source-owned primitives with custom exchange compositions. Generated primitive behavior stayed intact; semantic variables and application classes replaced the default visual treatment.
- I used TanStack Query range keys, abort signals, retained previous data, scoped retries, and sibling resource boundaries.
- I used Lightweight Charts for the 13,141-point `all` range and retained the full normalized dataset after the smoke test showed no visible interaction failure.
- I kept a semantic table and custom comparator instead of adding TanStack Table. The API returns 250 rows and needs no filtering, pagination, selection, or column configuration.
- I kept the 604px scroll region that shows ten rows at the 1728px reference while preserving all 250 rows.
- I kept URL-backed sorting, accessible row links, a closed-by-default row menu, 100px condensed numeric columns, 122.22px default columns, and the exported Token Details geometry.
- I kept the Explore and Token Details header actions route-aware: Explore uses the exported 122px Download control while Token Details retains its 133px “Get the app” control.
- I kept range-specific API data across highlights, financials, subnet data, trading volume, and price history.
- I kept API values for every Stats field the backend exposes and used static Figma values only for unsupported design fields and trend deltas. This restored the complete frame without replacing real market data.
- I accepted Fallow's traced removal of unused UI primitives, export markers, and formatting helpers.
- I added shared normalization and range-query helpers for the two meaningful semantic duplicate groups.
- I kept Playwright API mocks at the browser boundary so tests cover the application transport and normalization layers without inheriting the backend's intentional jitter and intermittent history failure.
- I run Playwright against `next build --webpack` and `next start`, matching the documented production path instead of relying on development-server behavior.
- I scope the runtime-error fixture's HTTP failure allowance to resilience tests that return 404 or 503 responses; happy-path tests still fail on every console error.
- I kept automated accessibility checks focused on representative pages and paired them with explicit keyboard, focus, reduced-motion, overflow, and landmark assertions.
- I used native search and radio controls for the header and currency preview while preserving their measured condensed dimensions.

## Reworked or rejected suggestions

- I rejected a generic shadcn dashboard card grid. The summary follows the screenshot's compact metric rhythm, while the token table remains the dominant surface.
- I rewrote generated styling around the supplied screenshots: tighter radii, muted purple surfaces, thin borders, tabular numbers, and restrained green and red movement cues.
- I replaced the first 1680px max-width pass with the CSS export's 1728px frame and 64px gutters after browser measurements showed the mismatch.
- I kept backend-driven market values instead of copying placeholder numbers from the screenshot.
- I initially omitted screenshot trend badges when the API did not supply a matching percentage change. After the user clarified the desired source boundary, I restored all seven shown badges with static Figma deltas where no API delta exists while keeping the supported market-cap change live.
- I kept market-cap sorting even though synthetic filler tokens can outrank the featured ten. Reordering the result would make the active sort label inaccurate.
- I rejected generated token and subnet artwork plus unprovided brand marks because I could not retrieve those Figma assets. I kept the supplied TAO logo and SVG assets for market controls, token links, and the trading rail.
- I rejected TanStack Table, Zod, a second icon package, animation packages, wallet behavior, and functional trading controls. None reduced P0 risk enough to justify the added surface.
- I replaced the first Token Details layout after browser measurements showed that it was 36px wider than the page. A fieldset's intrinsic width caused the overflow; setting an explicit zero minimum restored the 430px rail.
- I rejected semantic clone suggestions across alert and table primitives because each wrapper preserves different HTML semantics and prop types.
- I kept repeated numeric fields explicit in the API contracts. Type intersections would shorten the file but make each response shape harder to audit against the backend.
- The initial build used Next 16's Turbopack default. It failed because this sandbox denied an internal worker port. I changed the package build script to `next build --webpack` after the same production build passed with Webpack.
- I rewrote the first Playwright sortable-header locators. Exact column-header names did not account for the nested button's accessible label, so the final tests target the public “Sort by …” button name and locate its owning header for `aria-sort` assertions.
- I rewrote the first range keyboard assertion after the browser showed the component's deliberate interaction model: arrow keys move focus and Enter or Space commits the URL-backed range.
- I did not suppress Axe's Token Details findings. I fixed the hidden chart subtree and the four prohibited ARIA labels in production markup, then updated tests to assert the same accessible price text without depending on invalid semantics.
- I did not crop the small token marks from the screenshot or draw replacements. The missing Haffer files and per-token assets require a shared Figma file or supplied source files.

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

The implementation web suite contained 32 tests across 12 files. It checked tolerant decoders, stable sorting, URL range handling, number formatting, chart summaries, API error classification, missing metric behavior, keyboard table scrolling, range selection, and disabled trading semantics.

The Stats precision pass reran backend tests, typecheck, and build; web lint, typecheck, all 32 Vitest tests, the production Webpack build, and all 29 Playwright tests. Browser measurements at 1920px matched the exported 164px token band, 1322px workspace, 430px rail, and 236/354/334/402/196px Stats panels. Additional checks at 1728x1117, 1280x900, and 1024x1117 reported no document overflow or chart/rail overlap. The first full Playwright run caught that naming each Stats card as a region made the chart's “Price history” landmark ambiguous; I kept semantic `<section>` elements but removed the redundant region names, then passed the focused regression and complete suite.

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

The Token Details milestone added 5 Chromium tests. It covered headline identity and pricing, the accessible chart summary and rendered canvas, all grouped Stats sections, disabled swap/position/order controls, all seven range URLs, invalid-range correction while preserving sibling query state, last-choice-wins behavior under out-of-order responses, and one-request cache reuse when returning to a fresh range.

The final Playwright milestone added 16 Chromium tests. Eight cover independent resource failures, retry recovery, empty and malformed responses, and unknown-token handling. Three run both routes at 1728x1117, 1280x900, and 1024x1117 and assert containment. The remaining tests cover keyboard focus and activation, reduced motion, and zero Axe violations on Explore, Token Details, and the unknown-token state. The focused milestone passed 16/16, and the complete production-browser suite passed 26/26.

The loading-state audit added two Token Details tests. The focused Token Details file passed 7/7 tests. The final production-browser suite passed 28/28.

The later Explore precision pass reran backend tests, typecheck, and build; web lint, typecheck, all 32 Vitest tests, the production build, and the complete 28-test Playwright suite. Direct browser measurements at 1728x1117 confirmed the exported 270px search field, 122px Download control, 144px wallet control, 699px market-view rail, 1600x140 summary band, 1600x604 table, and 199x112 activated row menu. Additional 1280x900 and 1024x1117 passes reported zero horizontal document overflow, console errors, page errors, or failed API responses.

The condensed follow-up passed 32 backend tests, backend typecheck and build, web lint, web typecheck, all 32 Vitest tests, the Webpack production build, and all 29 Playwright tests. The first full-suite command passed an extra `--` through pnpm, so Playwright treated it as a file pattern and ran no tests. I reran the suite through the workspace Playwright binary and recorded the 29/29 result. The new 1024x1117 check confirmed a 72px header, a 976x140 summary at x24/y72, a 976x604 table at x24/y290, and an 84px footer at y1033.

One verification caveat: `pnpm web:build` now runs `next build --webpack` in `apps/web-starter/package.json`. The direct Turbopack build path failed in this sandbox because it could not create or bind an internal worker port.
