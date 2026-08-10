import { allTokens, findToken, type TokenDefinition } from "./catalog.js";
import { calculateSeriesStats } from "./utils/calculateStats.js";
import {
  createSeededRandom,
  generatePriceSeries,
  roundPrice,
  type GeneratedSeries,
  type HistoryRange
} from "./utils/generatePriceSeries.js";

const GENERATED_AT = "2026-06-05T10:30:00.000Z";

const RANGE_DAYS: Record<HistoryRange, number> = {
  "1h": 1 / 24,
  "24h": 1,
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "1y": 365,
  all: 1095
};

const seriesCache = new Map<string, GeneratedSeries>();

function getSeries(token: TokenDefinition, range: HistoryRange): GeneratedSeries {
  const key = `${token.id}:${range}`;
  let series = seriesCache.get(key);

  if (!series) {
    series = generatePriceSeries(range, {
      symbol: token.symbol,
      basePrice: token.basePrice,
      seed: token.seed,
      generatedAt: GENERATED_AT
    });
    seriesCache.set(key, series);
  }

  return series;
}

const REORDERED_RANGE: HistoryRange = "7d";
const REORDERED_INDICES: Array<[number, number]> = [
  [42, 43],
  [211, 212]
];

function toServedPoints(series: GeneratedSeries): GeneratedSeries {
  if (series.range !== REORDERED_RANGE) return series;

  const points = [...series.points];
  for (const [a, b] of REORDERED_INDICES) {
    if (a < points.length && b < points.length) {
      [points[a], points[b]] = [points[b], points[a]];
    }
  }

  return { ...series, points };
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

type TokenBaseMetrics = {
  marketCap: number;
  buyVolume24h: number;
  sellVolume24h: number;
  netVolume24h: number;
  transactions24h: number;
  traders24h: number;
  emissionsPerDay: number;
};

const baseMetricsCache = new Map<string, TokenBaseMetrics>();

function getBaseMetrics(token: TokenDefinition): TokenBaseMetrics {
  let metrics = baseMetricsCache.get(token.id);
  if (metrics) return metrics;

  const random = createSeededRandom(token.seed + 101);
  const marketCap = Math.round(token.basePrice * token.circulatingSupply);
  const buyVolume24h = round2(marketCap * (0.0004 + random() * 0.0022));
  const sellVolume24h = round2(marketCap * (0.0004 + random() * 0.0022));
  const transactions24h = 300 + Math.floor(random() * 9_000);
  const traders24h = Math.max(12, Math.floor(transactions24h / (2 + random() * 6)));
  const emissionsPerDay = round2(random() * 3);

  metrics = {
    marketCap,
    buyVolume24h,
    sellVolume24h,
    netVolume24h: round2(buyVolume24h - sellVolume24h),
    transactions24h,
    traders24h,
    emissionsPerDay
  };
  baseMetricsCache.set(token.id, metrics);
  return metrics;
}

function changePercent(token: TokenDefinition, range: HistoryRange) {
  return calculateSeriesStats(getSeries(token, range)).changePercent;
}

export function listTokens() {
  return allTokens().map((token) => {
    const metrics = getBaseMetrics(token);

    return {
      id: token.id,
      name: token.name,
      symbol: token.symbol,
      subnet: token.subnet,
      price: roundPrice(token.basePrice),
      marketCap: metrics.marketCap,
      changePercent24h: changePercent(token, "24h"),
      changePercent7d: changePercent(token, "7d"),
      changePercent30d: changePercent(token, "30d"),
      netVolume24h: metrics.netVolume24h,
      buyVolume24h: metrics.buyVolume24h,
      sellVolume24h: metrics.sellVolume24h,
      transactions24h: metrics.transactions24h,
      emissionsPerDay: metrics.emissionsPerDay
    };
  });
}

export function getTokenDetail(id: string) {
  const token = findToken(id);
  if (!token) return null;

  const metrics = getBaseMetrics(token);
  const day = calculateSeriesStats(getSeries(token, "24h"));

  return {
    id: token.id,
    name: token.name,
    symbol: token.symbol,
    subnet: token.subnet,
    currency: "USD" as const,
    price: day.close,
    change24h: day.change,
    changePercent24h: day.changePercent,
    marketCap: metrics.marketCap,
    circulatingSupply: token.circulatingSupply,
    maxSupply: token.maxSupply,
    netVolume24h: metrics.netVolume24h,
    traders24h: metrics.traders24h,
    lastUpdated: GENERATED_AT
  };
}

export function getTokenHistory(id: string, range: HistoryRange) {
  const token = findToken(id);
  if (!token) return null;

  const series = toServedPoints(getSeries(token, range));

  return {
    id: token.id,
    symbol: token.symbol,
    range,
    generatedAt: series.generatedAt,
    points: series.points
  };
}

export function getTokenStats(id: string, range: HistoryRange) {
  const token = findToken(id);
  if (!token) return null;

  const metrics = getBaseMetrics(token);
  const rangeStats = calculateSeriesStats(getSeries(token, range));
  const lifetime = getSeries(token, "all");
  const random = createSeededRandom(token.seed + 977);

  let allTimeHigh = lifetime.points[0];
  let allTimeLow = lifetime.points[0];
  for (const point of lifetime.points) {
    if (point.price > allTimeHigh.price) allTimeHigh = point;
    if (point.price < allTimeLow.price) allTimeLow = point;
  }

  const scale = RANGE_DAYS[range];
  const buyVolume = round2(metrics.buyVolume24h * scale);
  const sellVolume = round2(metrics.sellVolume24h * scale);
  const transactions = Math.round(metrics.transactions24h * scale);
  const traders = Math.round(metrics.traders24h * Math.sqrt(scale));
  const buySplit = 0.4 + random() * 0.2;

  const totalSupply = Math.min(token.maxSupply, Math.round(token.circulatingSupply * (1 + random() * 0.4)));
  const fullyDilutedValue = Math.round(token.basePrice * totalSupply);

  return {
    id: token.id,
    name: token.name,
    symbol: token.symbol,
    subnet: token.subnet,
    range,
    generatedAt: GENERATED_AT,
    price: {
      open: rangeStats.open,
      close: rangeStats.close,
      high: rangeStats.high,
      low: rangeStats.low,
      change: rangeStats.change,
      changePercent: rangeStats.changePercent,
      allTimeHigh,
      allTimeLow
    },
    financials: {
      marketCap: metrics.marketCap,
      fullyDilutedValue,
      mcFdvRatio: round2(metrics.marketCap / fullyDilutedValue),
      circulatingSupply: token.circulatingSupply,
      totalSupply,
      maxSupply: token.maxSupply,
      totalStaked: Math.round(token.circulatingSupply * (0.2 + random() * 0.5)),
      averageStakeApy: round2(4 + random() * 8)
    },
    trading: {
      totalVolume: round2(buyVolume + sellVolume),
      netVolume: round2(buyVolume - sellVolume),
      buyVolume,
      sellVolume,
      transactions,
      traders,
      totalBuys: Math.round(transactions * buySplit),
      totalSells: Math.round(transactions * (1 - buySplit)),
      uniqueBuyers: Math.round(traders * (0.35 + random() * 0.3)),
      uniqueSellers: Math.round(traders * (0.35 + random() * 0.3))
    },
    subnetData: {
      emissionsPerDay: metrics.emissionsPerDay,
      incentiveBurn: round2(random()),
      registrationCost: round2(random() * 2),
      activeValidators: 12 + Math.floor(random() * 52),
      activeMiners: 64 + Math.floor(random() * 192),
      registeredKeys: 128 + Math.floor(random() * 128),
      keyCapacity: 256,
      registeredAt: "2024-08-06T00:00:00.000Z",
      nextHalving: "2028-03-08T00:00:00.000Z"
    }
  };
}

const TRANSACTION_COUNT = 60;

export function getTokenTransactions(id: string) {
  const token = findToken(id);
  if (!token) return null;

  const random = createSeededRandom(token.seed + 5_003);
  const end = new Date(GENERATED_AT).getTime();
  const hexChars = "0123456789abcdef";

  let cursor = end;
  const transactions = Array.from({ length: TRANSACTION_COUNT }, (_, index) => {
    cursor -= Math.round((30 + random() * 840) * 1_000);
    const side = random() > 0.42 ? ("buy" as const) : ("sell" as const);
    const price = roundPrice(token.basePrice * (0.97 + random() * 0.06));
    const tokens = round2(120 + random() * 80_000);
    const coldkey = Array.from({ length: 48 }, () => hexChars[Math.floor(random() * 16)]).join("");

    return {
      id: `${token.id}-tx-${index + 1}`,
      timestamp: new Date(cursor).toISOString(),
      side,
      price,
      tokens,
      valueUsd: round2(price * tokens),
      valueTao: round2((price * tokens) / 412.32),
      coldkey,
      fee: round2(0.02 + random() * 0.18)
    };
  });

  return {
    id: token.id,
    symbol: token.symbol,
    generatedAt: GENERATED_AT,
    transactions
  };
}

export function getMarketSummary() {
  const tokens = allTokens();
  let marketCap = 0;
  let volume24h = 0;
  let dailyTrades = 0;
  let dailyTraders = 0;

  for (const token of tokens) {
    const metrics = getBaseMetrics(token);
    marketCap += metrics.marketCap;
    volume24h += metrics.buyVolume24h + metrics.sellVolume24h;
    dailyTrades += metrics.transactions24h;
    dailyTraders += metrics.traders24h;
  }

  const random = createSeededRandom(731_119);
  const delta = () => round2((random() - 0.45) * 3);

  return {
    generatedAt: GENERATED_AT,
    marketCap: Math.round(marketCap),
    marketCapChangePercent24h: delta(),
    volume24h: round2(volume24h),
    volumeChangePercent24h: delta(),
    volumeToMarketCapPercent: round2((volume24h / marketCap) * 100),
    dailyTrades,
    dailyTradesChangePercent24h: delta(),
    dailyTraders,
    dailyTradersChangePercent24h: delta(),
    activeWallets: 2_100_000,
    activeWalletsChangePercent24h: delta()
  };
}

export function getTokenEvents(id: string) {
  const token = findToken(id);
  if (!token) return null;

  return [
    {
      timestamp: "2026-06-04T14:00:00.000Z",
      title: "Subnet rewards update",
      type: "network"
    },
    {
      timestamp: "2026-06-02T09:30:00.000Z",
      title: "Validator activity spike",
      type: "market"
    },
    {
      timestamp: "2026-05-24T17:00:00.000Z",
      title: "Governance proposal window opens",
      type: "governance"
    }
  ];
}
