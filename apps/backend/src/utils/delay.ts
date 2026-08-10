import type { HistoryRange } from "./generatePriceSeries.js";

const LATENCY_BY_RANGE: Record<HistoryRange, [number, number]> = {
  "1h": [600, 1000],
  "24h": [1200, 1800],
  "7d": [1800, 2600],
  "30d": [2500, 4000],
  "90d": [2800, 4600],
  "1y": [3200, 5200],
  all: [3800, 6500]
};

const TOKENS_LIST_LATENCY: [number, number] = [900, 1600];

function envFlag(name: string, fallback: boolean) {
  const value = process.env[name];
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true";
}

function envNumber(name: string, fallback: number) {
  const parsed = Number(process.env[name]);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function jitteredLatency(range: [number, number], requestKey: string) {
  const [min, max] = range;
  const multiplier = envNumber("HISTORY_LATENCY_MULTIPLIER", 1);
  const hash = [...requestKey].reduce((total, char) => (total * 31 + char.charCodeAt(0)) % 10_000, 7);
  const jitter = hash / 10_000;

  return Math.round((min + (max - min) * jitter) * multiplier);
}

export function historyLatencyMs(range: HistoryRange, requestKey = Date.now().toString()) {
  if (!envFlag("ENABLE_HISTORY_LATENCY", true)) return 0;
  return jitteredLatency(LATENCY_BY_RANGE[range], `${range}:${requestKey}`);
}

export function tokensListLatencyMs(requestKey = Date.now().toString()) {
  if (!envFlag("ENABLE_HISTORY_LATENCY", true)) return 0;
  return jitteredLatency(TOKENS_LIST_LATENCY, `tokens:${requestKey}`);
}

const HISTORY_FAILURE_INTERVAL = 9;
let historyRequestCount = 0;

export function historyRequestShouldFail() {
  if (!envFlag("ENABLE_API_INSTABILITY", true)) return false;

  historyRequestCount += 1;
  return historyRequestCount % HISTORY_FAILURE_INTERVAL === 0;
}

// One token's history always fails, so the chart error state can be reproduced
// on demand instead of only on the request-count cadence above.
export const BROKEN_HISTORY_TOKEN_ID = "vanta";

export function historyTokenAlwaysFails(tokenId: string) {
  if (!envFlag("ENABLE_API_INSTABILITY", true)) return false;
  return tokenId === BROKEN_HISTORY_TOKEN_ID;
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
