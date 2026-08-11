# AI Usage

## Tools

I used Codex to inspect the repository, translate the supplied frame evidence into React and Tailwind changes, run local checks, and compare browser measurements against the reference image.

The `frontend-skill` guidance set the visual thesis and kept the page focused on one dense exchange workspace. The `stop-slop` guidance shaped this write-up. The in-app browser measured element rectangles, captured the three target widths, exercised sorting and the row menu, and checked console output.

I requested Figma design context for node `5:678` in file `ShGOnid4sBkwGybMICX0qh`. The connected identity lacked editor access, so I stopped after the first failed call. The supplied screenshot, 20,575-line CSS export, logo, and movement arrows supplied the design evidence for the implementation.

## Workflow

I read the briefs, package manifests, backend token generation, API normalization, current components, and tests before editing. I mapped the frame to measured regions: header, market band, view controls, table, menu, and footer. I then replaced the mismatched geometry and assets while retaining API resilience, stable sorting, links, and all 250 rows.

The first browser check exposed a stale server process that still served the pre-change build. I stopped that process, restarted the web app on port 3000, and repeated the capture. Browser evaluation then reported the expected 1728px measurements: 72px header, 1600px content at x=64, table at y=290 with a 604px height, menu at x=1455/y=549 sized 199×112, and footer at y=1033.

## Accepted and reworked suggestions

I accepted these generated changes after inspection:

- exact SVG assets under `apps/web-starter/public/assets`
- a 604px scroll region that keeps all 250 rows while matching ten visible rows
- URL-backed sorting and accessible row links from the existing implementation
- a fourth-row preview menu that matches the supplied reference state

I rewrote or rejected these proposals:

- I replaced the first 1680px max-width pass with the CSS export's 1728px frame and 64px gutters after browser measurements showed the mismatch.
- I kept backend-driven market values instead of copying placeholder numbers from the screenshot.
- I kept market-cap sorting even though synthetic filler tokens can outrank the featured ten. Reordering the result would make the active sort label inaccurate.
- I did not draw subnet logos from the screenshot. The supplied assets did not contain those vectors.

## Verification

I reviewed the diff and preserved the user's existing `.gitignore` change. I ran strict type checking, component and data tests, lint and formatting checks, backend checks, and production builds. Browser checks used 1728×1117, 1024×1117, and 1280×900 viewports. They checked document overflow, element geometry, table scrolling, row-menu state, sort URLs, `aria-sort`, and console warnings.
