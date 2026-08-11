import { describe, expect, it } from 'vitest';
import type { TokenListItem } from './api/contracts';
import {
  nextSortDirection,
  percentageShare,
  resolveSortState,
  sortTokens,
} from './market';

function token(
  id: string,
  marketCap: number | null,
  changePercent24h = 0,
): TokenListItem {
  return {
    id,
    name: id,
    symbol: id.toUpperCase(),
    subnet: 'SN1',
    price: 1,
    marketCap,
    changePercent24h,
    changePercent7d: 0,
    changePercent30d: 0,
    netVolume24h: 0,
    buyVolume24h: 0,
    sellVolume24h: 0,
    transactions24h: 0,
    emissionsPerDay: 0,
  };
}

describe('sortTokens', () => {
  it('sorts both directions without mutating the API array', () => {
    const original = [token('middle', 20), token('low', 10), token('high', 30)];

    expect(
      sortTokens(original, 'marketCap', 'asc').map(({ id }) => id),
    ).toEqual(['low', 'middle', 'high']);
    expect(
      sortTokens(original, 'marketCap', 'desc').map(({ id }) => id),
    ).toEqual(['high', 'middle', 'low']);
    expect(original.map(({ id }) => id)).toEqual(['middle', 'low', 'high']);
  });

  it('keeps missing values last and uses the token id as a stable tie-breaker', () => {
    const original = [
      token('zeta', 10),
      token('missing', null),
      token('alpha', 10),
    ];

    expect(
      sortTokens(original, 'marketCap', 'desc').map(({ id }) => id),
    ).toEqual(['alpha', 'zeta', 'missing']);
  });
});

describe('sort URL state', () => {
  it('uses explicit valid values and canonical defaults for invalid values', () => {
    expect(resolveSortState('changePercent24h', 'asc')).toEqual({
      sortKey: 'changePercent24h',
      direction: 'asc',
    });
    expect(resolveSortState('unknown', 'sideways')).toEqual({
      sortKey: 'marketCap',
      direction: 'desc',
    });
  });

  it('toggles the active key and starts a new key descending', () => {
    expect(nextSortDirection('marketCap', 'desc', 'marketCap')).toBe('asc');
    expect(nextSortDirection('marketCap', 'asc', 'marketCap')).toBe('desc');
    expect(nextSortDirection('marketCap', 'asc', 'changePercent24h')).toBe(
      'desc',
    );
  });
});

describe('percentageShare', () => {
  it('returns a bounded share without inventing missing data', () => {
    expect(percentageShare(25, 100)).toBe(25);
    expect(percentageShare(120, 100)).toBe(100);
    expect(percentageShare(null, 100)).toBeNull();
    expect(percentageShare(0, null)).toBeNull();
    expect(percentageShare(0, 0)).toBeNull();
  });
});
