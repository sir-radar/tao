import { Suspense } from 'react';
import Image from 'next/image';
import { MarketSummary } from './MarketSummary';
import { TokenMarkets } from './TokenMarkets';
import { TokenTableSkeleton } from './TokenTable';

const marketViews: ReadonlyArray<{
  label: string;
  iconSrc: string;
  widthClass: string;
  current?: boolean;
}> = [
  {
    label: 'Top',
    iconSrc: '/assets/market-views/champion.svg',
    widthClass: 'w-[70px]',
    current: true,
  },
  {
    label: 'Watchlist',
    iconSrc: '/assets/market-views/star.svg',
    widthClass: 'w-[117px]',
  },
  {
    label: 'Popular',
    iconSrc: '/assets/market-views/chart-01.svg',
    widthClass: 'w-[104px]',
  },
  {
    label: 'Gainers',
    iconSrc: '/assets/market-views/chart-up.svg',
    widthClass: 'w-[103px]',
  },
  {
    label: 'Losers',
    iconSrc: '/assets/market-views/chart-down.svg',
    widthClass: 'w-[93px]',
  },
  {
    label: 'All Subnets',
    iconSrc: '/assets/market-views/profile.svg',
    widthClass: 'w-[132px]',
  },
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
          <ul className="flex h-[46px] items-stretch gap-4 text-lg font-[570] leading-[26px] text-muted-foreground">
            {marketViews.map(({ label, iconSrc, widthClass, current }) => (
              <li
                key={label}
                className={`flex h-[46px] shrink-0 items-center justify-center gap-2 whitespace-nowrap px-2 py-2.5 ${widthClass} ${
                  current ? 'border-b-[3px] border-primary text-foreground' : ''
                }`}
                aria-current={current ? 'page' : undefined}
              >
                <Image
                  src={iconSrc}
                  alt=""
                  width={16}
                  height={16}
                  className="size-4 shrink-0"
                  aria-hidden="true"
                />
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
            <Image
              src="/assets/market-controls/settings-2.svg"
              alt=""
              width={16}
              height={16}
              className="size-4"
              aria-hidden="true"
            />
          </button>
          <div
            className="flex h-11 w-[127px] rounded-2xl bg-secondary p-1 text-sm font-[570] leading-5"
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
