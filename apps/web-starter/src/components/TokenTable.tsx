'use client';

import { memo, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ArrowUpRight,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { TokenListItem } from '@/lib/api/contracts';
import {
  formatCurrencyCompact,
  formatDecimal,
  formatInteger,
  formatPrice,
} from '@/lib/format';
import { sortTokens, type SortDirection, type SortKey } from '@/lib/market';
import { Movement } from './Movement';

type TokenTableProps = {
  tokens: readonly TokenListItem[];
  sortKey: SortKey;
  direction: SortDirection;
  onSort: (key: SortKey) => void;
};

const columns: ReadonlyArray<{
  key: SortKey;
  label: string;
  width: string;
}> = [
  { key: 'marketCap', label: 'Market cap', width: '140px' },
  { key: 'price', label: 'Price', width: '100px' },
  { key: 'changePercent24h', label: 'Price 24H', width: '112px' },
  { key: 'changePercent7d', label: 'Price 7D', width: '112px' },
  { key: 'changePercent30d', label: 'Price 1M', width: '112px' },
  { key: 'netVolume24h', label: '24H Net Volume', width: '132px' },
  { key: 'buyVolume24h', label: 'Buy Volume', width: '124px' },
  { key: 'sellVolume24h', label: 'Sell Volume', width: '124px' },
  { key: 'transactions24h', label: 'Transactions', width: '120px' },
  { key: 'emissionsPerDay', label: 'Emissions', width: '110px' },
];

function SortIcon({
  active,
  direction,
}: {
  active: boolean;
  direction: SortDirection;
}) {
  if (!active) return <ArrowUpDown className="size-3.5 opacity-35" />;
  return direction === 'asc' ? (
    <ArrowUp className="size-3.5" />
  ) : (
    <ArrowDown className="size-3.5" />
  );
}

function Emissions({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="inline-flex items-center gap-0.5 text-positive tabular">
      <ArrowUpRight className="size-3" aria-hidden="true" />
      {formatDecimal(value)}
      <span className="sr-only">TAO per day</span>
    </span>
  );
}

const TokenRow = memo(function TokenRow({ token }: { token: TokenListItem }) {
  const initial = token.symbol?.slice(0, 1) ?? token.name.slice(0, 1);

  return (
    <TableRow className="group h-14 border-border/80 hover:bg-accent/25">
      <TableCell className="sticky left-0 z-10 w-[190px] bg-background px-4 group-hover:bg-[#121018]">
        <Link
          href={`/tokens/${encodeURIComponent(token.id)}`}
          prefetch={false}
          className="flex min-w-0 items-center gap-3 rounded-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <span
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-foreground"
            aria-hidden="true"
          >
            {initial}
          </span>
          <span className="min-w-0 truncate">
            {token.name}{' '}
            <span className="font-normal text-muted-foreground">
              • {token.subnet}
            </span>
          </span>
        </Link>
      </TableCell>
      <TableCell className="font-medium tabular">
        {formatCurrencyCompact(token.marketCap)}
      </TableCell>
      <TableCell className="text-muted-foreground tabular">
        {formatPrice(token.price)}
      </TableCell>
      <TableCell>
        <Movement value={token.changePercent24h} variant="table" />
      </TableCell>
      <TableCell>
        <Movement value={token.changePercent7d} variant="table" />
      </TableCell>
      <TableCell>
        <Movement value={token.changePercent30d} variant="table" />
      </TableCell>
      <TableCell className="text-muted-foreground tabular">
        {formatCurrencyCompact(token.netVolume24h)}
      </TableCell>
      <TableCell className="text-muted-foreground tabular">
        {formatCurrencyCompact(token.buyVolume24h)}
      </TableCell>
      <TableCell className="text-muted-foreground tabular">
        {formatCurrencyCompact(token.sellVolume24h)}
      </TableCell>
      <TableCell className="text-muted-foreground tabular">
        {formatInteger(token.transactions24h)}
      </TableCell>
      <TableCell>
        <Emissions value={token.emissionsPerDay} />
      </TableCell>
      <TableCell className="sticky right-0 z-10 w-[142px] bg-background px-3 group-hover:bg-[#121018]">
        <div className="flex justify-end gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            disabled
            aria-label={`Swap ${token.name} preview`}
          >
            Swap
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled
            aria-label={`More actions for ${token.name}`}
          >
            <MoreHorizontal />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

export function TokenTable({
  tokens,
  sortKey,
  direction,
  onSort,
}: TokenTableProps) {
  const sorted = useMemo(
    () => sortTokens(tokens, sortKey, direction),
    [tokens, sortKey, direction],
  );

  return (
    <Table
      className="min-w-[1516px] table-fixed text-sm"
      containerClassName="thin-scrollbar rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      containerProps={{
        role: 'region',
        'aria-label': 'Token markets table',
        tabIndex: 0,
      }}
    >
      <TableCaption className="sr-only">
        TAO subnet markets. Activate a column heading to change the sort order.
      </TableCaption>
      <colgroup>
        <col style={{ width: '190px' }} />
        {columns.map((column) => (
          <col key={column.key} style={{ width: column.width }} />
        ))}
        <col style={{ width: '142px' }} />
      </colgroup>
      <TableHeader>
        <TableRow className="h-11 border-0 bg-card hover:bg-card">
          <TableHead className="sticky left-0 top-0 z-30 rounded-l-xl bg-card px-4 text-muted-foreground">
            Name
          </TableHead>
          {columns.map((column) => (
            <TableHead
              key={column.key}
              className="sticky top-0 z-20 bg-card px-2"
              aria-sort={
                sortKey === column.key
                  ? direction === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : 'none'
              }
            >
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="-ml-2 h-8 gap-2 px-2 text-muted-foreground hover:text-foreground"
                onClick={() => onSort(column.key)}
              >
                <SortIcon
                  active={sortKey === column.key}
                  direction={direction}
                />
                {column.label}
              </Button>
            </TableHead>
          ))}
          <TableHead className="sticky right-0 top-0 z-30 rounded-r-xl bg-card px-3 text-right text-muted-foreground">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((token) => (
          <TokenRow key={token.id} token={token} />
        ))}
      </TableBody>
    </Table>
  );
}

export function TokenTableSkeleton() {
  return (
    <div
      aria-label="Token markets loading"
      className="overflow-hidden rounded-xl"
    >
      <div className="h-11 bg-card" />
      {Array.from({ length: 10 }, (_, index) => (
        <div
          key={index}
          className="flex h-14 items-center gap-10 border-b px-4"
        >
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}
