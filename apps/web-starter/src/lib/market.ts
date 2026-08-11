import type { TokenListItem } from './api/contracts';

export const SORT_KEYS = [
  'marketCap',
  'price',
  'changePercent24h',
  'changePercent7d',
  'changePercent30d',
  'netVolume24h',
  'buyVolume24h',
  'sellVolume24h',
  'transactions24h',
  'emissionsPerDay',
] as const;
export type SortKey = (typeof SORT_KEYS)[number];
export type SortDirection = 'asc' | 'desc';

export const DEFAULT_SORT_KEY: SortKey = 'marketCap';
export const DEFAULT_SORT_DIRECTION: SortDirection = 'desc';

export function isSortKey(value: string | null): value is SortKey {
  return value !== null && (SORT_KEYS as readonly string[]).includes(value);
}
export function isSortDirection(value: string | null): value is SortDirection {
  return value === 'asc' || value === 'desc';
}

export function resolveSortState(
  sort: string | null,
  direction: string | null,
) {
  return {
    sortKey: isSortKey(sort) ? sort : DEFAULT_SORT_KEY,
    direction: isSortDirection(direction) ? direction : DEFAULT_SORT_DIRECTION,
  };
}

export function nextSortDirection(
  currentKey: SortKey,
  currentDirection: SortDirection,
  nextKey: SortKey,
): SortDirection {
  if (nextKey !== currentKey) return 'desc';
  return currentDirection === 'desc' ? 'asc' : 'desc';
}

export function sortTokens(
  tokens: readonly TokenListItem[],
  key: SortKey,
  direction: SortDirection,
) {
  const factor = direction === 'asc' ? 1 : -1;
  return [...tokens].sort((left, right) => {
    const a = left[key];
    const b = right[key];
    if (a === null && b === null) return left.id.localeCompare(right.id);
    if (a === null) return 1;
    if (b === null) return -1;
    const comparison = a === b ? 0 : a < b ? -1 : 1;
    return comparison === 0
      ? left.id.localeCompare(right.id)
      : comparison * factor;
  });
}

export function percentageShare(
  value: number | null,
  total: number | null,
): number | null {
  if (value === null || total === null || total <= 0) return null;
  return Math.min(100, Math.max(0, (value / total) * 100));
}
