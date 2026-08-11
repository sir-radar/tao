import { describe, expect, it } from 'vitest';
import { chartPriceDomain, chartPriceScale, describeSeries } from './chart';

describe('describeSeries', () => {
  it('summarizes chart points for the accessible fallback', () => {
    expect(
      describeSeries([
        { timestamp: 'a', time: 1, price: 4 },
        { timestamp: 'b', time: 2, price: 9 },
        { timestamp: 'c', time: 3, price: 6 },
      ]),
    ).toEqual({
      open: 4,
      close: 6,
      high: 9,
      low: 4,
      direction: 'up',
      pointCount: 3,
    });
  });

  it('handles empty, flat, and single-point series', () => {
    expect(describeSeries([])).toBeNull();
    expect(
      describeSeries([{ timestamp: 'a', time: 1, price: 5 }]),
    ).toMatchObject({
      open: 5,
      close: 5,
      direction: 'unchanged',
      pointCount: 1,
    });
  });
});

describe('chartPriceScale', () => {
  it('retains meaningful precision for both large and tiny prices', () => {
    expect(chartPriceScale(245.12)).toEqual({ precision: 2, minMove: 0.01 });
    expect(chartPriceScale(0.00001234)).toEqual({
      precision: 8,
      minMove: 0.00000001,
    });
  });
});

describe('chartPriceDomain', () => {
  it('pads normal and flat series without collapsing the y-axis', () => {
    expect(chartPriceDomain(10, 20)).toEqual({ minValue: 9.2, maxValue: 20.8 });
    expect(chartPriceDomain(5, 5)).toEqual({ minValue: 4.95, maxValue: 5.05 });
    expect(chartPriceDomain(0.00000001, 0.00000001)).toEqual({
      minValue: 0,
      maxValue: 0.00000002,
    });
  });
});
