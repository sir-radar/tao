# Design Brief

## Figma

Link: [Desktop – Design sample for interview task](https://www.figma.com/design/ShGOnid4sBkwGybMICX0qh/Desktop-%E2%80%93-Design-sample-for-interview-task?node-id=0-1)

The file contains more product surface than the exercise requires. The tables below spell out exactly what is in scope.

## Screens In Scope

| Screen | Figma frame | Node | Notes |
| --- | --- | --- | --- |
| Explore Tokens (default) | `Explore Tokens > Desktop – Default` | [`5-678`](https://www.figma.com/design/ShGOnid4sBkwGybMICX0qh/Desktop-%E2%80%93-Design-sample-for-interview-task?node-id=5-678) | 1728px layout: stats bar, tabs, token table |
| Explore Tokens (condensed) | `Explore Tokens > Desktop – Condensed` | [`5-2035`](https://www.figma.com/design/ShGOnid4sBkwGybMICX0qh/Desktop-%E2%80%93-Design-sample-for-interview-task?node-id=5-2035) | 1024px layout of the same page |
| Token Details (Stats tab) | `Token Details > Stats` | [`5-4313`](https://www.figma.com/design/ShGOnid4sBkwGybMICX0qh/Desktop-%E2%80%93-Design-sample-for-interview-task?node-id=5-4313) | Price header, chart, timeframes, stats blocks |

## In-Scope Details

- The Token Details right-hand column (swap panel, position card, orders card) should be built as **static, non-functional UI**. Match the layout and visual treatment; do not implement swap behavior.
- The chart timeframe switcher covers `1H`, `24H`, `7D`, `30D`, `90D`, `1Y`, `All`. The line/candlestick display toggles may be treated as static unless you take on chart-type switching yourself.
- The USD/TAO currency toggles may be treated as static.

## Stretch (Optional)

| Screen | Figma frame | Node |
| --- | --- | --- |
| Token Details (Transactions tab) | `Token Details > Transactions` | [`5-7400`](https://www.figma.com/design/ShGOnid4sBkwGybMICX0qh/Desktop-%E2%80%93-Design-sample-for-interview-task?node-id=5-7400) |

The "Connect wallet" button in the header is a stretch goal as UI only — no wallet or browser-extension integration is expected.

## Out of Scope

- `Token Details > Mobile` — this exercise targets desktop web.
- `Portfolio` — all frames.
- `Send Asset` — all frames, dialogs, and toasts.
- Any functional swap, order, or transfer behavior anywhere in the app.

## States To Cover

The design file shows the happy path. You are expected to design sensible treatments for:

- Initial page loading
- Chart loading after a timeframe change
- API errors (both full-page and partial)
- Empty or unusable data
- Positive and negative price movement
