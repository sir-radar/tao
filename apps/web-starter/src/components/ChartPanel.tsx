import Image from 'next/image';
import type { HistoryRange, HistorySeries } from '@/lib/api/contracts';
import { RANGE_LABELS } from '@/lib/api/contracts';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState, ResourceError } from './ResourceState';
import { PriceChart } from './PriceChart';
import { RangeSelector } from './RangeSelector';

export function ChartPanel({
  selectedRange,
  displayed,
  symbol,
  isInitialLoading,
  isUpdating,
  error,
  onRangeChange,
  onRetry,
}: {
  selectedRange: HistoryRange;
  displayed: HistorySeries | null;
  symbol: string;
  isInitialLoading: boolean;
  isUpdating: boolean;
  error: unknown;
  onRangeChange: (range: HistoryRange) => void;
  onRetry: () => void;
}) {
  const showingRetained = Boolean(
    displayed && displayed.range !== selectedRange,
  );
  return (
    <section
      aria-labelledby="price-history-title"
      aria-busy={isInitialLoading || isUpdating}
      className="min-w-0"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="price-history-title" className="text-sm font-medium">
            Price history
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {displayed
              ? `Showing ${RANGE_LABELS[displayed.range]} in UTC`
              : `${RANGE_LABELS[selectedRange]} in UTC`}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {isUpdating && (
            <Badge variant="secondary" aria-live="polite">
              <Spinner className="size-3" /> Updating to{' '}
              {RANGE_LABELS[selectedRange]}
            </Badge>
          )}
          <RangeSelector value={selectedRange} onValueChange={onRangeChange} />
          <div
            className="flex h-11 items-center rounded-2xl bg-secondary p-1"
            aria-label="Chart type preview"
          >
            <span
              className="flex size-9 items-center justify-center rounded-[14px] bg-card shadow-sm"
              aria-label="Line chart selected"
            >
              <Image
                src="/assets/chart-controls/wave-triangle.svg"
                alt=""
                width={20}
                height={20}
                className="size-5"
                aria-hidden="true"
              />
            </span>
            <span
              className="flex size-9 items-center justify-center text-muted-foreground"
              aria-label="Candlestick chart unavailable"
            >
              <Image
                src="/assets/chart-controls/chart-candle.svg"
                alt=""
                width={20}
                height={20}
                className="size-5 opacity-40"
                aria-hidden="true"
              />
            </span>
          </div>
          <span
            className="flex size-11 items-center justify-center rounded-[14px] bg-secondary text-muted-foreground"
            aria-label="Percentage scale preview"
          >
            <Image
              src="/assets/chart-controls/chart-01.svg"
              alt=""
              width={20}
              height={20}
              className="size-5 opacity-40"
              aria-hidden="true"
            />
          </span>
        </div>
      </div>

      <div className="min-h-[380px] rounded-xl border bg-card/20 px-2 pt-2 max-[1100px]:min-h-[340px]">
        {isInitialLoading ? (
          <div className="flex h-[370px] flex-col justify-between p-5 max-[1100px]:h-[330px]">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-3 w-3/5" />
          </div>
        ) : error && !displayed ? (
          <div className="flex h-[370px] items-center justify-center p-5 max-[1100px]:h-[330px]">
            <ResourceError
              title={`Could not load ${RANGE_LABELS[selectedRange]} history`}
              error={error}
              retry={onRetry}
              className="max-w-xl"
            />
          </div>
        ) : displayed && displayed.points.length > 0 ? (
          <PriceChart
            points={displayed.points}
            range={displayed.range}
            symbol={symbol}
          />
        ) : (
          <div className="flex h-[370px] items-center justify-center p-5 max-[1100px]:h-[330px]">
            <EmptyState
              title="No price history"
              description={`No valid ${RANGE_LABELS[selectedRange]} points were returned for this token.`}
              retry={onRetry}
            />
          </div>
        )}
      </div>

      {Boolean(error) && displayed && (
        <ResourceError
          title={`Could not load ${RANGE_LABELS[selectedRange]}`}
          error={error}
          retry={onRetry}
          className="mt-3"
        />
      )}
      {showingRetained && !Boolean(error) && !isUpdating && (
        <p className="mt-2 text-xs text-muted-foreground" aria-live="polite">
          Showing {RANGE_LABELS[displayed!.range]} while{' '}
          {RANGE_LABELS[selectedRange]} is unavailable.
        </p>
      )}
    </section>
  );
}
