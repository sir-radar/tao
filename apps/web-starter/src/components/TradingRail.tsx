import Image from 'next/image';
import { CircleDollarSign, SlidersHorizontal, X } from 'lucide-react';
import type { TokenDetail, TokenStats } from '@/lib/api/contracts';
import {
  formatCompact,
  formatCurrencyCompact,
  formatPercent,
  formatPrice,
} from '@/lib/format';

function TokenMark({
  name,
  size = 'default',
}: {
  name: string;
  size?: 'default' | 'large';
}) {
  return (
    <span
      className={
        size === 'large'
          ? 'flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e8ff00] text-sm font-semibold text-[#101014]'
          : 'flex size-8 shrink-0 items-center justify-center rounded-full bg-[#e8ff00] text-xs font-semibold text-[#101014]'
      }
      aria-hidden="true"
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

function SwapTile({
  side,
  token,
  symbol,
}: {
  side: 'Sell' | 'Buy';
  token: TokenDetail;
  symbol: string;
}) {
  const sell = side === 'Sell';
  return (
    <div className="flex h-[156px] flex-col gap-3 rounded-3xl bg-[#201e29] p-5">
      <div className="flex h-[22px] items-center justify-between text-base font-medium leading-[22px]">
        <span>{side}</span>
        {sell && (
          <span className="text-base text-primary">25% · 50% · Max</span>
        )}
      </div>
      <div className="flex h-12 items-center gap-3">
        <input
          aria-label={`${side} amount`}
          value="0"
          readOnly
          className="min-w-0 flex-1 border-0 bg-transparent p-0 text-5xl font-medium leading-none tracking-[-0.03em] tabular text-foreground outline-none disabled:opacity-100"
        />
        <span className="flex h-12 items-center gap-3 rounded-[32px] border border-white/8 bg-card py-2 pl-2 pr-4 text-base font-medium">
          {sell ? (
            <span className="flex size-8 items-center justify-center rounded-full bg-white text-sm font-semibold text-black">
              τ
            </span>
          ) : (
            <TokenMark name={token.name} />
          )}
          {sell ? 'TAO' : symbol}
        </span>
      </div>
      <div className="flex h-[22px] items-center justify-between text-base leading-[22px] text-muted-foreground">
        <span>$0</span>
        <span>
          Balance:{' '}
          <strong className="font-medium text-foreground">
            {sell ? '19.432112' : '0.00'}
          </strong>
        </span>
      </div>
    </div>
  );
}

export function TradingRail({
  token,
  stats,
}: {
  token: TokenDetail;
  stats?: TokenStats | null;
}) {
  const symbol = token.symbol ?? token.id.toUpperCase();
  return (
    <aside aria-label="Trading preview" className="space-y-6">
      <section
        aria-labelledby="swap-preview-title"
        className="h-[560px] space-y-4"
      >
        <div className="grid h-[108px] grid-cols-[24px_minmax(0,1fr)_20px] gap-3 rounded-[16px] bg-[#3d3120] px-4 py-3">
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#3e73c4] text-white">
            <CircleDollarSign className="size-5" aria-hidden="true" />
          </span>
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_88px] grid-rows-[20px_60px] gap-x-2 min-[1850px]:grid-cols-[206px_95px] min-[1850px]:gap-x-3">
            <h2
              id="swap-preview-title"
              className="col-start-1 row-start-1 text-sm font-medium leading-5"
            >
              Swap with USDC!
            </h2>
            <p className="col-span-2 col-start-1 row-start-2 max-w-[206px] text-sm leading-5 text-foreground min-[1850px]:col-span-1">
              <span className="block">TAO.com supports swaps with</span>
              <span className="block">Bittensor &amp; popular ERC20</span>
              <span className="block">tokens!</span>
            </p>
            <button
              type="button"
              disabled
              className="col-start-2 row-start-1 flex h-6 w-[88px] items-center justify-center self-start rounded-full bg-[#12111a] text-[11px] font-medium text-foreground disabled:pointer-events-none disabled:opacity-100 min-[1850px]:row-span-2 min-[1850px]:w-[95px] min-[1850px]:self-center min-[1850px]:text-xs"
            >
              Connect ETH
            </button>
            <span className="sr-only">Preview only</span>
          </div>
          <X
            className="size-5 shrink-0 self-center text-muted-foreground"
            aria-hidden="true"
          />
        </div>

        <div className="flex h-9 items-center justify-between">
          <div className="flex h-9 items-center gap-1">
            <span className="flex h-9 items-center rounded-[14px] bg-[#2d2546] px-4 text-sm font-medium text-primary">
              Swap
            </span>
            <span className="flex h-9 items-center gap-2 rounded-[14px] border border-white/8 bg-card px-4 text-sm font-medium">
              Limit Order
              <small className="rounded-md bg-[#2d2546] px-1 text-[10px] text-primary">
                New
              </small>
            </span>
          </div>
          <span className="flex size-9 items-center justify-center rounded-[14px] border border-white/8 bg-card">
            <SlidersHorizontal className="size-4" aria-hidden="true" />
          </span>
        </div>

        <fieldset
          disabled
          aria-describedby="trading-preview-description"
          className="w-full min-w-0 space-y-4"
        >
          <p id="trading-preview-description" className="sr-only">
            These controls are visual only and cannot submit a transaction.
          </p>
          <div className="relative flex h-80 flex-col gap-2">
            <SwapTile side="Sell" token={token} symbol={symbol} />
            <span className="absolute left-1/2 top-1/2 z-10 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[4px] border-background bg-secondary shadow-[0_8px_18px_rgba(0,0,0,0.35)]">
              <Image
                src="/assets/swap/arrow-down.svg"
                alt=""
                width={11}
                height={11}
                aria-hidden="true"
              />
            </span>
            <SwapTile side="Buy" token={token} symbol={symbol} />
          </div>
          <button
            type="button"
            disabled
            className="flex h-12 w-full items-center justify-center rounded-2xl bg-secondary text-sm font-medium text-muted-foreground disabled:opacity-100"
          >
            Enter an amount
          </button>
        </fieldset>
      </section>

      <section
        aria-labelledby="position-title"
        className="flex h-[356px] flex-col gap-4 rounded-3xl bg-card p-6"
      >
        <h2 id="position-title" className="h-8 text-xl font-medium leading-8">
          Position
        </h2>
        <div className="flex h-[54px] items-center justify-between gap-4">
          <span className="flex min-w-0 items-center gap-3">
            <TokenMark name={token.name} size="large" />
            <span className="min-w-0">
              <strong className="block truncate text-base font-medium leading-[22px]">
                {token.name}
              </strong>
              <small className="block truncate text-sm leading-5 text-muted-foreground tabular">
                90.009354 {symbol}
              </small>
            </span>
          </span>
          <span className="text-right">
            <strong className="block text-xl font-medium leading-8 tabular">
              $2,450.90
            </strong>
            <small
              className="flex items-center justify-end text-sm leading-[22px] text-positive"
              aria-label="Up 11.27% over 24 hours"
            >
              <Image
                src="/assets/trading/arrow-up-01.svg"
                alt=""
                width={20}
                height={20}
                aria-hidden="true"
              />
              <span>11.27% 24H</span>
            </small>
          </span>
        </div>
        <dl className="h-[190px] text-sm">
          {[
            ['Average cost', formatPrice(token.price)],
            [
              'Token APY',
              formatPercent(stats?.financials.averageStakeApy ?? null, false),
            ],
            ['Earned tokens', `35.999212 ${symbol}`],
            ['Unrealized return', '+$450.90'],
            ['Realized return', '—'],
          ].map(([label, value], index) => (
            <div
              key={label}
              className="flex h-[38px] items-center justify-between gap-4"
            >
              <dt className="text-muted-foreground">{label}</dt>
              <dd
                className={
                  index === 2 || index === 3
                    ? 'text-positive tabular'
                    : 'tabular'
                }
              >
                {index === 2 && (
                  <Image
                    src="/assets/trading/arrow-up-01.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="inline-block align-[-5px]"
                    aria-hidden="true"
                  />
                )}
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        aria-labelledby="orders-title"
        className="flex h-[228px] flex-col gap-4 rounded-3xl bg-card p-6"
      >
        <h2 id="orders-title" className="h-8 text-xl font-medium leading-8">
          Orders
        </h2>
        <div className="h-[132px]">
          {[
            {
              side: 'Sell',
              detail: 'Limit @ 0.00752',
              status: 'Pending',
            },
            {
              side: 'Buy',
              detail: 'DCA, daily @ 3:45 PM',
              status: 'In progress',
            },
          ].map((order) => (
            <div
              key={order.side}
              className="flex h-[66px] items-center justify-between gap-4 border-b border-white/8 last:border-0"
            >
              <span className="flex min-w-0 items-center gap-3">
                <TokenMark name={token.name} size="large" />
                <span className="min-w-0">
                  <strong
                    className={
                      order.side === 'Buy' ? 'text-positive' : 'text-negative'
                    }
                  >
                    {order.side}
                  </strong>{' '}
                  {token.name}
                  <small className="block truncate text-xs leading-5 text-muted-foreground">
                    {order.detail}
                  </small>
                </span>
              </span>
              <span className="shrink-0 text-right text-sm tabular">
                {formatCompact(100)} {symbol}
                <small className="block text-xs leading-5 text-muted-foreground">
                  {order.status}
                </small>
              </span>
            </div>
          ))}
        </div>
        <span className="sr-only">
          Position and order values are non-functional preview content. Current
          market cap is {formatCurrencyCompact(token.marketCap)}.
        </span>
      </section>
    </aside>
  );
}
