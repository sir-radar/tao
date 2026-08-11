'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCompact, formatInteger, formatPercent } from '@/lib/format';
import { useMarketSummary } from '@/lib/queries';
import { Movement } from './Movement';
import { ResourceError } from './ResourceState';

export function MarketSummary() {
  const query = useMarketSummary();

  if (query.isPending) {
    return (
      <section
        aria-label="Market summary loading"
        aria-busy="true"
        className="grid h-[140px] grid-cols-6 gap-4 py-4 max-[900px]:h-auto max-[900px]:grid-cols-3"
      >
        {Array.from({ length: 6 }, (_, index) => (
          <Card
            key={index}
            className="h-[108px] gap-2 rounded-2xl border-0 p-4 shadow-none ring-0"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-5 w-14" />
          </Card>
        ))}
      </section>
    );
  }

  if (query.isError) {
    return (
      <ResourceError
        title="Market summary unavailable"
        error={query.error}
        retry={() => query.refetch()}
      />
    );
  }

  const data = query.data;
  const metrics = [
    {
      label: 'Market cap',
      value: formatCompact(data.marketCap, 'τ'),
      change: data.marketCapChangePercent24h,
    },
    {
      label: 'Volume (24h)',
      value: formatCompact(data.volume24h, 'τ'),
      change: data.volumeChangePercent24h,
    },
    {
      label: 'Vol/Mkt Cap (24h)',
      value: formatPercent(data.volumeToMarketCapPercent, false),
      change: data.volumeToMarketCapPercent,
      ratio: true,
    },
    {
      label: 'Daily Trades',
      value: formatInteger(data.dailyTrades),
      change: data.dailyTradesChangePercent24h,
    },
    {
      label: 'Daily Traders',
      value: formatInteger(data.dailyTraders),
      change: data.dailyTradersChangePercent24h,
    },
    {
      label: 'Active wallets',
      value: formatCompact(data.activeWallets),
      change: data.activeWalletsChangePercent24h,
    },
  ];

  return (
    <section
      aria-label="Global market summary"
      className="grid h-[140px] grid-cols-6 gap-4 py-4 max-[900px]:h-auto max-[900px]:grid-cols-3"
    >
      {metrics.map((metric) => (
        <Card
          key={metric.label}
          className="h-[108px] gap-1 rounded-2xl border-0 p-4 shadow-none ring-0"
        >
          <p className="h-5 text-sm leading-5 text-muted-foreground">
            {metric.label}
          </p>
          <p className="h-8 text-2xl leading-8 tracking-tight tabular">
            {metric.value}
          </p>
          <span className="flex h-5 items-center">
            <Movement value={metric.change} compact variant="summary" />
            {'ratio' in metric && metric.ratio && (
              <span className="sr-only">24H ratio</span>
            )}
          </span>
        </Card>
      ))}
    </section>
  );
}
