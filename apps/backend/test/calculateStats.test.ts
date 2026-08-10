import { describe, expect, it } from "vitest";
import { calculateSeriesStats } from "../src/utils/calculateStats.js";
import { generatePriceSeries } from "../src/utils/generatePriceSeries.js";

describe("calculateSeriesStats", () => {
  it("calculates summary values from the series", () => {
    const series = generatePriceSeries("24h");
    const stats = calculateSeriesStats(series);
    const prices = series.points.map((point) => point.price);

    expect(stats.open).toBe(prices[0]);
    expect(stats.close).toBe(prices[prices.length - 1]);
    expect(stats.high).toBe(Math.max(...prices));
    expect(stats.low).toBe(Math.min(...prices));
    expect(stats.change).toBeCloseTo(stats.close - stats.open, 2);
  });

  it("throws for empty series", () => {
    expect(() =>
      calculateSeriesStats({
        symbol: "TAO",
        range: "1h",
        generatedAt: "2026-06-05T10:30:00.000Z",
        points: []
      })
    ).toThrow("empty price series");
  });
});
