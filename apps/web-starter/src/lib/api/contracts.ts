export const HISTORY_RANGES = ["1h", "24h", "7d", "30d", "90d", "1y", "all"] as const;
export type HistoryRange = (typeof HISTORY_RANGES)[number];

export const RANGE_LABELS: Record<HistoryRange, string> = {
  "1h": "1H", "24h": "24H", "7d": "7D", "30d": "30D", "90d": "90D", "1y": "1Y", all: "All",
};

export type NullableNumber = number | null;

export type MarketSummary = {
  generatedAt: string | null;
  marketCap: NullableNumber;
  marketCapChangePercent24h: NullableNumber;
  volume24h: NullableNumber;
  volumeChangePercent24h: NullableNumber;
  volumeToMarketCapPercent: NullableNumber;
  dailyTrades: NullableNumber;
  dailyTradesChangePercent24h: NullableNumber;
  dailyTraders: NullableNumber;
  dailyTradersChangePercent24h: NullableNumber;
  activeWallets: NullableNumber;
  activeWalletsChangePercent24h: NullableNumber;
};

export type TokenListItem = {
  id: string;
  name: string;
  symbol: string | null;
  subnet: string;
  price: NullableNumber;
  marketCap: NullableNumber;
  changePercent24h: NullableNumber;
  changePercent7d: NullableNumber;
  changePercent30d: NullableNumber;
  netVolume24h: NullableNumber;
  buyVolume24h: NullableNumber;
  sellVolume24h: NullableNumber;
  transactions24h: NullableNumber;
  emissionsPerDay: NullableNumber;
};

export type TokenDetail = {
  id: string;
  name: string;
  symbol: string | null;
  subnet: string;
  currency: string | null;
  price: NullableNumber;
  change24h: NullableNumber;
  changePercent24h: NullableNumber;
  marketCap: NullableNumber;
  circulatingSupply: NullableNumber;
  maxSupply: NullableNumber;
  netVolume24h: NullableNumber;
  traders24h: NullableNumber;
  lastUpdated: string | null;
};

export type PricePoint = { timestamp: string; time: number; price: number };

export type HistorySeries = {
  id: string;
  symbol: string | null;
  range: HistoryRange;
  generatedAt: string | null;
  points: PricePoint[];
};

export type StatsPrice = {
  open: NullableNumber; close: NullableNumber; high: NullableNumber; low: NullableNumber;
  change: NullableNumber; changePercent: NullableNumber;
  allTimeHigh: PricePoint | null; allTimeLow: PricePoint | null;
};

export type StatsFinancials = {
  marketCap: NullableNumber; fullyDilutedValue: NullableNumber; mcFdvRatio: NullableNumber;
  circulatingSupply: NullableNumber; totalSupply: NullableNumber; maxSupply: NullableNumber;
  totalStaked: NullableNumber; averageStakeApy: NullableNumber;
};

export type StatsTrading = {
  totalVolume: NullableNumber; netVolume: NullableNumber; buyVolume: NullableNumber; sellVolume: NullableNumber;
  transactions: NullableNumber; traders: NullableNumber; totalBuys: NullableNumber; totalSells: NullableNumber;
  uniqueBuyers: NullableNumber; uniqueSellers: NullableNumber;
};

export type StatsSubnet = {
  emissionsPerDay: NullableNumber; incentiveBurn: NullableNumber; registrationCost: NullableNumber;
  activeValidators: NullableNumber; activeMiners: NullableNumber; registeredKeys: NullableNumber;
  keyCapacity: NullableNumber; registeredAt: string | null; nextHalving: string | null;
};

export type TokenStats = {
  id: string; name: string | null; symbol: string | null; subnet: string | null;
  range: HistoryRange; generatedAt: string | null;
  price: StatsPrice; financials: StatsFinancials; trading: StatsTrading; subnetData: StatsSubnet;
};

export class PayloadError extends Error {
  constructor(message: string) { super(message); this.name = "PayloadError"; }
}
