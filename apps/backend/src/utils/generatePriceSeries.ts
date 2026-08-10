export type HistoryRange = "1h" | "24h" | "7d" | "30d" | "90d" | "1y" | "all";

export type PricePoint = {
  timestamp: string;
  price: number;
};

export type GeneratedSeries = {
  symbol: string;
  range: HistoryRange;
  generatedAt: string;
  points: PricePoint[];
};

export type SeriesOptions = {
  symbol?: string;
  basePrice?: number;
  seed?: number;
  generatedAt?: string;
};

type RangeConfig = {
  durationMinutes: number;
  intervalMinutes: number;
  /** Standard deviation of the total log price change across the range. */
  rangeVolatility: number;
  /** Largest absolute log trend applied across the range, in either direction. */
  maxRangeDrift: number;
};

// Intervals are chosen so that every longer range returns strictly more points
// than every shorter one.
const RANGE_CONFIG: Record<HistoryRange, RangeConfig> = {
  "1h": { durationMinutes: 60, intervalMinutes: 1, rangeVolatility: 0.012, maxRangeDrift: 0.01 },
  "24h": { durationMinutes: 24 * 60, intervalMinutes: 5, rangeVolatility: 0.04, maxRangeDrift: 0.035 },
  "7d": { durationMinutes: 7 * 24 * 60, intervalMinutes: 30, rangeVolatility: 0.09, maxRangeDrift: 0.08 },
  "30d": { durationMinutes: 30 * 24 * 60, intervalMinutes: 60, rangeVolatility: 0.17, maxRangeDrift: 0.16 },
  "90d": { durationMinutes: 90 * 24 * 60, intervalMinutes: 60, rangeVolatility: 0.28, maxRangeDrift: 0.3 },
  "1y": { durationMinutes: 365 * 24 * 60, intervalMinutes: 120, rangeVolatility: 0.45, maxRangeDrift: 0.5 },
  all: { durationMinutes: 3 * 365 * 24 * 60, intervalMinutes: 120, rangeVolatility: 0.7, maxRangeDrift: 0.8 }
};

const BASE_GENERATED_AT = "2026-06-05T10:30:00.000Z";
const DEFAULT_BASE_PRICE = 412.32;
const DEFAULT_SYMBOL = "TAO";

const LEHMER_MODULUS = 2_147_483_647;
const LEHMER_MULTIPLIER = 16_807;
// Lehmer generators seeded with nearby values emit nearly identical first
// draws, which would make a token's ranges look like copies of each other.
const WARMUP_DRAWS = 8;
// A uniform draw on (-1, 1) has a standard deviation of 1 / sqrt(3).
const UNIFORM_STD_SCALE = Math.sqrt(3);
// Ceiling on how far a walk may stray from its trend line, in standard
// deviations, so no token produces an unreadable chart.
const DRIFT_CLAMP_SIGMAS = 3.5;

export function createSeededRandom(seed: number) {
  let value = Math.abs(Math.trunc(seed)) % LEHMER_MODULUS;
  if (value <= 0) value += LEHMER_MODULUS - 1;

  const next = () => {
    value = (value * LEHMER_MULTIPLIER) % LEHMER_MODULUS;
    return (value - 1) / (LEHMER_MODULUS - 1);
  };

  for (let index = 0; index < WARMUP_DRAWS; index += 1) next();

  return next;
}

function seedForRange(range: HistoryRange, tokenSeed: number) {
  return [...range].reduce((total, char) => total + char.charCodeAt(0), tokenSeed);
}

/** Decimal places worth keeping for a token trading around `price`. */
export function priceDecimals(price: number) {
  const magnitude = Math.abs(price);
  if (magnitude >= 100) return 2;
  if (magnitude >= 1) return 4;
  if (magnitude >= 0.1) return 5;
  if (magnitude >= 0.01) return 6;
  return 8;
}

export function roundTo(value: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function roundPrice(price: number) {
  return roundTo(price, priceDecimals(price));
}

export function isHistoryRange(value: unknown): value is HistoryRange {
  return typeof value === "string" && Object.hasOwn(RANGE_CONFIG, value);
}

export function generatePriceSeries(range: HistoryRange, options: SeriesOptions = {}): GeneratedSeries {
  const {
    symbol = DEFAULT_SYMBOL,
    basePrice = DEFAULT_BASE_PRICE,
    seed = 17_311,
    generatedAt = BASE_GENERATED_AT
  } = options;

  const config = RANGE_CONFIG[range];
  const end = new Date(generatedAt).getTime();
  const steps = Math.floor(config.durationMinutes / config.intervalMinutes);
  const random = createSeededRandom(seedForRange(range, seed));

  // Sampled symmetrically so roughly half of the catalog trends down over any
  // given range.
  const driftPerStep = ((random() * 2 - 1) * config.maxRangeDrift) / steps;
  // Shocks are symmetric too, which is what puts red candles between the green
  // ones. Scaling by 1 / sqrt(steps) keeps total movement comparable across
  // ranges no matter how many points they contain.
  const shockScale = (config.rangeVolatility / Math.sqrt(steps)) * UNIFORM_STD_SCALE;
  const clampAmplitude = config.rangeVolatility * DRIFT_CLAMP_SIGMAS;

  const logOffsets = new Array<number>(steps + 1);
  logOffsets[0] = 0;
  let walk = 0;

  for (let index = 1; index <= steps; index += 1) {
    walk += driftPerStep + (random() * 2 - 1) * shockScale;
    const trend = driftPerStep * index;
    walk = Math.min(Math.max(walk, trend - clampAmplitude), trend + clampAmplitude);
    logOffsets[index] = walk;
  }

  // Anchoring in log space lands the most recent point on the token's base
  // price without flattening any of the movement before it.
  const anchor = Math.log(basePrice) - logOffsets[steps];

  const points: PricePoint[] = logOffsets.map((offset, index) => ({
    timestamp: new Date(end - (steps - index) * config.intervalMinutes * 60_000).toISOString(),
    price: roundPrice(Math.exp(anchor + offset))
  }));

  points[points.length - 1] = {
    timestamp: new Date(end).toISOString(),
    price: roundPrice(basePrice)
  };

  return {
    symbol,
    range,
    generatedAt: new Date(generatedAt).toISOString(),
    points
  };
}

export function supportedRanges() {
  return Object.keys(RANGE_CONFIG) as HistoryRange[];
}
