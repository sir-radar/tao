import {
  PayloadError,
  type HistoryRange,
  type HistorySeries,
  type MarketSummary,
  type PricePoint,
  type TokenDetail,
  type TokenListItem,
  type TokenStats,
} from './contracts';

type JsonObject = Record<string, unknown>;

function object(value: unknown): JsonObject | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
}

function text(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function number(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function dateText(value: unknown): string | null {
  const candidate = text(value);
  return candidate && Number.isFinite(Date.parse(candidate)) ? candidate : null;
}

function normalizeUniqueItems<Item, Key>(
  values: unknown[],
  normalizeItem: (value: unknown) => Item | null,
  getKey: (item: Item) => Key,
  unusableMessage: string,
): Item[] {
  const unique = new Map<Key, Item>();
  for (const value of values) {
    const item = normalizeItem(value);
    if (item) unique.set(getKey(item), item);
  }
  if (values.length > 0 && unique.size === 0)
    throw new PayloadError(unusableMessage);
  return [...unique.values()];
}

export function normalizeMarketSummary(value: unknown): MarketSummary {
  const source = object(value);
  if (!source) throw new PayloadError('Market summary was not an object.');
  const result: MarketSummary = {
    generatedAt: dateText(source.generatedAt),
    marketCap: number(source.marketCap),
    marketCapChangePercent24h: number(source.marketCapChangePercent24h),
    volume24h: number(source.volume24h),
    volumeChangePercent24h: number(source.volumeChangePercent24h),
    volumeToMarketCapPercent: number(source.volumeToMarketCapPercent),
    dailyTrades: number(source.dailyTrades),
    dailyTradesChangePercent24h: number(source.dailyTradesChangePercent24h),
    dailyTraders: number(source.dailyTraders),
    dailyTradersChangePercent24h: number(source.dailyTradersChangePercent24h),
    activeWallets: number(source.activeWallets),
    activeWalletsChangePercent24h: number(source.activeWalletsChangePercent24h),
  };
  if (
    Object.entries(result).every(
      ([key, item]) => key === 'generatedAt' || item === null,
    )
  ) {
    throw new PayloadError('Market summary contained no usable metrics.');
  }
  return result;
}

function normalizeToken(value: unknown): TokenListItem | null {
  const source = object(value);
  const id = text(source?.id);
  const name = text(source?.name);
  const subnet = text(source?.subnet);
  if (!source || !id || !name || !subnet) return null;
  return {
    id,
    name,
    subnet,
    symbol: text(source.symbol),
    price: number(source.price),
    marketCap: number(source.marketCap),
    changePercent24h: number(source.changePercent24h),
    changePercent7d: number(source.changePercent7d),
    changePercent30d: number(source.changePercent30d),
    netVolume24h: number(source.netVolume24h),
    buyVolume24h: number(source.buyVolume24h),
    sellVolume24h: number(source.sellVolume24h),
    transactions24h: number(source.transactions24h),
    emissionsPerDay: number(source.emissionsPerDay),
  };
}

export function normalizeTokenList(value: unknown): TokenListItem[] {
  const source = object(value);
  if (!source || !Array.isArray(source.tokens))
    throw new PayloadError('Token list was malformed.');
  return normalizeUniqueItems(
    source.tokens,
    normalizeToken,
    (token) => token.id,
    'Token list contained no usable rows.',
  );
}

export function normalizeTokenDetail(
  value: unknown,
  expectedId: string,
): TokenDetail {
  const source = object(value);
  const id = text(source?.id);
  const name = text(source?.name);
  const subnet = text(source?.subnet);
  if (!source || id !== expectedId || !name || !subnet)
    throw new PayloadError('Token details did not match this token.');
  return {
    id,
    name,
    subnet,
    symbol: text(source.symbol),
    currency: text(source.currency),
    price: number(source.price),
    change24h: number(source.change24h),
    changePercent24h: number(source.changePercent24h),
    marketCap: number(source.marketCap),
    circulatingSupply: number(source.circulatingSupply),
    maxSupply: number(source.maxSupply),
    netVolume24h: number(source.netVolume24h),
    traders24h: number(source.traders24h),
    lastUpdated: dateText(source.lastUpdated),
  };
}

function normalizePoint(value: unknown): PricePoint | null {
  const source = object(value);
  const timestamp = dateText(source?.timestamp);
  const price = number(source?.price);
  if (!timestamp || price === null || price <= 0) return null;
  return { timestamp, time: Math.floor(Date.parse(timestamp) / 1000), price };
}

export function normalizeHistory(
  value: unknown,
  expectedId: string,
  expectedRange: HistoryRange,
): HistorySeries {
  const source = object(value);
  const id = text(source?.id);
  const range = source?.range;
  if (
    !source ||
    id !== expectedId ||
    range !== expectedRange ||
    !Array.isArray(source.points)
  ) {
    throw new PayloadError('Price history did not match this token and range.');
  }
  const points = normalizeUniqueItems(
    source.points,
    normalizePoint,
    (point) => point.time,
    'Price history contained no usable points.',
  );
  return {
    id,
    symbol: text(source.symbol),
    range: expectedRange,
    generatedAt: dateText(source.generatedAt),
    points: points.sort((a, b) => a.time - b.time),
  };
}

function numericGroup(
  source: JsonObject | null,
  keys: readonly string[],
): Record<string, number | null> {
  return Object.fromEntries(keys.map((key) => [key, number(source?.[key])]));
}

export function normalizeStats(
  value: unknown,
  expectedId: string,
  expectedRange: HistoryRange,
): TokenStats {
  const source = object(value);
  const id = text(source?.id);
  if (!source || id !== expectedId || source.range !== expectedRange)
    throw new PayloadError('Stats did not match this token and range.');
  const priceSource = object(source.price);
  const financialsSource = object(source.financials);
  const tradingSource = object(source.trading);
  const subnetSource = object(source.subnetData);
  if (!priceSource || !financialsSource || !tradingSource || !subnetSource)
    throw new PayloadError('Stats groups were incomplete.');
  const result: TokenStats = {
    id,
    name: text(source.name),
    symbol: text(source.symbol),
    subnet: text(source.subnet),
    range: expectedRange,
    generatedAt: dateText(source.generatedAt),
    price: {
      ...numericGroup(priceSource, [
        'open',
        'close',
        'high',
        'low',
        'change',
        'changePercent',
      ]),
      allTimeHigh: normalizePoint(priceSource.allTimeHigh),
      allTimeLow: normalizePoint(priceSource.allTimeLow),
    } as TokenStats['price'],
    financials: numericGroup(financialsSource, [
      'marketCap',
      'fullyDilutedValue',
      'mcFdvRatio',
      'circulatingSupply',
      'totalSupply',
      'maxSupply',
      'totalStaked',
      'averageStakeApy',
    ]) as unknown as TokenStats['financials'],
    trading: numericGroup(tradingSource, [
      'totalVolume',
      'netVolume',
      'buyVolume',
      'sellVolume',
      'transactions',
      'traders',
      'totalBuys',
      'totalSells',
      'uniqueBuyers',
      'uniqueSellers',
    ]) as unknown as TokenStats['trading'],
    subnetData: {
      ...numericGroup(subnetSource, [
        'emissionsPerDay',
        'incentiveBurn',
        'registrationCost',
        'activeValidators',
        'activeMiners',
        'registeredKeys',
        'keyCapacity',
      ]),
      registeredAt: dateText(subnetSource.registeredAt),
      nextHalving: dateText(subnetSource.nextHalving),
    } as TokenStats['subnetData'],
  };
  const usableLeaves = [
    ...Object.values(result.price).filter(
      (value): value is number | PricePoint => value !== null,
    ),
    ...Object.values(result.financials),
    ...Object.values(result.trading),
    ...Object.values(result.subnetData),
  ];
  if (usableLeaves.every((value) => value === null))
    throw new PayloadError('Stats contained no usable values.');
  return result;
}
