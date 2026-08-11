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
import { Button } from '@/components/ui/button';
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
    <main id="main" className="page-width flex-1 py-4">
      <h1 className="sr-only">Explore Tokens</h1>
      <MarketSummary />

      <div className="mt-8 flex items-end justify-between gap-6 border-b">
        <nav aria-label="Market views" className="min-w-0 overflow-hidden">
          <ul className="flex h-14 items-stretch gap-8 text-sm font-medium text-muted-foreground max-[1100px]:gap-6">
            {marketViews.map(({ label, icon: Icon, current }) => (
              <li
                key={label}
                className={
                  current
                    ? 'flex shrink-0 items-center gap-2 border-b-2 border-primary text-foreground'
                    : 'flex shrink-0 items-center gap-2'
                }
                aria-current={current ? 'page' : undefined}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-3 pb-2">
          <Button
            variant="secondary"
            size="icon"
            disabled
            aria-label="Market filters preview"
          >
            <SlidersHorizontal />
          </Button>
          <div
            className="flex rounded-xl bg-secondary p-1 text-xs"
            aria-label="Currency display: USD"
          >
            <span className="rounded-lg bg-background px-4 py-2 text-foreground">
              USD
            </span>
            <span className="px-4 py-2 text-muted-foreground">TAO</span>
          </div>
        </div>
      </div>

      <section className="mt-4" aria-labelledby="token-markets-heading">
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
