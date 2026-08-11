'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  DEFAULT_SORT_DIRECTION,
  DEFAULT_SORT_KEY,
  isSortDirection,
  isSortKey,
  nextSortDirection,
  resolveSortState,
  type SortKey,
} from '@/lib/market';
import { useTokens } from '@/lib/queries';
import { EmptyState, ResourceError } from './ResourceState';
import { TokenTable, TokenTableSkeleton } from './TokenTable';

export function TokenMarkets() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = useTokens();
  const sortParam = searchParams.get('sort');
  const directionParam = searchParams.get('dir');
  const queryString = searchParams.toString();
  const { sortKey, direction } = resolveSortState(sortParam, directionParam);

  useEffect(() => {
    const sortIsInvalid = sortParam !== null && !isSortKey(sortParam);
    const directionIsInvalid =
      directionParam !== null && !isSortDirection(directionParam);
    if (!sortIsInvalid && !directionIsInvalid) return;

    const params = new URLSearchParams(queryString);
    params.set('sort', DEFAULT_SORT_KEY);
    params.set('dir', DEFAULT_SORT_DIRECTION);
    router.replace(`/?${params.toString()}`, { scroll: false });
  }, [directionParam, queryString, router, sortParam]);

  function handleSort(nextKey: SortKey) {
    const params = new URLSearchParams(queryString);
    params.set('sort', nextKey);
    params.set('dir', nextSortDirection(sortKey, direction, nextKey));
    router.replace(`/?${params.toString()}`, { scroll: false });
  }

  if (query.isPending) return <TokenTableSkeleton />;

  if (query.isError) {
    return (
      <ResourceError
        title="Token markets unavailable"
        error={query.error}
        retry={() => query.refetch()}
      />
    );
  }

  if (query.data.length === 0) {
    return (
      <EmptyState
        title="No tokens found"
        description="The market returned an empty token list. Try loading it again."
        retry={() => query.refetch()}
      />
    );
  }

  return (
    <TokenTable
      tokens={query.data}
      sortKey={sortKey}
      direction={direction}
      onSort={handleSort}
    />
  );
}
