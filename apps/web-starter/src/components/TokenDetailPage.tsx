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

export function TokenDetailSkeleton() {
  return (
    <main
      id="main"
      className="page-width flex-1 py-5"
      aria-label="Loading token details"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_clamp(320px,24vw,400px)] gap-6 max-[1100px]:gap-4">
        <div className="space-y-5">
          <div className="space-y-4 border-b pb-5">
            <Skeleton className="h-3 w-32" />
            <div className="flex items-center gap-3">
              <Skeleton className="size-11 rounded-full" />
              <Skeleton className="h-7 w-44" />
            </div>
            <Skeleton className="h-9 w-36" />
          </div>
          <Skeleton className="h-[420px] w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-[410px]" />
          <Skeleton className="h-52" />
          <Skeleton className="h-44" />
        </div>
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
    <main id="main" className="page-width flex-1 py-5">
      <div className="grid grid-cols-[minmax(0,1fr)_clamp(320px,24vw,400px)] items-start gap-6 max-[1100px]:gap-4">
        <div className="min-w-0 space-y-5">
          <PriceHeader token={token} />
          <ChartPanel
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
        <TradingRail token={token} />
      </div>
    </main>
  );
}
