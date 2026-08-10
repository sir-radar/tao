import { priceDecimals, roundTo, type GeneratedSeries } from "./generatePriceSeries.js";

export type SeriesStats = {
  open: number;
  close: number;
  high: number;
  low: number;
  change: number;
  changePercent: number;
};

export function calculateSeriesStats(series: GeneratedSeries): SeriesStats {
  if (series.points.length === 0) {
    throw new Error("Cannot calculate stats for an empty price series.");
  }

  const prices = series.points.map((point) => point.price);
  const open = prices[0];
  const close = prices[prices.length - 1];
  // Rounding to the token's own price scale keeps sub-dollar tokens from
  // reporting a flat change.
  const change = roundTo(close - open, priceDecimals(open));
  const changePercent = roundTo((change / open) * 100, 2);

  return {
    open,
    close,
    high: Math.max(...prices),
    low: Math.min(...prices),
    change,
    changePercent
  };
}
