import type {
  HistoryRange,
  NullableNumber,
  TokenDetail,
  TokenStats,
} from '@/lib/api/contracts';
import { RANGE_LABELS } from '@/lib/api/contracts';
import {
  formatCompact,
  formatCurrencyCompact,
  formatDate,
  formatInteger,
  formatPercent,
  formatPrice,
  formatRatio,
} from '@/lib/format';
import { percentageShare } from '@/lib/market';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Movement } from './Movement';
import { ResourceError } from './ResourceState';

type Metric = { label: string; value: React.ReactNode; detail?: string };

function MetricGrid({
  metrics,
  columns = 4,
}: {
  metrics: Metric[];
  columns?: 3 | 4;
}) {
  return (
    <dl
      className={
        columns === 4
          ? 'grid grid-cols-4 gap-x-5 gap-y-5 max-[1250px]:grid-cols-2'
          : 'grid grid-cols-3 gap-x-5 gap-y-5 max-[1250px]:grid-cols-2'
      }
    >
      {metrics.map((metric) => (
        <div key={metric.label} className="min-w-0">
          <dt className="truncate text-[10px] text-muted-foreground">
            {metric.label}
          </dt>
          <dd className="mt-1 truncate text-xs font-medium tabular">
            {metric.value}
          </dd>
          {metric.detail && (
            <dd className="mt-0.5 truncate text-[10px] text-muted-foreground">
              {metric.detail}
            </dd>
          )}
        </div>
      ))}
    </dl>
  );
}

function supply(value: NullableNumber, symbol: string) {
  return value === null ? '—' : `${formatCompact(value)} ${symbol}`;
}

function TradingBars({ stats }: { stats: TokenStats }) {
  const groups = [
    {
      label: 'Volume',
      buyLabel: 'Buy volume',
      sellLabel: 'Sell volume',
      buy: stats.trading.buyVolume,
      sell: stats.trading.sellVolume,
      total:
        stats.trading.buyVolume === null || stats.trading.sellVolume === null
          ? null
          : stats.trading.buyVolume + stats.trading.sellVolume,
    },
    {
      label: 'Orders',
      buyLabel: 'Total buys',
      sellLabel: 'Total sells',
      buy: stats.trading.totalBuys,
      sell: stats.trading.totalSells,
      total:
        stats.trading.totalBuys === null || stats.trading.totalSells === null
          ? null
          : stats.trading.totalBuys + stats.trading.totalSells,
    },
    {
      label: 'Participants',
      buyLabel: 'Unique buyers',
      sellLabel: 'Unique sellers',
      buy: stats.trading.uniqueBuyers,
      sell: stats.trading.uniqueSellers,
      total:
        stats.trading.uniqueBuyers === null ||
        stats.trading.uniqueSellers === null
          ? null
          : stats.trading.uniqueBuyers + stats.trading.uniqueSellers,
    },
  ];
  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const buyShare = percentageShare(group.buy, group.total);
        const sellShare = buyShare === null ? null : 100 - buyShare;
        return (
          <div key={group.label}>
            <div className="mb-1.5 flex justify-between gap-4 text-[10px]">
              <span className="text-positive">
                {group.buyLabel}: {formatCompact(group.buy)} (
                {formatPercent(buyShare, false)})
              </span>
              <span className="text-right text-negative">
                {group.sellLabel}: {formatCompact(group.sell)} (
                {formatPercent(sellShare, false)})
              </span>
            </div>
            <div
              className={
                buyShare === null
                  ? 'flex h-1.5 overflow-hidden rounded-full bg-muted'
                  : 'flex h-1.5 overflow-hidden rounded-full bg-negative'
              }
              role="img"
              aria-label={
                buyShare === null
                  ? `${group.label}: share unavailable`
                  : `${group.label}: ${formatPercent(buyShare, false)} buy and ${formatPercent(sellShare, false)} sell`
              }
            >
              {buyShare !== null && (
                <span
                  className="bg-positive"
                  style={{ width: `${buyShare}%` }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 max-[1100px]:grid-cols-1">
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton
          key={index}
          className={
            index === 0 ? 'col-span-2 h-40 max-[1100px]:col-span-1' : 'h-56'
          }
        />
      ))}
    </div>
  );
}

export function StatsSections({
  token,
  selectedRange,
  displayed,
  isInitialLoading,
  isUpdating,
  error,
  onRetry,
}: {
  token: TokenDetail;
  selectedRange: HistoryRange;
  displayed: TokenStats | null;
  isInitialLoading: boolean;
  isUpdating: boolean;
  error: unknown;
  onRetry: () => void;
}) {
  const symbol = token.symbol ?? token.id.toUpperCase();
  return (
    <section
      className="border-t pt-4"
      aria-labelledby="token-stats-heading"
      aria-busy={isInitialLoading || isUpdating}
    >
      <Tabs defaultValue="stats">
        <div className="flex items-center justify-between gap-3">
          <TabsList variant="line" aria-label="Token detail sections">
            <TabsTrigger value="transactions" disabled>
              Transactions
            </TabsTrigger>
            <TabsTrigger value="stats" id="token-stats-heading">
              Stats
            </TabsTrigger>
          </TabsList>
          {isUpdating && (
            <Badge variant="secondary" aria-live="polite">
              <Spinner className="size-3" /> Updating stats to{' '}
              {RANGE_LABELS[selectedRange]}
            </Badge>
          )}
        </div>
        <TabsContent value="stats" className="mt-4">
          {error && !displayed ? (
            <ResourceError
              title={`Could not load ${RANGE_LABELS[selectedRange]} stats`}
              error={error}
              retry={onRetry}
            />
          ) : isInitialLoading ? (
            <StatsSkeleton />
          ) : displayed ? (
            <>
              {error && (
                <ResourceError
                  title={`Could not load ${RANGE_LABELS[selectedRange]} stats`}
                  error={error}
                  retry={onRetry}
                  className="mb-4"
                />
              )}
              <div className="grid grid-cols-2 gap-4 max-[1100px]:grid-cols-1">
                <Card className="col-span-2 bg-transparent max-[1100px]:col-span-1">
                  <CardHeader>
                    <CardTitle>
                      Highlights ({RANGE_LABELS[displayed.range]})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MetricGrid
                      metrics={[
                        {
                          label: 'Market cap',
                          value: formatCurrencyCompact(
                            displayed.financials.marketCap,
                          ),
                        },
                        {
                          label: 'Circulating supply',
                          value: supply(
                            displayed.financials.circulatingSupply,
                            symbol,
                          ),
                        },
                        {
                          label: 'Fully diluted value',
                          value: formatCurrencyCompact(
                            displayed.financials.fullyDilutedValue,
                          ),
                        },
                        {
                          label: 'Total supply',
                          value: supply(
                            displayed.financials.totalSupply,
                            symbol,
                          ),
                        },
                        {
                          label: 'Net volume',
                          value: formatCurrencyCompact(
                            displayed.trading.netVolume,
                          ),
                        },
                        {
                          label: 'Total traders',
                          value: formatInteger(displayed.trading.traders),
                        },
                        {
                          label: 'Mkt cap / FDV',
                          value: formatRatio(displayed.financials.mcFdvRatio),
                        },
                        {
                          label: 'Average stake APY',
                          value: formatPercent(
                            displayed.financials.averageStakeApy,
                            false,
                          ),
                        },
                      ]}
                    />
                  </CardContent>
                </Card>

                <Card className="bg-transparent">
                  <CardHeader>
                    <CardTitle>Financials</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MetricGrid
                      columns={3}
                      metrics={[
                        {
                          label: 'Market cap',
                          value: formatCurrencyCompact(
                            displayed.financials.marketCap,
                          ),
                        },
                        {
                          label: 'Circulating supply',
                          value: supply(
                            displayed.financials.circulatingSupply,
                            symbol,
                          ),
                        },
                        {
                          label: 'Fully diluted value',
                          value: formatCurrencyCompact(
                            displayed.financials.fullyDilutedValue,
                          ),
                        },
                        {
                          label: 'Total supply',
                          value: supply(
                            displayed.financials.totalSupply,
                            symbol,
                          ),
                        },
                        {
                          label: 'Mkt cap / FDV',
                          value: formatRatio(displayed.financials.mcFdvRatio),
                        },
                        {
                          label: 'Max supply',
                          value: supply(displayed.financials.maxSupply, symbol),
                        },
                        {
                          label: 'Average stake APY',
                          value: formatPercent(
                            displayed.financials.averageStakeApy,
                            false,
                          ),
                        },
                        {
                          label: 'Total staked',
                          value: supply(
                            displayed.financials.totalStaked,
                            symbol,
                          ),
                        },
                      ]}
                    />
                  </CardContent>
                </Card>

                <Card className="bg-transparent">
                  <CardHeader>
                    <CardTitle>Subnet data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MetricGrid
                      columns={3}
                      metrics={[
                        {
                          label: 'Emissions / day',
                          value: supply(
                            displayed.subnetData.emissionsPerDay,
                            'TAO',
                          ),
                        },
                        {
                          label: 'Active validators',
                          value: formatInteger(
                            displayed.subnetData.activeValidators,
                          ),
                        },
                        {
                          label: 'Active miners',
                          value: formatInteger(
                            displayed.subnetData.activeMiners,
                          ),
                        },
                        {
                          label: 'Incentive burn',
                          value: formatPercent(
                            displayed.subnetData.incentiveBurn === null
                              ? null
                              : displayed.subnetData.incentiveBurn * 100,
                            false,
                          ),
                        },
                        {
                          label: 'Registered keys',
                          value: formatInteger(
                            displayed.subnetData.registeredKeys,
                          ),
                          detail: `${formatInteger(displayed.subnetData.keyCapacity)} capacity`,
                        },
                        {
                          label: 'Registration cost',
                          value: supply(
                            displayed.subnetData.registrationCost,
                            'TAO',
                          ),
                        },
                        {
                          label: 'Registered',
                          value: formatDate(displayed.subnetData.registeredAt),
                        },
                        {
                          label: 'Next halving',
                          value: formatDate(displayed.subnetData.nextHalving),
                        },
                      ]}
                    />
                  </CardContent>
                </Card>

                <Card className="bg-transparent">
                  <CardHeader>
                    <CardTitle>Trading volume</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <MetricGrid
                      metrics={[
                        {
                          label: 'Total volume',
                          value: formatCurrencyCompact(
                            displayed.trading.totalVolume,
                          ),
                        },
                        {
                          label: 'Net volume',
                          value: formatCurrencyCompact(
                            displayed.trading.netVolume,
                          ),
                        },
                        {
                          label: 'Transactions',
                          value: formatInteger(displayed.trading.transactions),
                        },
                        {
                          label: 'Total traders',
                          value: formatInteger(displayed.trading.traders),
                        },
                      ]}
                    />
                    <TradingBars stats={displayed} />
                  </CardContent>
                </Card>

                <Card className="bg-transparent">
                  <CardHeader>
                    <CardTitle>Price history</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MetricGrid
                      columns={3}
                      metrics={[
                        {
                          label: 'Current price',
                          value: formatPrice(displayed.price.close),
                        },
                        {
                          label: 'Price change',
                          value: (
                            <Movement value={displayed.price.changePercent} />
                          ),
                        },
                        {
                          label: 'Low',
                          value: formatPrice(displayed.price.low),
                        },
                        {
                          label: 'High',
                          value: formatPrice(displayed.price.high),
                        },
                        {
                          label: 'All-time high',
                          value: formatPrice(
                            displayed.price.allTimeHigh?.price ?? null,
                          ),
                          detail: formatDate(
                            displayed.price.allTimeHigh?.timestamp ?? null,
                          ),
                        },
                        {
                          label: 'All-time low',
                          value: formatPrice(
                            displayed.price.allTimeLow?.price ?? null,
                          ),
                          detail: formatDate(
                            displayed.price.allTimeLow?.timestamp ?? null,
                          ),
                        },
                      ]}
                    />
                  </CardContent>
                </Card>
              </div>
            </>
          ) : null}
        </TabsContent>
      </Tabs>
    </section>
  );
}
