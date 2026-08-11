import { ArrowDown, Info, WalletCards } from 'lucide-react';
import type { TokenDetail } from '@/lib/api/contracts';
import { formatPrice } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

function TokenMark({ name }: { name: string }) {
  return (
    <span
      className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
      aria-hidden="true"
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

export function TradingRail({ token }: { token: TokenDetail }) {
  const symbol = token.symbol ?? token.id.toUpperCase();
  return (
    <aside aria-label="Trading preview" className="space-y-4">
      <Card className="bg-card">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Swap preview</CardTitle>
            <Badge variant="secondary">Preview only</Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Trading is disabled in this take-home implementation.
          </p>
        </CardHeader>
        <CardContent>
          <fieldset
            disabled
            aria-describedby="trading-preview-description"
            className="space-y-3"
          >
            <p id="trading-preview-description" className="sr-only">
              These controls are visual only and cannot submit a transaction.
            </p>
            <div className="flex rounded-lg bg-secondary p-1">
              <Button type="button" size="sm" className="flex-1" disabled>
                Swap
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="flex-1"
                disabled
              >
                Limit order
              </Button>
            </div>

            <div className="rounded-xl border bg-background/45 p-3">
              <div className="flex items-center justify-between text-xs">
                <span>Sell</span>
                <span className="text-primary">25% · 50% · Max</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Input
                  aria-label="Sell amount"
                  value="0"
                  readOnly
                  className="h-11 border-0 bg-transparent px-0 text-2xl"
                />
                <Badge variant="secondary">TAO</Badge>
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Balance: 0 TAO
              </p>
            </div>

            <div className="relative -my-5 flex justify-center">
              <span className="z-10 flex size-8 items-center justify-center rounded-full border bg-card">
                <ArrowDown className="size-3.5" aria-hidden="true" />
              </span>
            </div>

            <div className="rounded-xl border bg-background/45 p-3">
              <div className="flex items-center justify-between text-xs">
                <span>Buy</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Input
                  aria-label="Buy amount"
                  value="0"
                  readOnly
                  className="h-11 border-0 bg-transparent px-0 text-2xl"
                />
                <span className="inline-flex items-center gap-2 text-xs font-medium">
                  <TokenMark name={token.name} /> {symbol}
                </span>
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Balance: 0 {symbol}
              </p>
            </div>
            <Button type="button" className="w-full" disabled>
              <WalletCards className="size-4" aria-hidden="true" />
              Enter an amount
            </Button>
          </fieldset>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Position</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-xs font-medium">
              <TokenMark name={token.name} />
              {token.name}
            </span>
            <span className="tabular text-sm font-medium">$2,450.90</span>
          </div>
          <dl className="space-y-2 text-[11px]">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Average cost</dt>
              <dd>{formatPrice(token.price)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Token APY</dt>
              <dd>—</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Unrealized return</dt>
              <dd className="text-positive">+$450.90</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Realized return</dt>
              <dd>—</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { side: 'Sell', detail: 'Limit @ 0.00752', status: 'Pending' },
            {
              side: 'Buy',
              detail: 'DCA, daily @ 3:45 PM',
              status: 'In progress',
            },
          ].map((order, index) => (
            <div key={order.side}>
              {index > 0 && <Separator className="mb-3" />}
              <div className="flex items-center justify-between gap-3 text-[11px]">
                <span className="flex items-center gap-2">
                  <TokenMark name={token.name} />
                  <span>
                    <strong
                      className={
                        order.side === 'Buy' ? 'text-positive' : 'text-negative'
                      }
                    >
                      {order.side}
                    </strong>{' '}
                    {token.name}
                    <small className="block text-muted-foreground">
                      {order.detail}
                    </small>
                  </span>
                </span>
                <span className="text-right">
                  100.00 {symbol}
                  <small className="block text-muted-foreground">
                    {order.status}
                  </small>
                </span>
              </div>
            </div>
          ))}
          <p className="flex items-center gap-1.5 pt-1 text-[10px] text-muted-foreground">
            <Info className="size-3" aria-hidden="true" /> Example data; no
            order actions are available.
          </p>
        </CardContent>
      </Card>
    </aside>
  );
}
