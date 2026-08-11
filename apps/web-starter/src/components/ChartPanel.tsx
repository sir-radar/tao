import Image from 'next/image';
import type {
  HistoryRange,
  HistorySeries,
  TokenDetail,
} from '@/lib/api/contracts';
import { RANGE_LABELS } from '@/lib/api/contracts';
import { formatPrice } from '@/lib/format';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Movement } from './Movement';
import { EmptyState, ResourceError } from './ResourceState';
import { PriceChart } from './PriceChart';
import { RangeSelector } from './RangeSelector';

function FeaturedPrice({ value }: { value: number | null }) {
  const formatted = formatPrice(value);
  const [whole, fraction] = formatted.split('.');
  const hasCurrency = whole.startsWith('$');

  return (
    <p
      className="flex h-12 items-baseline gap-0.5 tabular"
      aria-label={`Current price: ${formatted}`}
    >
      {hasCurrency && (
        <span
          data-slot="price-currency"
          className="h-10 text-[36px] font-[670] leading-10 text-muted-foreground"
          aria-hidden="true"
        >
          $
        </span>
      )}
      <span
        data-slot="price-integer"
        className="h-12 text-[48px] font-[570] leading-12 text-foreground"
        aria-hidden="true"
      >
        {hasCurrency ? whole.slice(1) : whole}
      </span>
      {fraction && (
        <span
          data-slot="price-fraction"
          className="h-10 text-[36px] font-[670] leading-10 text-foreground"
          aria-hidden="true"
        >
          .{fraction}
        </span>
      )}
    </p>
  );
}

export function ChartPanel({
  token,
  selectedRange,
  displayed,
  symbol,
  isInitialLoading,
  isUpdating,
  error,
  onRangeChange,
  onRetry,
}: {
  token: TokenDetail;
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
      className="flex min-w-0 flex-col gap-2"
    >
      <h2 id="price-history-title" className="sr-only">
        Price history
      </h2>
      <div className="flex h-[78px] items-start justify-between gap-6">
        <div className="flex h-[78px] min-w-[106px] flex-col items-start justify-center gap-2">
          <FeaturedPrice value={token.price} />
          <div className="flex h-[22px] items-center gap-0.5 text-base leading-[22px]">
            <Movement value={token.changePercent24h} variant="featured" />
            <span className="font-[570] text-muted-foreground">24H</span>
            {isUpdating && (
              <span
                className="ml-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground"
                aria-live="polite"
              >
                <Spinner className="size-3" /> Updating to{' '}
                {RANGE_LABELS[selectedRange]}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 pt-0 max-[1150px]:gap-2">
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

      <div className="h-[456px] min-w-0 pb-6">
        {isInitialLoading ? (
          <div className="flex h-full flex-col justify-between py-5">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-3 w-3/5" />
          </div>
        ) : error && !displayed ? (
          <div className="flex h-full items-center justify-center p-5">
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
          <div className="flex h-full items-center justify-center p-5">
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
