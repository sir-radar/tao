import { describe, expect, it } from 'vitest';
import { PayloadError } from './contracts';
import { normalizeMarketSummary, normalizeTokenList } from './normalize';

describe('normalizeMarketSummary', () => {
  it('keeps usable values and nulls invalid leaves', () => {
    expect(
      normalizeMarketSummary({
        marketCap: 12_500,
        volume24h: 'invalid',
        dailyTrades: 42,
      }),
    ).toMatchObject({
      marketCap: 12_500,
      volume24h: null,
      dailyTrades: 42,
    });
  });

  it('rejects a resource with no usable metrics', () => {
    expect(() =>
      normalizeMarketSummary({
        generatedAt: 'not-a-date',
        marketCap: Number.NaN,
      }),
    ).toThrow(PayloadError);
  });
});

describe('normalizeTokenList', () => {
  it('drops unusable rows and deterministically keeps the last duplicate id', () => {
    const result = normalizeTokenList({
      tokens: [
        { id: 'alpha', name: 'Alpha', subnet: 'SN1', marketCap: 10 },
        { id: 'missing-subnet', name: 'Invalid' },
        { id: 'alpha', name: 'Alpha Updated', subnet: 'SN1', marketCap: 12 },
      ],
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'alpha',
      name: 'Alpha Updated',
      marketCap: 12,
    });
  });

  it('distinguishes an empty list from a non-empty list with no usable rows', () => {
    expect(normalizeTokenList({ tokens: [] })).toEqual([]);
    expect(() => normalizeTokenList({ tokens: [{ id: 'broken' }] })).toThrow(
      PayloadError,
    );
  });
});
