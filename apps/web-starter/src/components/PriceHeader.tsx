import Link from 'next/link';
import { ChevronLeft, Star } from 'lucide-react';
import type { TokenDetail } from '@/lib/api/contracts';
import { formatPrice, formatUpdated } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Movement } from './Movement';

export function PriceHeader({ token }: { token: TokenDetail }) {
  const symbol = token.symbol ?? token.id.toUpperCase();
  return (
    <section aria-labelledby="token-title" className="border-b pb-5">
      <nav aria-label="Breadcrumb" className="mb-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground focus-visible:rounded focus-visible:outline-2 focus-visible:outline-ring"
        >
          <ChevronLeft className="size-3.5" aria-hidden="true" />
          Explore tokens
        </Link>
        <span className="mx-2 text-muted-foreground" aria-hidden="true">
          /
        </span>
        <span className="text-xs text-muted-foreground">{token.subnet}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground"
            aria-hidden="true"
          >
            {token.name.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <h1 id="token-title" className="truncate text-xl font-semibold">
              {token.name}
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {symbol} <span aria-hidden="true">•</span> {token.subnet}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            <Star className="size-3.5" aria-hidden="true" />
            Add to watchlist
          </Button>
          <Badge variant="outline">USD</Badge>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-x-4 gap-y-2">
        <p className="tabular text-[34px] font-medium leading-none tracking-tight">
          {formatPrice(token.price)}
        </p>
        <div className="flex items-center gap-2 text-sm">
          <Movement value={token.changePercent24h} />
          <span className="text-muted-foreground">24H</span>
        </div>
        <p className="w-full text-[11px] text-muted-foreground">
          {formatUpdated(token.lastUpdated)}
        </p>
      </div>
    </section>
  );
}
