import type { TokenListItem } from "./api/contracts";

export const SORT_KEYS = ["marketCap", "price", "changePercent24h", "changePercent7d", "changePercent30d", "netVolume24h", "buyVolume24h", "sellVolume24h", "transactions24h", "emissionsPerDay"] as const;
export type SortKey = (typeof SORT_KEYS)[number];
export type SortDirection = "asc" | "desc";

export function isSortKey(value: string | null): value is SortKey { return value !== null && (SORT_KEYS as readonly string[]).includes(value); }
export function isSortDirection(value: string | null): value is SortDirection { return value === "asc" || value === "desc"; }

export function sortTokens(tokens: readonly TokenListItem[], key: SortKey, direction: SortDirection) {
  const factor = direction === "asc" ? 1 : -1;
  return [...tokens].sort((left, right) => {
    const a = left[key]; const b = right[key];
    if (a === null && b === null) return left.id.localeCompare(right.id);
    if (a === null) return 1; if (b === null) return -1;
    const comparison = a === b ? 0 : a < b ? -1 : 1;
    return comparison === 0 ? left.id.localeCompare(right.id) : comparison * factor;
  });
}
