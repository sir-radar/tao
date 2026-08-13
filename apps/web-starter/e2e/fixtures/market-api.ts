import type { Page, Route } from '@playwright/test';
import type {
  HistoryRange,
  MarketSummary,
  TokenDetail,
  TokenListItem,
  TokenStats,
} from '../../src/lib/api/contracts';

export const marketSummaryFixture: MarketSummary = {
  generatedAt: '2026-06-05T10:30:00.000Z',
  marketCap: 29_233_701_123,
  marketCapChangePercent24h: 0.82,
  volume24h: 82_265_372.03,
  volumeChangePercent24h: 0.98,
  volumeToMarketCapPercent: 0.28,
  dailyTrades: 1_246_618,
  dailyTradesChangePercent24h: -0.13,
  dailyTraders: 285_971,
  dailyTradersChangePercent24h: 1.13,
  activeWallets: 2_100_000,
  activeWalletsChangePercent24h: -0.6,
};

const featuredTokens: TokenListItem[] = [
  {
    id: 'alpha-token',
    name: 'Alpha Token',
    symbol: 'ALPHA',
    subnet: 'SN42',
    price: 10,
    marketCap: 10_000_000,
    changePercent24h: -5,
    changePercent7d: 1.5,
    changePercent30d: 4,
    netVolume24h: -2_801.47,
    buyVolume24h: 10_125.31,
    sellVolume24h: 12_926.78,
    transactions24h: 4_342,
    emissionsPerDay: 0.55,
  },
  {
    id: 'beta-token',
    name: 'Beta Token',
    symbol: 'BETA',
    subnet: 'SN43',
    price: 20,
    marketCap: 9_000_000,
    changePercent24h: 12,
    changePercent7d: -2,
    changePercent30d: 8,
    netVolume24h: 5_000,
    buyVolume24h: 15_000,
    sellVolume24h: 10_000,
    transactions24h: 5_000,
    emissionsPerDay: 0.75,
  },
  {
    id: 'gamma-token',
    name: 'Gamma Token',
    symbol: 'GAMMA',
    subnet: 'SN44',
    price: 15,
    marketCap: 8_000_000,
    changePercent24h: 3,
    changePercent7d: 5,
    changePercent30d: -1,
    netVolume24h: 1_200,
    buyVolume24h: 8_000,
    sellVolume24h: 6_800,
    transactions24h: 3_500,
    emissionsPerDay: 0.4,
  },
];

export const tokenListFixture: TokenListItem[] = [
  ...featuredTokens,
  ...Array.from({ length: 247 }, (_, index): TokenListItem => {
    const sequence = index + 1;
    return {
      id: `market-token-${sequence.toString().padStart(3, '0')}`,
      name: `Market Token ${sequence.toString().padStart(3, '0')}`,
      symbol: `MT${sequence}`,
      subnet: `SN${sequence + 100}`,
      price: 1 + sequence / 100,
      marketCap: 1_000_000 - sequence * 1_000,
      changePercent24h: (sequence % 5) - 2,
      changePercent7d: (sequence % 7) - 3,
      changePercent30d: (sequence % 9) - 4,
      netVolume24h: sequence * 100,
      buyVolume24h: sequence * 120,
      sellVolume24h: sequence * 80,
      transactions24h: sequence * 10,
      emissionsPerDay: sequence / 100,
    };
  }),
];

function tokenDetailFixture(token: TokenListItem): TokenDetail {
  return {
    id: token.id,
    name: token.name,
    symbol: token.symbol,
    subnet: token.subnet,
    currency: 'USD',
    price: token.price,
    change24h: -0.5,
    changePercent24h: token.changePercent24h,
    marketCap: token.marketCap,
    circulatingSupply: 1_000_000,
    maxSupply: 21_000_000,
    netVolume24h: token.netVolume24h,
    traders24h: 589,
    lastUpdated: '2026-06-05T10:30:00.000Z',
  };
}

function statsFixture(token: TokenListItem, range: HistoryRange): TokenStats {
  return {
    id: token.id,
    name: token.name,
    symbol: token.symbol,
    subnet: token.subnet,
    range,
    generatedAt: '2026-06-05T10:30:00.000Z',
    price: {
      open: 9,
      close: token.price,
      high: 11,
      low: 8,
      change: 1,
      changePercent: 10,
      allTimeHigh: {
        timestamp: '2026-06-05T10:00:00.000Z',
        time: 1_749_117_600,
        price: 12,
      },
      allTimeLow: {
        timestamp: '2026-06-05T09:00:00.000Z',
        time: 1_749_114_000,
        price: 7,
      },
    },
    financials: {
      marketCap: token.marketCap,
      fullyDilutedValue: 210_000_000,
      mcFdvRatio: 0.05,
      circulatingSupply: 1_000_000,
      totalSupply: 10_000_000,
      maxSupply: 21_000_000,
      totalStaked: 500_000,
      averageStakeApy: 8.5,
    },
    trading: {
      totalVolume: 25_000,
      netVolume: token.netVolume24h,
      buyVolume: 15_000,
      sellVolume: 10_000,
      transactions: 1_000,
      traders: 500,
      totalBuys: 600,
      totalSells: 400,
      uniqueBuyers: 300,
      uniqueSellers: 200,
    },
    subnetData: {
      emissionsPerDay: token.emissionsPerDay,
      incentiveBurn: 0.1,
      registrationCost: 1,
      activeValidators: 64,
      activeMiners: 128,
      registeredKeys: 192,
      keyCapacity: 256,
      registeredAt: '2024-01-01T00:00:00.000Z',
      nextHalving: '2028-01-01T00:00:00.000Z',
    },
  };
}

async function json(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

async function delayedJson(
  route: Route,
  body: unknown,
  delayMs: number | undefined,
) {
  if (delayMs) await new Promise((resolve) => setTimeout(resolve, delayMs));
  try {
    await json(route, body);
  } catch (error) {
    if (!route.request().failure()) throw error;
  }
}

export async function mockExploreApi(
  page: Page,
  options: { delayMs?: number } = {},
) {
  await page.route('**/api/market/summary', async (route) => {
    if (options.delayMs)
      await new Promise((resolve) => setTimeout(resolve, options.delayMs));
    await json(route, marketSummaryFixture);
  });
  await page.route('**/api/tokens', async (route) => {
    if (options.delayMs)
      await new Promise((resolve) => setTimeout(resolve, options.delayMs));
    await json(route, {
      tokens: tokenListFixture,
      meta: { latencyMs: 0, latencyEnabled: false },
    });
  });
}

type TokenRangeResource = 'history' | 'stats';

type TokenDetailsMockOptions = {
  historyDelayMs?: Partial<Record<HistoryRange, number>>;
  statsDelayMs?: Partial<Record<HistoryRange, number>>;
  onRangeRequest?: (resource: TokenRangeResource, range: HistoryRange) => void;
};

export async function mockTokenDetailsApi(
  page: Page,
  id = 'alpha-token',
  options: TokenDetailsMockOptions = {},
) {
  const token = tokenListFixture.find((candidate) => candidate.id === id);
  if (!token) throw new Error(`Unknown fixture token: ${id}`);

  await page.route(`**/api/tokens/${id}`, (route) =>
    json(route, tokenDetailFixture(token)),
  );
  await page.route(`**/api/tokens/${id}/history?range=*`, (route) => {
    const range = new URL(route.request().url()).searchParams.get(
      'range',
    ) as HistoryRange;
    options.onRangeRequest?.('history', range);
    return delayedJson(
      route,
      {
        id,
        symbol: token.symbol,
        range,
        generatedAt: '2026-06-05T10:30:00.000Z',
        points: [
          { timestamp: '2026-06-05T09:00:00.000Z', price: 9 },
          { timestamp: '2026-06-05T10:00:00.000Z', price: token.price },
        ],
      },
      options.historyDelayMs?.[range],
    );
  });
  await page.route(`**/api/tokens/${id}/stats?range=*`, (route) => {
    const range = new URL(route.request().url()).searchParams.get(
      'range',
    ) as HistoryRange;
    options.onRangeRequest?.('stats', range);
    return delayedJson(
      route,
      statsFixture(token, range),
      options.statsDelayMs?.[range],
    );
  });
}
