import type { PricePoint } from '@/lib/api/contracts';

export function describeSeries(points: PricePoint[]) {
  if (points.length === 0) return null;
  const prices = points.map((point) => point.price);
  const open = prices[0];
  const close = prices[prices.length - 1];
  return {
    open,
    close,
    high: Math.max(...prices),
    low: Math.min(...prices),
    direction: close > open ? 'up' : close < open ? 'down' : 'unchanged',
    pointCount: points.length,
  } as const;
}

export function chartPriceScale(price: number) {
  const precision =
    price >= 100
      ? 2
      : price >= 1
        ? 4
        : price >= 0.1
          ? 5
          : price >= 0.01
            ? 6
            : 8;
  return { precision, minMove: 10 ** -precision };
}

export function chartPriceDomain(low: number, high: number) {
  const span = high - low;
  const padding =
    span === 0
      ? Math.max(Math.abs(low) * 0.01, chartPriceScale(low).minMove)
      : span * 0.08;
  return { minValue: low - padding, maxValue: high + padding };
}
