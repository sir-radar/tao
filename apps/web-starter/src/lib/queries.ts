'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { marketApi } from './api/client';
import type { HistoryRange } from './api/contracts';

const MINUTE = 60_000;
export const queryKeys = {
  summary: ['market', 'summary'] as const,
  tokens: ['tokens', 'list'] as const,
  detail: (id: string) => ['tokens', 'detail', id] as const,
  history: (id: string, range: HistoryRange) =>
    ['tokens', 'history', id, range] as const,
  stats: (id: string, range: HistoryRange) =>
    ['tokens', 'stats', id, range] as const,
};

const shared = {
  retry: false,
  refetchOnWindowFocus: false,
  gcTime: 30 * MINUTE,
} as const;

export function useMarketSummary() {
  return useQuery({
    ...shared,
    queryKey: queryKeys.summary,
    queryFn: ({ signal }) => marketApi.summary(signal),
    staleTime: MINUTE,
  });
}
export function useTokens() {
  return useQuery({
    ...shared,
    queryKey: queryKeys.tokens,
    queryFn: ({ signal }) => marketApi.tokens(signal),
    staleTime: 5 * MINUTE,
  });
}
export function useTokenDetail(id: string) {
  return useQuery({
    ...shared,
    queryKey: queryKeys.detail(id),
    queryFn: ({ signal }) => marketApi.detail(id, signal),
    staleTime: MINUTE,
    enabled: Boolean(id),
  });
}
export function useTokenHistory(
  id: string,
  range: HistoryRange,
  enabled: boolean,
) {
  return useQuery({
    ...shared,
    queryKey: queryKeys.history(id, range),
    queryFn: ({ signal }) => marketApi.history(id, range, signal),
    staleTime: 10 * MINUTE,
    enabled,
    placeholderData: keepPreviousData,
  });
}
export function useTokenStats(
  id: string,
  range: HistoryRange,
  enabled: boolean,
) {
  return useQuery({
    ...shared,
    queryKey: queryKeys.stats(id, range),
    queryFn: ({ signal }) => marketApi.stats(id, range, signal),
    staleTime: 10 * MINUTE,
    enabled,
    placeholderData: keepPreviousData,
  });
}
