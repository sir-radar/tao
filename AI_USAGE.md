# AI Usage

## Tools

I used Codex to inspect the repository, translate the supplied frame evidence into React and Tailwind changes, run local checks, and compare browser measurements against the reference image.

The `frontend-skill` guidance kept each page focused on one dense exchange workspace. The `stop-slop` guidance shaped this write-up. The in-app browser measured element rectangles across both routes, exercised sorting, range selection, and keyboard activation, and checked console output.

I used Fallow 3.14.0 for a frontend-only static cleanup pass. Its dead-code graph found three unreachable UI files and 19 unused exports. I used its dry-run fixer and trace commands before changing code, then compared mild and semantic duplicate reports.

I requested Figma design context for nodes `5:2035` and `5:4313` in file `ShGOnid4sBkwGybMICX0qh`. The connected identity lacked editor access, so I stopped after each failed call. The Stats call returned debug UUID `22c5e20b-1330-46e9-a4d0-2febe270ff71`. The supplied screenshots, CSS exports, logo, and movement arrows supplied the design evidence for the implementation.

## Workflow

I read the briefs, package manifests, backend token generation, API normalization, current components, and tests before editing. I mapped the frame to the header, market band, view controls, table, menu, and footer. I corrected the condensed geometry while retaining API resilience, stable sorting, links, and all 250 rows.

For the icon updates, I compared SHA-256 hashes before and after adding the six user-provided market-view SVGs and `Settings2.svg`. The hashes matched, so the repository copies preserve the supplied bytes.

The 1024px browser check reported a 976px content region at x=24, six 149.33px market cards, a table at y=290, a 604px table viewport, a 199×112 row menu at x=791.5/y=549.5, and the footer at y=1033. The condensed header placed its search, Download, and wallet controls at x=674, x=726, and x=856, matching the CSS export after accounting for the screenshot's frame outline.

For Token Details, I mapped the 1920×2042 export into the 164px token band, 1322px workspace, 430px rail, chart controls, grouped stats, and disabled trade previews. I kept query caching, stale-request cancellation, partial errors, URL-backed ranges, and backend normalization. The browser exposed a missing keyboard activation path on the range controls, so I added Enter and Space handling plus a component test.

For the cleanup pass, I accepted Fallow's 12-item export preview after its traces showed no external references. I removed the unused component bodies and three unreachable files by hand. I also consolidated duplicate list/history normalization into one keyed-item helper and moved shared history/stats query options into one hook.

## Accepted and reworked suggestions

I accepted these generated changes after inspection:

- exact SVG assets under `apps/web-starter/public/assets`, including the market-view and filter glyphs
- a 604px scroll region that keeps all 250 rows while matching ten visible rows
- URL-backed sorting and accessible row links from the existing implementation
- a closed-by-default row menu anchored beneath the active ellipsis button
- 100px condensed numeric columns and 122.22px default columns
- the exported 1920px Token Details geometry and the five measured stats block heights
- range-specific API data across highlights, financials, subnet data, trading volume, and price history
- a dotted baseline chart with cached range switching and an accessible range summary
- Fallow's traced removal of unused UI primitives, export markers, and formatting helpers
- shared normalization and range-query helpers for the two meaningful semantic clone groups

I rewrote or rejected these proposals:

- I replaced the first 1680px max-width pass with the CSS export's 1728px frame and 64px gutters after browser measurements showed the mismatch.
- I kept backend-driven market values instead of copying placeholder numbers from the screenshot.
- I omitted screenshot trend badges when the API did not supply a matching percentage change.
- I kept market-cap sorting even though synthetic filler tokens can outrank the featured ten. Reordering the result would make the active sort label inaccurate.
- I did not draw subnet logos or social brand marks from the screenshot. The supplied assets did not contain those vectors.
- I replaced the first Token Details layout after browser measurements showed that it was 36px wider than the page. A fieldset's intrinsic width caused the overflow; setting an explicit zero minimum restored the 430px rail.
- I rejected semantic clone suggestions across alert and table primitives because each wrapper preserves different HTML semantics and prop types.
- I kept repeated numeric fields explicit in the API contracts. Type intersections would shorten the file but make each response shape harder to audit against the backend.

## Verification

I reviewed the diff and preserved the user's existing `.gitignore` change. I ran strict type checking, component and data tests, lint and formatting checks, backend checks, and production builds. Explore browser checks used 1728×1117, 1024×1117, and 1280×900 viewports. Token Details checks added 1920×1080 and reused the three desktop widths. They checked document overflow, frame geometry, all stat panel bounds, the disabled rail, range URLs, last-choice behavior, keyboard activation, accessible names, and console output. The icon pass checked each asset source, 16×16 rendered and natural dimensions, load completion, and console output at 1024×1117.

The cleanup rerun reported zero dead-code findings and zero mild duplicate groups. Semantic duplication fell from 7.24% to 4.79%; I reviewed the nine remaining groups as typed API field repetition, HTML wrapper structure, or two short endpoint-specific hook calls.
