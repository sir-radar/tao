import Image from 'next/image';
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
  formatDecimal,
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
  align?: 'start' | 'end';
  source?: 'api' | 'figma';
  detailSource?: 'api' | 'figma';
};

function MetricGrid({
  metrics,
  layout = 'three-columns',
}: {
  metrics: Metric[];
  layout?: 'highlights' | 'two-columns' | 'three-columns';
}) {
  return (
    <dl
      className={cn(
        'grid min-w-0 gap-x-4 gap-y-4',
        layout === 'highlights' &&
          'grid-cols-6 min-[1551px]:grid-rows-[68px_64px] min-[1551px]:gap-x-6 min-[1551px]:gap-y-6 max-[1550px]:grid-cols-4 max-[1250px]:grid-cols-3',
        layout === 'two-columns' && 'grid-cols-2',
        layout === 'three-columns' && 'grid-cols-3',
      )}
    >
      {metrics.map((metric) => (
        <div
          key={metric.label}
          data-value-source={metric.source ?? 'api'}
          data-detail-source={
            metric.detail
              ? (metric.detailSource ?? metric.source ?? 'api')
              : undefined
          }
          className={cn(
            'min-w-0',
            metric.align === 'end' && 'flex flex-col items-end text-right',
          )}
        >
          <dt
            className={cn(
              'truncate font-[430] text-muted-foreground',
              layout === 'highlights'
                ? 'text-sm leading-5 text-[#a1a1a1]'
                : 'w-fit max-w-full border-b border-dashed border-white/20 text-xs leading-4',
            )}
          >
            {metric.label}
          </dt>
          <dd
            className={cn(
              'truncate font-[570] tabular',
              layout === 'highlights'
                ? 'min-h-5 text-xl leading-5'
                : 'min-h-[22px] text-base leading-[22px]',
            )}
          >
            {metric.value}
          </dd>
          {metric.detail && (
            <dd
              className={cn(
                'truncate font-[430] text-muted-foreground',
                layout === 'highlights'
                  ? 'mt-1 text-xs leading-4'
                  : 'text-sm leading-5',
              )}
            >
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
    <section
      className={cn(
        'flex min-w-0 flex-col gap-4 rounded-2xl border border-white/8 bg-transparent p-4',
        className,
      )}
    >
      <div className="flex min-h-8 items-center justify-between gap-4">
        <h3 className="text-xl font-[570] leading-8">{title}</h3>
        {titleRight}
      </div>
      {children}
    </section>
  );
}

function CurrencyPreview({ name }: { name: string }) {
  return (
    <fieldset
      disabled
      className="flex h-9 w-[95px] items-center rounded-[10px] bg-secondary p-1"
      aria-label="Currency preview"
    >
      <legend className="sr-only">Display currency</legend>
      <label className="flex h-7 w-11 items-center justify-center rounded-md bg-card text-sm font-[570] leading-5 shadow-sm">
        <input
          type="radio"
          name={name}
          value="usd"
          defaultChecked
          className="sr-only"
        />
        USD
      </label>
      <label className="flex h-7 w-[43px] items-center justify-center text-sm font-[570] leading-5 text-muted-foreground">
        <input type="radio" name={name} value="tao" className="sr-only" />
        TAO
      </label>
    </fieldset>
  );
}

function supply(value: NullableNumber, symbol: string) {
  return value === null ? '—' : `${formatCompact(value)} ${symbol}`;
}

function metric(
  label: string,
  value: React.ReactNode,
  options: Pick<Metric, 'detail' | 'align' | 'source' | 'detailSource'> = {},
): Metric {
  return { label, value, ...options };
}

function figmaMetric(
  label: string,
  value: React.ReactNode,
  options: Pick<Metric, 'detail' | 'align'> = {},
) {
  return metric(label, value, {
    ...options,
    source: 'figma',
    detailSource: options.detail ? 'figma' : undefined,
  });
}

function formatTao(value: NullableNumber) {
  return value === null ? '—' : `τ${formatDecimal(value, 4)}`;
}

function formatUidCapacity(
  registered: NullableNumber,
  capacity: NullableNumber,
) {
  if (registered === null || capacity === null) return '—';
  return `${formatInteger(registered)}/${formatInteger(capacity)}`;
}

function formatOrdinalDate(value: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  const day = date.getUTCDate();
  const remainder = day % 100;
  const suffix =
    remainder >= 11 && remainder <= 13
      ? 'th'
      : day % 10 === 1
        ? 'st'
        : day % 10 === 2
          ? 'nd'
          : day % 10 === 3
            ? 'rd'
            : 'th';
  const month = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    timeZone: 'UTC',
  }).format(date);
  return `${month} ${day}${suffix}, ${date.getUTCFullYear()}`;
}

function formatNumericDate(value: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value));
}

function DirectionalValue({
  value,
  format,
}: {
  value: NullableNumber;
  format: (value: NullableNumber) => string;
}) {
  if (value === null) return <span className="text-muted-foreground">—</span>;

  const direction = value > 0 ? 'up' : value < 0 ? 'down' : null;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 whitespace-nowrap tabular',
        direction === 'up' && 'text-positive',
        direction === 'down' && 'text-negative',
        direction === null && 'text-muted-foreground',
      )}
    >
      {direction && (
        <Image
          src={`/assets/trading/arrow-${direction}-01.svg`}
          alt=""
          width={16}
          height={16}
          className="size-4 shrink-0"
          aria-hidden="true"
        />
      )}
      <span>{format(Math.abs(value))}</span>
      <span className="sr-only">
        {direction === 'up'
          ? 'positive'
          : direction === 'down'
            ? 'negative'
            : 'unchanged'}
      </span>
    </span>
  );
}

function buildMetricGroups({
  stats,
  token,
  symbol,
}: {
  stats: TokenStats;
  token: TokenDetail;
  symbol: string;
}) {
  const financials = {
    marketCap: metric(
      'Market cap',
      formatCurrencyCompact(stats.financials.marketCap),
    ),
    circulatingSupply: metric(
      'Circulating supply',
      supply(stats.financials.circulatingSupply, symbol),
    ),
    fullyDilutedValue: metric(
      'Fully diluted value',
      formatCurrencyCompact(stats.financials.fullyDilutedValue),
    ),
    totalSupply: metric(
      'Total supply',
      supply(stats.financials.totalSupply, symbol),
    ),
    mcFdvRatio: metric(
      'MC / FDV ratio',
      formatRatio(stats.financials.mcFdvRatio),
    ),
    maxSupply: metric('Max supply', supply(stats.financials.maxSupply, symbol)),
    alphaStaked: metric(
      'Alpha staked',
      supply(stats.financials.totalStaked, symbol),
    ),
    averageStakeApy: metric(
      'Average Stake APY',
      formatPercent(stats.financials.averageStakeApy, false),
    ),
  };

  const trading = {
    totalVolume: metric('Total volume', formatPrice(stats.trading.totalVolume)),
    netVolume: metric(
      'Net volume',
      <DirectionalValue value={stats.trading.netVolume} format={formatPrice} />,
      { align: 'end' },
    ),
    transactions: metric(
      'Transactions',
      formatInteger(stats.trading.transactions),
    ),
    traders: metric('Total traders', formatInteger(stats.trading.traders), {
      align: 'end',
    }),
  };

  const subnet = [
    figmaMetric('Emissions', '2.81%'),
    figmaMetric('Root proportion', '46.15%'),
    metric('Emissions / day', formatTao(stats.subnetData.emissionsPerDay)),
    metric(
      'Incentive burn',
      formatPercent(
        stats.subnetData.incentiveBurn === null
          ? null
          : stats.subnetData.incentiveBurn * 100,
        false,
      ),
    ),
    figmaMetric('Owner / day', 'τ12.9402'),
    figmaMetric('Recycled / day', 'τ0.00'),
    figmaMetric('Miners / day', 'τ29.4712'),
    metric('Registration cost', formatTao(stats.subnetData.registrationCost)),
    figmaMetric('Validator / day', 'τ29.4712'),
    metric(
      'UIDs',
      formatUidCapacity(
        stats.subnetData.registeredKeys,
        stats.subnetData.keyCapacity,
      ),
    ),
    metric('Registered', formatOrdinalDate(stats.subnetData.registeredAt)),
    figmaMetric('Last identity change', 'Aug 6th, 2024'),
    figmaMetric('Last cold key swap', 'Jan 2nd, 2027'),
    metric(
      'Next halving (est)',
      formatOrdinalDate(stats.subnetData.nextHalving),
    ),
  ];

  const price = [
    metric('Current price', formatPrice(stats.price.close)),
    metric(
      `Price change (${RANGE_LABELS[stats.range]})`,
      <DirectionalValue
        value={stats.price.changePercent}
        format={(value) => formatPercent(value, false)}
      />,
    ),
    metric('Low', formatPrice(stats.price.low)),
    metric('High', formatPrice(stats.price.high)),
    metric(
      'All time high',
      formatPrice(stats.price.allTimeHigh?.price ?? null),
      {
        detail: formatNumericDate(stats.price.allTimeHigh?.timestamp ?? null),
      },
    ),
    metric('All time low', formatPrice(stats.price.allTimeLow?.price ?? null), {
      detail: formatNumericDate(stats.price.allTimeLow?.timestamp ?? null),
    }),
  ];

  return {
    highlights: [
      {
        ...financials.marketCap,
        detail: (
          <Movement value={token.changePercent24h} compact variant="summary" />
        ),
      },
      {
        ...financials.circulatingSupply,
        detail: <Movement value={-0.07} compact variant="summary" />,
        detailSource: 'figma' as const,
      },
      {
        ...financials.fullyDilutedValue,
        detail: <Movement value={0.03} compact variant="summary" />,
        detailSource: 'figma' as const,
      },
      {
        ...financials.totalSupply,
        detail: <Movement value={1.35} compact variant="summary" />,
        detailSource: 'figma' as const,
      },
      {
        ...financials.mcFdvRatio,
        detail: <Movement value={1.28} compact variant="summary" />,
        detailSource: 'figma' as const,
      },
      financials.maxSupply,
      {
        ...metric(
          `Net volume (${RANGE_LABELS[stats.range]})`,
          formatCurrencyCompact(stats.trading.netVolume),
        ),
        detail: <Movement value={-0.37} compact variant="summary" />,
        detailSource: 'figma' as const,
      },
      {
        ...metric('Total traders', formatInteger(stats.trading.traders)),
        detail: <Movement value={0.03} compact variant="summary" />,
        detailSource: 'figma' as const,
      },
    ],
    financialsTop: [
      financials.marketCap,
      financials.circulatingSupply,
      financials.fullyDilutedValue,
      financials.totalSupply,
      financials.mcFdvRatio,
      financials.maxSupply,
    ],
    financialsDetail: [
      figmaMetric('ADR', '152%'),
      figmaMetric('Total issues', '4.37M'),
      financials.alphaStaked,
      figmaMetric('Total burned', '290.40K'),
      figmaMetric('TAO in pool', 'τ48.00K', { detail: '$7.54M' }),
      figmaMetric('Alpha in pool', '1.58M', { detail: '$7.54M' }),
      financials.averageStakeApy,
    ],
    subnet,
    trading: Object.values(trading),
    price,
  };
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
      sellLabel: 'Total sales',
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
    <div className="flex flex-col gap-4 border-t border-white/8 pt-4">
      {groups.map((group) => {
        const total =
          group.buy === null || group.sell === null
            ? null
            : group.buy + group.sell;
        const buyShare = percentageShare(group.buy, total);
        const sellShare = buyShare === null ? null : 100 - buyShare;
        return (
          <div key={group.label} className="flex h-[54px] flex-col gap-2">
            <div className="flex h-[38px] justify-between gap-6">
              <span className="flex min-w-0 flex-col items-start">
                <span className="h-4 text-xs leading-4 text-muted-foreground">
                  {group.buyLabel}
                </span>
                <span className="flex h-[22px] items-center gap-1 text-base font-[570] leading-[22px] tabular text-foreground">
                  {group.format(group.buy)}
                  <small className="h-5 rounded-lg bg-[#132a06] px-2 py-0.5 text-xs font-[570] leading-4 text-positive">
                    {formatPercent(buyShare, false)}
                  </small>
                </span>
              </span>
              <span className="flex min-w-0 flex-col items-end text-right">
                <span className="h-4 text-xs leading-4 text-muted-foreground">
                  {group.sellLabel}
                </span>
                <span className="flex h-[22px] items-center gap-1 text-base font-[570] leading-[22px] tabular text-foreground">
                  {group.format(group.sell)}
                  <small className="h-5 rounded-lg bg-[#34191d] px-2 py-0.5 text-xs font-[570] leading-4 text-negative">
                    {formatPercent(sellShare, false)}
                  </small>
                </span>
              </span>
            </div>
            <div
              className={cn(
                'flex h-2 overflow-hidden rounded-2xl',
                buyShare === null ? 'bg-muted' : 'gap-1 bg-transparent',
              )}
              role="img"
              aria-label={
                buyShare === null
                  ? `${group.label}: share unavailable`
                  : `${group.label}: ${formatPercent(buyShare, false)} buy and ${formatPercent(sellShare, false)} sell`
              }
            >
              {buyShare !== null && sellShare !== null && (
                <>
                  <span
                    className="min-w-0 basis-0 rounded-2xl bg-positive"
                    style={{ flexGrow: buyShare }}
                  />
                  <span
                    className="min-w-0 basis-0 rounded-2xl bg-negative"
                    style={{ flexGrow: sellShare }}
                  />
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatsPanelGrid({
  stats,
  token,
  symbol,
}: {
  stats: TokenStats;
  token: TokenDetail;
  symbol: string;
}) {
  const metrics = buildMetricGroups({ stats, token, symbol });

  return (
    <div className="grid grid-cols-2 items-start gap-6 max-[1250px]:grid-cols-1">
      <StatPanel
        title={`Highlights (${RANGE_LABELS[stats.range]})`}
        className="col-span-2 min-[1251px]:h-[236px] max-[1250px]:col-span-1"
      >
        <MetricGrid layout="highlights" metrics={metrics.highlights} />
      </StatPanel>

      <StatPanel title="Financials" className="min-[1251px]:h-[354px]">
        <MetricGrid metrics={metrics.financialsTop} />
        <MetricGrid metrics={metrics.financialsDetail} />
      </StatPanel>

      <StatPanel title="Subnet data" className="min-[1251px]:h-[334px]">
        <MetricGrid metrics={metrics.subnet} />
      </StatPanel>

      <StatPanel
        title="Trading volume"
        titleRight={<CurrencyPreview name="trading-volume-currency" />}
        className="min-[1251px]:h-[402px]"
      >
        <MetricGrid layout="two-columns" metrics={metrics.trading} />
        <TradingBars stats={stats} />
      </StatPanel>

      <StatPanel
        title="Price history"
        titleRight={<CurrencyPreview name="price-history-currency" />}
        className="min-[1251px]:h-[196px]"
      >
        <MetricGrid metrics={metrics.price} />
      </StatPanel>
    </div>
  );
}

function StatsSkeleton() {
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
              <StatsPanelGrid stats={displayed} token={token} symbol={symbol} />
            </>
          ) : null}
        </TabsContent>
      </Tabs>
    </section>
  );
}
