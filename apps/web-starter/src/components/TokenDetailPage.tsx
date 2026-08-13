'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, SearchX } from 'lucide-react';
import type { HistorySeries, TokenStats } from '@/lib/api/contracts';
import { ApiError } from '@/lib/api/client';
import { useTokenDetail, useTokenHistory, useTokenStats } from '@/lib/queries';
import { isInvalidHistoryRange, resolveHistoryRange } from '@/lib/range';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartPanel } from './ChartPanel';
import { PriceHeader } from './PriceHeader';
import { ResourceError } from './ResourceState';
import { StatsSections } from './StatsSections';
import { TradingRail } from './TradingRail';

function PriceHeaderDivider() {
  return (
    <div className="detail-page-width h-px" aria-hidden="true">
      <div className="h-px bg-border" />
    </div>
  );
}

export function TokenDetailSkeleton() {
  return (
    <main
      id="main"
      className="flex-1"
      aria-label="Loading token details"
      aria-busy="true"
    >
      <div className="detail-page-width flex h-[164px] flex-col gap-6 py-6">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 rounded-full" />
          <Skeleton className="h-8 w-48" />
        </div>
      </div>
      <PriceHeaderDivider />
      <div className="detail-page-width grid grid-cols-[minmax(0,1fr)_clamp(320px,22.4vw,430px)] items-start gap-10 max-[1400px]:gap-6 max-[980px]:grid-cols-1">
        <section
          className="space-y-6"
          aria-label="Token chart and statistics loading"
          aria-busy="true"
        >
          <Skeleton className="h-[542px] w-full rounded-none" />
          <Skeleton className="h-[1140px] w-full rounded-2xl" />
        </section>
        <aside
          className="space-y-6"
          aria-label="Trading preview loading"
          aria-busy="true"
        >
          <Skeleton className="h-[560px] rounded-3xl" />
          <Skeleton className="h-[356px] rounded-3xl" />
          <Skeleton className="h-[228px] rounded-3xl" />
        </aside>
      </div>
    </main>
  );
}

function UnknownToken({ id }: { id: string }) {
  return (
    <main
      id="main"
      className="page-width flex flex-1 items-center justify-center py-16"
    >
      <Alert className="max-w-xl">
        <SearchX aria-hidden="true" />
        <AlertTitle>Token not found</AlertTitle>
        <AlertDescription className="space-y-4">
          <p>No token with the ID “{id}” exists in this market.</p>
          <Button asChild variant="outline" size="sm">
            <Link href="/">
              <ArrowLeft className="size-3.5" />
              Back to Explore
            </Link>
          </Button>
        </AlertDescription>
      </Alert>
    </main>
  );
}

export function TokenDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawRange = searchParams.get('range');
  const selectedRange = resolveHistoryRange(rawRange);
  const detailQuery = useTokenDetail(id);
  const historyQuery = useTokenHistory(
    id,
    selectedRange,
    detailQuery.isSuccess,
  );
  const statsQuery = useTokenStats(id, selectedRange, detailQuery.isSuccess);

  useEffect(() => {
    if (!isInvalidHistoryRange(rawRange)) return;
    const next = new URLSearchParams(searchParams.toString());
    next.set('range', selectedRange);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }, [pathname, rawRange, router, searchParams, selectedRange]);

  useEffect(() => {
    if (!detailQuery.data) return;
    document.title = `${detailQuery.data.name} Token Details | TAO`;
    return () => {
      document.title = 'Token Details | TAO';
    };
  }, [detailQuery.data]);

  const selectRange = (range: typeof selectedRange) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set('range', range);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  if (detailQuery.isPending) return <TokenDetailSkeleton />;
  if (
    detailQuery.error instanceof ApiError &&
    detailQuery.error.status === 404
  ) {
    return <UnknownToken id={id} />;
  }
  if (detailQuery.error || !detailQuery.data) {
    return (
      <main
        id="main"
        className="page-width flex flex-1 items-center justify-center py-16"
      >
        <div className="w-full max-w-xl space-y-4">
          <ResourceError
            title="Token details unavailable"
            error={detailQuery.error}
            retry={() => detailQuery.refetch()}
          />
          <Button asChild variant="outline" size="sm">
            <Link href="/">
              <ArrowLeft className="size-3.5" />
              Back to Explore
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  const token = detailQuery.data;
  const cachedHistory = queryClient
    .getQueriesData<HistorySeries>({ queryKey: ['tokens', 'history', id] })
    .findLast((entry) => Boolean(entry[1]))?.[1];
  const cachedStats = queryClient
    .getQueriesData<TokenStats>({ queryKey: ['tokens', 'stats', id] })
    .findLast((entry) => Boolean(entry[1]))?.[1];
  const displayedHistory = historyQuery.data ?? cachedHistory ?? null;
  const displayedStats = statsQuery.data ?? cachedStats ?? null;
  return (
    <main id="main" className="flex-1">
      <PriceHeader token={token} />
      <PriceHeaderDivider />
      <div className="detail-page-width grid grid-cols-[minmax(0,1fr)_clamp(320px,22.4vw,430px)] items-start gap-10 max-[1400px]:gap-6 max-[980px]:grid-cols-1">
        <div className="min-w-0 space-y-6">
          <ChartPanel
            token={token}
            selectedRange={selectedRange}
            displayed={displayedHistory}
            symbol={token.symbol ?? token.id.toUpperCase()}
            isInitialLoading={historyQuery.isPending && !displayedHistory}
            isUpdating={historyQuery.isFetching && Boolean(displayedHistory)}
            error={historyQuery.error}
            onRangeChange={selectRange}
            onRetry={() => historyQuery.refetch()}
          />
          <StatsSections
            token={token}
            selectedRange={selectedRange}
            displayed={displayedStats}
            isInitialLoading={statsQuery.isPending && !displayedStats}
            isUpdating={statsQuery.isFetching && Boolean(displayedStats)}
            error={statsQuery.error}
            onRetry={() => statsQuery.refetch()}
          />
        </div>
        <TradingRail token={token} stats={displayedStats} />
      </div>
    </main>
  );
}
