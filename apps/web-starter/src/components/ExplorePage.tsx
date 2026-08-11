import { Suspense } from 'react';
import {
  BarChart3,
  Network,
  SlidersHorizontal,
  Star,
  TrendingDown,
  TrendingUp,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import { MarketSummary } from './MarketSummary';
import { TokenMarkets } from './TokenMarkets';
import { TokenTableSkeleton } from './TokenTable';

const marketViews: ReadonlyArray<{
  label: string;
  icon: LucideIcon;
  current?: boolean;
}> = [
  { label: 'Top', icon: Trophy, current: true },
  { label: 'Watchlist', icon: Star },
  { label: 'Popular', icon: BarChart3 },
  { label: 'Gainers', icon: TrendingUp },
  { label: 'Losers', icon: TrendingDown },
  { label: 'All Subnets', icon: Network },
];

export function ExplorePage() {
  return (
    <main id="main" className="page-width flex-1">
      <h1 className="sr-only">Explore Tokens</h1>
      <MarketSummary />

      <div className="flex h-[78px] items-center justify-between gap-2 py-4">
        <nav
          aria-label="Market views"
          className="thin-scrollbar min-w-0 overflow-x-auto"
          tabIndex={0}
        >
          <ul className="flex h-[46px] items-stretch gap-4 text-lg font-medium text-muted-foreground">
            {marketViews.map(({ label, icon: Icon, current }) => (
              <li
                key={label}
                className={`flex h-[46px] shrink-0 items-center justify-center gap-2 px-2 py-2.5 ${
                  current ? 'border-b-[3px] border-primary text-foreground' : ''
                }`}
                aria-current={current ? 'page' : undefined}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex h-11 shrink-0 items-center justify-end gap-4">
          <button
            type="button"
            disabled
            className="flex size-11 items-center justify-center rounded-[14px] bg-secondary text-foreground disabled:opacity-100"
            aria-label="Market filters preview"
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" />
          </button>
          <div
            className="flex h-11 w-[127px] rounded-2xl bg-secondary p-1 text-sm font-medium"
            aria-label="Currency display: USD"
          >
            <span className="flex h-9 w-[60px] items-center justify-center rounded-[14px] bg-card text-foreground shadow-sm">
              USD
            </span>
            <span className="flex h-9 w-[59px] items-center justify-center text-muted-foreground">
              TAO
            </span>
          </div>
        </div>
      </div>

      <section aria-labelledby="token-markets-heading">
        <h2 id="token-markets-heading" className="sr-only">
          Token markets
        </h2>
        <Suspense fallback={<TokenTableSkeleton />}>
          <TokenMarkets />
        </Suspense>
      </section>
    </main>
  );
}
