import { describe, expect, it } from "vitest";
import { generatePriceSeries, supportedRanges } from "../src/utils/generatePriceSeries.js";

describe("generatePriceSeries", () => {
  it("generates deterministic data for a range", () => {
    expect(generatePriceSeries("24h")).toEqual(generatePriceSeries("24h"));
  });

  it("generates different data for different token seeds", () => {
    const a = generatePriceSeries("24h", { seed: 1, basePrice: 10 });
    const b = generatePriceSeries("24h", { seed: 2, basePrice: 10 });

    expect(a.points).not.toEqual(b.points);
  });

  it("generates different data for each range of the same token", () => {
    const hour = generatePriceSeries("1h", { seed: 4_242, basePrice: 10 });
    const week = generatePriceSeries("7d", { seed: 4_242, basePrice: 10 });

    expect(hour.points[0].price).not.toBe(week.points[0].price);
  });

  it("uses the expected point cadence", () => {
    expect(generatePriceSeries("1h").points).toHaveLength(61);
    expect(generatePriceSeries("24h").points).toHaveLength(289);
    expect(generatePriceSeries("7d").points).toHaveLength(337);
    expect(generatePriceSeries("30d").points).toHaveLength(721);
    expect(generatePriceSeries("90d").points).toHaveLength(2161);
    expect(generatePriceSeries("1y").points).toHaveLength(4381);
    expect(generatePriceSeries("all").points).toHaveLength(13141);
  });

  it("returns strictly more points as the range grows", () => {
    const counts = supportedRanges().map((range) => generatePriceSeries(range).points.length);

    for (let index = 1; index < counts.length; index += 1) {
      expect(counts[index]).toBeGreaterThan(counts[index - 1]);
    }
  });

  it("supports all seven ranges", () => {
    expect(supportedRanges()).toEqual(["1h", "24h", "7d", "30d", "90d", "1y", "all"]);
  });

  it("ends at the token base price", () => {
    const points = generatePriceSeries("24h", { basePrice: 5.67, seed: 42 }).points;
    expect(points[points.length - 1].price).toBe(5.67);
  });

  it("returns points in chronological order", () => {
    const timestamps = generatePriceSeries("30d").points.map((point) => Date.parse(point.timestamp));
    expect(timestamps).toEqual([...timestamps].sort((a, b) => a - b));
  });

  it("moves down as well as up within every range", () => {
    for (const range of supportedRanges()) {
      const prices = generatePriceSeries(range, { basePrice: 245.12, seed: 9_973 }).points.map(
        (point) => point.price
      );
      const deltas = prices.slice(1).map((price, index) => price - prices[index]);

      expect(deltas.some((delta) => delta < 0)).toBe(true);
      expect(deltas.some((delta) => delta > 0)).toBe(true);
    }
  });

  it("produces falling series for some seeds and rising series for others", () => {
    const changes = Array.from({ length: 40 }, (_, index) => {
      const points = generatePriceSeries("24h", { basePrice: 20, seed: 1_000 + index * 97 }).points;
      return points[points.length - 1].price - points[0].price;
    });

    expect(changes.some((change) => change < 0)).toBe(true);
    expect(changes.some((change) => change > 0)).toBe(true);
  });

  it("keeps prices positive for low-priced tokens", () => {
    const points = generatePriceSeries("all", { basePrice: 0.01, seed: 7 }).points;
    expect(points.every((point) => point.price > 0)).toBe(true);
  });
});
