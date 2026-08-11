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
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Movement } from './Movement';
import { ResourceError } from './ResourceState';

type Metric = {
  label: string;
  value: React.ReactNode;
  detail?: React.ReactNode;
};

function MetricGrid({
  metrics,
  layout = 'standard',
}: {
  metrics: Metric[];
  layout?: 'highlights' | 'standard' | 'compact';
}) {
  return (
    <dl
      className={cn(
        'grid min-w-0 gap-x-6 gap-y-4',
        layout === 'highlights' &&
          'grid-cols-6 max-[1550px]:grid-cols-4 max-[1250px]:grid-cols-3',
        layout === 'standard' && 'grid-cols-3',
        layout === 'compact' && 'grid-cols-3',
      )}
    >
      {metrics.map((metric) => (
        <div key={metric.label} className="min-w-0">
          <dt
            className={cn(
              'truncate leading-4 text-muted-foreground',
              layout === 'highlights' ? 'text-sm' : 'text-xs',
            )}
          >
            {metric.label}
          </dt>
          <dd className="mt-0.5 min-h-[22px] truncate text-base font-medium leading-[22px] tabular">
            {metric.value}
          </dd>
          {metric.detail && (
            <dd className="mt-0.5 truncate text-xs leading-4 text-muted-foreground">
              {metric.detail}
            </dd>
          )}
        </div>
      ))}
    </dl>
  );
}

function StatPanel({
  title,
  titleRight,
  className,
  children,
}: {
  title: string;
  titleRight?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-4 rounded-2xl border border-white/8 bg-transparent p-4',
        className,
      )}
    >
      <div className="flex min-h-8 items-center justify-between gap-4">
        <h3 className="text-xl font-medium leading-8">{title}</h3>
        {titleRight}
      </div>
      {children}
    </div>
  );
}

function CurrencyPreview() {
  return (
    <div
      className="flex h-9 items-center rounded-[10px] bg-secondary p-1"
      aria-label="Currency preview"
    >
      <span className="flex h-7 items-center rounded-md bg-card px-2 text-xs font-medium shadow-sm">
        USD
      </span>
      <span className="flex h-7 items-center px-2 text-xs font-medium text-muted-foreground">
        TAO
      </span>
    </div>
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
      format: formatCurrencyCompact,
    },
    {
      label: 'Orders',
      buyLabel: 'Total buys',
      sellLabel: 'Total sells',
      buy: stats.trading.totalBuys,
      sell: stats.trading.totalSells,
      format: formatInteger,
    },
    {
      label: 'Participants',
      buyLabel: 'Unique buyers',
      sellLabel: 'Unique sellers',
      buy: stats.trading.uniqueBuyers,
      sell: stats.trading.uniqueSellers,
      format: formatInteger,
    },
  ];

  return (
    <div className="space-y-3.5">
      {groups.map((group) => {
        const total =
          group.buy === null || group.sell === null
            ? null
            : group.buy + group.sell;
        const buyShare = percentageShare(group.buy, total);
        const sellShare = buyShare === null ? null : 100 - buyShare;
        return (
          <div key={group.label}>
            <div className="mb-1.5 flex justify-between gap-6 text-xs leading-4">
              <span className="min-w-0">
                <span className="block text-muted-foreground">
                  {group.buyLabel}
                </span>
                <span className="tabular text-foreground">
                  {group.format(group.buy)}{' '}
                  <span className="text-positive">
                    {formatPercent(buyShare, false)}
                  </span>
                </span>
              </span>
              <span className="min-w-0 text-right">
                <span className="block text-muted-foreground">
                  {group.sellLabel}
                </span>
                <span className="tabular text-foreground">
                  {group.format(group.sell)}{' '}
                  <span className="text-negative">
                    {formatPercent(sellShare, false)}
                  </span>
                </span>
              </span>
            </div>
            <div
              className={cn(
                'flex h-2 overflow-hidden rounded-2xl',
                buyShare === null ? 'bg-muted' : 'bg-negative',
              )}
              role="img"
              aria-label={
                buyShare === null
                  ? `${group.label}: share unavailable`
                  : `${group.label}: ${formatPercent(buyShare, false)} buy and ${formatPercent(sellShare, false)} sell`
              }
            >
              {buyShare !== null && (
                <span
                  className="rounded-2xl bg-positive"
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
    <div className="grid grid-cols-2 gap-6 max-[1250px]:grid-cols-1">
      <Skeleton className="col-span-2 h-[236px] rounded-2xl max-[1250px]:col-span-1" />
      <Skeleton className="h-[354px] rounded-2xl" />
      <Skeleton className="h-[334px] rounded-2xl" />
      <Skeleton className="h-[402px] rounded-2xl" />
      <Skeleton className="h-[196px] rounded-2xl" />
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
      className="border-t-2 border-white/8 pt-[22px]"
      aria-labelledby="token-stats-heading"
      aria-busy={isInitialLoading || isUpdating}
    >
      <h2 id="token-stats-heading" className="sr-only">
        Token statistics
      </h2>
      <Tabs defaultValue="stats" className="gap-6">
        <div className="flex h-[52px] items-center justify-between gap-3">
          <TabsList
            variant="line"
            aria-label="Token detail sections"
            className="h-[52px] gap-2 p-0"
          >
            <TabsTrigger
              value="transactions"
              disabled
              className="h-[52px] flex-none px-6 text-xl font-medium leading-8 disabled:opacity-100"
            >
              Transactions
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="h-[52px] flex-none px-6 text-xl font-medium leading-8 after:bottom-0 after:bg-primary"
            >
              Stats
            </TabsTrigger>
          </TabsList>
          {isUpdating && (
            <span
              className="inline-flex items-center gap-2 text-xs text-muted-foreground"
              aria-live="polite"
            >
              <Spinner className="size-3" /> Updating stats to{' '}
              {RANGE_LABELS[selectedRange]}
            </span>
          )}
        </div>

        <TabsContent value="stats" className="mt-0">
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
                  className="mb-6"
                />
              )}
              <div className="grid grid-cols-2 items-start gap-6 max-[1250px]:grid-cols-1">
                <StatPanel
                  title={`Highlights (${RANGE_LABELS[displayed.range]})`}
                  className="col-span-2 min-[1251px]:h-[236px] max-[1250px]:col-span-1"
                >
                  <MetricGrid
                    layout="highlights"
                    metrics={[
                      {
                        label: 'Market cap',
                        value: formatCurrencyCompact(
                          displayed.financials.marketCap,
                        ),
                        detail: (
                          <Movement value={token.changePercent24h} compact />
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
                        value: supply(displayed.financials.totalSupply, symbol),
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
                        label: 'Net volume',
                        value: formatCurrencyCompact(
                          displayed.trading.netVolume,
                        ),
                      },
                      {
                        label: 'Total traders',
                        value: formatInteger(displayed.trading.traders),
                      },
                    ]}
                  />
                </StatPanel>

                <StatPanel
                  title="Financials"
                  className="min-[1251px]:h-[354px]"
                >
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
                        value: supply(displayed.financials.totalSupply, symbol),
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
                        label: 'Total staked',
                        value: supply(displayed.financials.totalStaked, symbol),
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
                </StatPanel>

                <StatPanel
                  title="Subnet data"
                  className="min-[1251px]:h-[334px]"
                >
                  <MetricGrid
                    metrics={[
                      {
                        label: 'Emissions / day',
                        value: supply(
                          displayed.subnetData.emissionsPerDay,
                          'TAO',
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
                        label: 'Registration cost',
                        value: supply(
                          displayed.subnetData.registrationCost,
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
                        value: formatInteger(displayed.subnetData.activeMiners),
                      },
                      {
                        label: 'Registered keys',
                        value: formatInteger(
                          displayed.subnetData.registeredKeys,
                        ),
                      },
                      {
                        label: 'Key capacity',
                        value: formatInteger(displayed.subnetData.keyCapacity),
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
                </StatPanel>

                <StatPanel
                  title="Trading volume"
                  titleRight={<CurrencyPreview />}
                  className="min-[1251px]:h-[402px]"
                >
                  <MetricGrid
                    layout="compact"
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
                </StatPanel>

                <StatPanel
                  title="Price history"
                  titleRight={<CurrencyPreview />}
                  className="gap-[14px] min-[1251px]:h-[196px]"
                >
                  <MetricGrid
                    layout="compact"
                    metrics={[
                      {
                        label: 'Current price',
                        value: formatPrice(displayed.price.close),
                        detail: `Open ${formatPrice(displayed.price.open)}`,
                      },
                      {
                        label: 'Price change',
                        value: (
                          <Movement value={displayed.price.changePercent} />
                        ),
                        detail: formatPrice(displayed.price.change),
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
                </StatPanel>
              </div>
            </>
          ) : null}
        </TabsContent>
      </Tabs>
    </section>
  );
}
