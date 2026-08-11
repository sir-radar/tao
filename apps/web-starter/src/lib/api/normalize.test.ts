import { describe, expect, it } from 'vitest';
import { PayloadError } from './contracts';
import {
  normalizeHistory,
  normalizeMarketSummary,
  normalizeStats,
  normalizeTokenList,
} from './normalize';

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

describe('normalizeHistory', () => {
  it('sorts, filters, and keeps the final duplicate timestamp', () => {
    const result = normalizeHistory(
      {
        id: 'gradients',
        range: '7d',
        points: [
          { timestamp: '2026-01-02T00:00:00.000Z', price: 2 },
          { timestamp: 'invalid', price: 8 },
          { timestamp: '2026-01-01T00:00:00.000Z', price: 1 },
          { timestamp: '2026-01-02T00:00:00.000Z', price: 3 },
          { timestamp: '2026-01-03T00:00:00.000Z', price: -1 },
        ],
      },
      'gradients',
      '7d',
    );

    expect(result.points.map((point) => point.price)).toEqual([1, 3]);
  });

  it('distinguishes empty history from all-invalid history', () => {
    expect(
      normalizeHistory(
        { id: 'gradients', range: '24h', points: [] },
        'gradients',
        '24h',
      ).points,
    ).toEqual([]);
    expect(() =>
      normalizeHistory(
        {
          id: 'gradients',
          range: '24h',
          points: [{ timestamp: 'invalid', price: 0 }],
        },
        'gradients',
        '24h',
      ),
    ).toThrow(PayloadError);
  });
});

describe('normalizeStats', () => {
  const groups = {
    price: { close: 5.67 },
    financials: {},
    trading: {},
    subnetData: {},
  };

  it('keeps valid leaves and nulls malformed values', () => {
    const result = normalizeStats(
      { id: 'gradients', range: '24h', ...groups },
      'gradients',
      '24h',
    );
    expect(result.price.close).toBe(5.67);
    expect(result.price.open).toBeNull();
  });

  it('rejects mismatched and entirely unusable resources', () => {
    expect(() =>
      normalizeStats(
        { id: 'other', range: '24h', ...groups },
        'gradients',
        '24h',
      ),
    ).toThrow(PayloadError);
    expect(() =>
      normalizeStats(
        {
          id: 'gradients',
          range: '24h',
          price: {},
          financials: {},
          trading: {},
          subnetData: {},
        },
        'gradients',
        '24h',
      ),
    ).toThrow(PayloadError);
  });
});
