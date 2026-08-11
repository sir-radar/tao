# AI Usage

## Tools

I used Codex to inspect the repository, translate the supplied frame evidence into React and Tailwind changes, run local checks, and compare browser measurements against the reference image.

The `frontend-skill` guidance kept the page focused on one dense exchange workspace. The `stop-slop` guidance shaped this write-up. The in-app browser measured element rectangles at the three target widths, exercised sorting and the row menu, and checked console output.

I requested Figma design context for the condensed node `5:2035` in file `ShGOnid4sBkwGybMICX0qh`. The connected identity lacked editor access, so I stopped after that failed call. The supplied screenshot, 20,483-line CSS export, logo, and movement arrows supplied the design evidence for this pass.

## Workflow

I read the briefs, package manifests, backend token generation, API normalization, current components, and tests before editing. I mapped the frame to the header, market band, view controls, table, menu, and footer. I corrected the condensed geometry while retaining API resilience, stable sorting, links, and all 250 rows.

For the market-view icon update, I compared SHA-256 hashes before and after adding the six user-provided SVGs. The hashes matched, so the repository copies preserve the supplied bytes.

The 1024px browser check reported a 976px content region at x=24, six 149.33px market cards, a table at y=290, a 604px table viewport, a 199×112 row menu at x=791.5/y=549.5, and the footer at y=1033. The condensed header placed its search, Download, and wallet controls at x=674, x=726, and x=856, matching the CSS export after accounting for the screenshot's frame outline.

## Accepted and reworked suggestions

I accepted these generated changes after inspection:

- exact SVG assets under `apps/web-starter/public/assets`, including the six market-view glyphs
- a 604px scroll region that keeps all 250 rows while matching ten visible rows
- URL-backed sorting and accessible row links from the existing implementation
- a closed-by-default row menu anchored beneath the active ellipsis button
- 100px condensed numeric columns and 122.22px default columns

I rewrote or rejected these proposals:

- I replaced the first 1680px max-width pass with the CSS export's 1728px frame and 64px gutters after browser measurements showed the mismatch.
- I kept backend-driven market values instead of copying placeholder numbers from the screenshot.
- I kept market-cap sorting even though synthetic filler tokens can outrank the featured ten. Reordering the result would make the active sort label inaccurate.
- I did not draw subnet logos from the screenshot. The supplied assets did not contain those vectors.

## Verification

I reviewed the diff and preserved the user's existing `.gitignore` change. I ran strict type checking, component and data tests, lint and formatting checks, backend checks, and production builds. Browser checks used 1728×1117, 1024×1117, and 1280×900 viewports. They checked document overflow, element geometry, the row-menu state, sort URLs, `aria-sort`, and console warnings. The icon pass checked each asset source, 16×16 rendered and natural dimensions, load completion, and console output at 1024×1117.
