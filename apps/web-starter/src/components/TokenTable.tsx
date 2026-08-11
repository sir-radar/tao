'use client';

import {
  memo,
  useCallback,
  useMemo,
  useState,
  type KeyboardEvent,
} from 'react';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowDownUp,
  ArrowUp,
  MoreHorizontal,
  Star,
  TriangleAlert,
} from 'lucide-react';
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
  formatIntegerUngrouped,
  formatPrice,
} from '@/lib/format';
import { sortTokens, type SortDirection, type SortKey } from '@/lib/market';
import { Movement } from './Movement';
import { TrendArrowIcon } from './TrendArrowIcon';

type TokenTableProps = {
  tokens: readonly TokenListItem[];
  sortKey: SortKey;
  direction: SortDirection;
  onSort: (key: SortKey) => void;
};

function handleScrollKeys(event: KeyboardEvent<HTMLDivElement>) {
  if (event.target !== event.currentTarget) return;
  const region = event.currentTarget;
  if (region.scrollWidth <= region.clientWidth) return;
  const step = Math.max(160, Math.floor(region.clientWidth * 0.7));
  let next: number | null = null;
  if (event.key === 'ArrowRight' || event.key === 'PageDown')
    next = region.scrollLeft + step;
  if (event.key === 'ArrowLeft' || event.key === 'PageUp')
    next = region.scrollLeft - step;
  if (event.key === 'Home') next = 0;
  if (event.key === 'End') next = region.scrollWidth;
  if (next === null) return;
  event.preventDefault();
  region.scrollLeft = Math.max(
    0,
    Math.min(next, region.scrollWidth - region.clientWidth),
  );
}

const columns: ReadonlyArray<{
  key: SortKey;
  label: string;
  visibleLabel?: string;
  width: string;
}> = [
  { key: 'marketCap', label: 'Market cap', width: '128px' },
  { key: 'price', label: 'Price', width: '122.222px' },
  {
    key: 'changePercent24h',
    label: 'Price 24H',
    width: '122.222px',
  },
  { key: 'changePercent7d', label: 'Price 7D', width: '122.222px' },
  { key: 'changePercent30d', label: 'Price 1M', width: '122.222px' },
  {
    key: 'netVolume24h',
    label: '24H Net Volume',
    visibleLabel: '24H Net Vo…',
    width: '122.222px',
  },
  { key: 'buyVolume24h', label: 'Buy Volume', width: '122.222px' },
  { key: 'sellVolume24h', label: 'Sell Volume', width: '122.222px' },
  {
    key: 'transactions24h',
    label: 'Transactions',
    width: '122.222px',
  },
  { key: 'emissionsPerDay', label: 'Emissions', width: '122.222px' },
];

function SortIcon({
  active,
  direction,
}: {
  active: boolean;
  direction: SortDirection;
}) {
  if (!active) return null;
  return direction === 'asc' ? (
    <ArrowUp className="size-4" aria-hidden="true" />
  ) : (
    <ArrowDown className="size-4" aria-hidden="true" />
  );
}

function Emissions({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="inline-flex items-center gap-0.5 text-positive tabular">
      <TrendArrowIcon direction="up" />
      {formatDecimal(value)}
      <span className="sr-only">TAO per day</span>
    </span>
  );
}

function SwapPreview({ tokenName }: { tokenName: string }) {
  return (
    <button
      type="button"
      disabled
      className="ml-auto flex h-9 w-24 items-center justify-center gap-2 rounded-[14px] bg-secondary py-2 pl-2 pr-4 text-sm font-medium text-foreground disabled:opacity-100"
      aria-label={`Swap ${tokenName} preview`}
    >
      <span className="flex h-4 w-7 items-center" aria-hidden="true">
        <span className="relative z-10 flex size-4 items-center justify-center rounded-full border border-black/5 bg-white text-[9px] font-semibold text-black">
          τ
        </span>
        <span className="-ml-1 flex size-4 items-center justify-center rounded-full border-2 border-secondary bg-[#3e73c4] text-[8px] font-semibold text-white">
          $
        </span>
      </span>
      Swap
    </button>
  );
}

function RowMenu({ tokenName }: { tokenName: string }) {
  return (
    <div
      role="menu"
      aria-label={`Actions for ${tokenName}`}
      className="absolute right-[-6px] top-[46px] z-50 h-[112px] w-[199px] rounded-lg border border-white/20 bg-card p-1 text-sm font-normal text-foreground shadow-md animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="flex flex-col p-1">
        <span
          role="menuitem"
          aria-disabled="true"
          className="flex h-8 items-center gap-2 rounded-sm px-2"
        >
          <Star className="size-4" aria-hidden="true" />
          Add to watchlist
        </span>
        <span
          role="menuitem"
          aria-disabled="true"
          className="flex h-8 items-center gap-2 rounded-sm px-2"
        >
          <ArrowDownUp className="size-4" aria-hidden="true" />
          Trade subnet
        </span>
        <span
          role="menuitem"
          aria-disabled="true"
          className="flex h-8 items-center gap-2 rounded-sm px-2 text-negative"
        >
          <TriangleAlert className="size-4" aria-hidden="true" />
          Report issue
        </span>
      </div>
    </div>
  );
}

const TokenRow = memo(function TokenRow({
  token,
  menuOpen,
  onToggleMenu,
}: {
  token: TokenListItem;
  menuOpen: boolean;
  onToggleMenu: (id: string) => void;
}) {
  const initial = token.symbol?.slice(0, 1) ?? token.name.slice(0, 1);

  return (
    <TableRow className="group h-14 border-white/8 bg-background transition-colors hover:bg-[#121018]">
      <TableCell className="sticky left-0 z-20 h-14 w-[180px] border-r border-white/8 bg-background px-4 py-0 group-hover:bg-[#121018]">
        <Link
          href={`/tokens/${encodeURIComponent(token.id)}`}
          prefetch={false}
          className="flex min-w-0 items-center gap-3 rounded-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <span
            className="flex size-6 shrink-0 items-center justify-center rounded-full border border-white/8 bg-secondary text-[10px] font-semibold text-foreground"
            aria-hidden="true"
          >
            {initial}
          </span>
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-foreground">{token.name}</span>
            <span
              className="size-1 shrink-0 rounded-full bg-white/20"
              aria-hidden="true"
            />
            <span className="shrink-0 font-normal text-muted-foreground">
              {token.subnet}
            </span>
          </span>
        </Link>
      </TableCell>
      <TableCell className="px-4 text-right font-medium tabular">
        {formatCurrencyCompact(token.marketCap)}
      </TableCell>
      <TableCell className="px-4 text-right text-muted-foreground tabular">
        {formatPrice(token.price)}
      </TableCell>
      <TableCell className="px-4 text-right">
        <Movement value={token.changePercent24h} variant="table" />
      </TableCell>
      <TableCell className="px-4 text-right">
        <Movement value={token.changePercent7d} variant="table" />
      </TableCell>
      <TableCell className="px-4 text-right">
        <Movement value={token.changePercent30d} variant="table" />
      </TableCell>
      <TableCell className="px-4 text-right text-muted-foreground tabular">
        {formatCurrencyCompact(token.netVolume24h)}
      </TableCell>
      <TableCell className="px-4 text-right text-muted-foreground tabular">
        {formatCurrencyCompact(token.buyVolume24h)}
      </TableCell>
      <TableCell className="px-4 text-right text-muted-foreground tabular">
        {formatCurrencyCompact(token.sellVolume24h)}
      </TableCell>
      <TableCell className="px-4 text-right text-muted-foreground tabular">
        {formatIntegerUngrouped(token.transactions24h)}
      </TableCell>
      <TableCell className="px-4 text-right">
        <Emissions value={token.emissionsPerDay} />
      </TableCell>
      <TableCell className="h-14 w-[140px] px-4 py-0">
        <SwapPreview tokenName={token.name} />
      </TableCell>
      <TableCell className="sticky right-0 z-30 h-14 w-[52px] border-l border-white/8 bg-background px-4 py-0 group-hover:bg-[#121018]">
        <div className="relative flex h-full w-5 items-center justify-center">
          <button
            type="button"
            className={`flex size-9 shrink-0 items-center justify-center rounded-[14px] text-foreground transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-ring ${
              menuOpen ? 'bg-secondary' : ''
            }`}
            aria-label={`More actions for ${token.name}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => onToggleMenu(token.id)}
            onKeyDown={(event) => {
              if (event.key === 'Escape' && menuOpen) onToggleMenu(token.id);
            }}
          >
            <MoreHorizontal className="size-4" aria-hidden="true" />
          </button>
          {menuOpen && <RowMenu tokenName={token.name} />}
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
  const [openTokenId, setOpenTokenId] = useState<string | null>(null);
  const handleToggleMenu = useCallback((id: string) => {
    setOpenTokenId((current) => (current === id ? null : id));
  }, []);

  return (
    <Table
      className="min-w-[1600px] table-fixed text-sm"
      containerClassName="table-scrollbar-none h-[604px] rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      containerProps={{
        role: 'region',
        'aria-label': 'Token markets table',
        'aria-describedby': 'token-markets-scroll-help',
        'aria-keyshortcuts': 'ArrowLeft ArrowRight PageUp PageDown Home End',
        tabIndex: 0,
        onKeyDown: handleScrollKeys,
      }}
    >
      <TableCaption id="token-markets-scroll-help" className="sr-only">
        TAO subnet markets. Activate a column heading to change the sort order.
        When this table region is focused, use the left and right arrow keys,
        Page Up, Page Down, Home, or End to scroll horizontally.
      </TableCaption>
      <colgroup>
        <col style={{ width: '180px' }} />
        {columns.map((column) => (
          <col key={column.key} style={{ width: column.width }} />
        ))}
        <col style={{ width: '140px' }} />
        <col style={{ width: '52px' }} />
      </colgroup>
      <TableHeader>
        <TableRow className="h-11 border-0 bg-card hover:bg-card">
          <TableHead className="sticky left-0 top-0 z-40 h-11 rounded-l-xl border-r border-white/8 bg-card px-4 text-muted-foreground">
            Name
          </TableHead>
          {columns.map((column) => {
            const active = sortKey === column.key;
            return (
              <TableHead
                key={column.key}
                className="sticky top-0 z-20 h-11 bg-card p-0"
                aria-sort={
                  active
                    ? direction === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                }
              >
                <button
                  type="button"
                  className={`flex h-11 w-full items-center justify-end gap-2 px-4 font-medium transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring ${
                    active ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                  onClick={() => onSort(column.key)}
                >
                  <SortIcon active={active} direction={direction} />
                  {column.visibleLabel ?? column.label}
                  {column.visibleLabel && (
                    <span className="sr-only">{column.label}</span>
                  )}
                </button>
              </TableHead>
            );
          })}
          <TableHead className="sticky top-0 z-20 h-11 bg-card p-0">
            <span className="sr-only">Swap</span>
          </TableHead>
          <TableHead className="sticky right-0 top-0 z-40 h-11 rounded-r-xl border-l border-white/8 bg-card p-0">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((token) => (
          <TokenRow
            key={token.id}
            token={token}
            menuOpen={openTokenId === token.id}
            onToggleMenu={handleToggleMenu}
          />
        ))}
      </TableBody>
    </Table>
  );
}

export function TokenTableSkeleton() {
  return (
    <div
      aria-label="Token markets loading"
      aria-busy="true"
      className="h-[604px] overflow-hidden rounded-xl"
    >
      <div className="h-11 bg-card" />
      {Array.from({ length: 10 }, (_, index) => (
        <div
          key={index}
          className="flex h-14 items-center gap-10 border-b border-white/8 px-4"
        >
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}
