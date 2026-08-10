import { describe, expect, it } from "vitest";
import {
  getMarketSummary,
  getTokenDetail,
  getTokenHistory,
  getTokenStats,
  getTokenTransactions,
  listTokens
} from "../src/data.js";
import { supportedRanges } from "../src/utils/generatePriceSeries.js";

describe("token catalog", () => {
  it("lists a large, deterministic token universe", () => {
    const tokens = listTokens();

    expect(tokens).toHaveLength(250);
    expect(tokens).toEqual(listTokens());
  });

  it("includes the featured design tokens", () => {
    const ids = new Set(listTokens().map((token) => token.id));

    for (const id of ["root", "chutes", "ilum", "targon", "affine", "score", "iota", "gradients", "engy", "vanta"]) {
      expect(ids.has(id)).toBe(true);
    }
  });

  it("has unique subnet identifiers", () => {
    const subnets = listTokens().map((token) => token.subnet);
    expect(new Set(subnets).size).toBe(subnets.length);
  });

  it("reports gainers and losers over every movement window", () => {
    const tokens = listTokens();

    for (const field of ["changePercent24h", "changePercent7d", "changePercent30d"] as const) {
      const values = tokens.map((token) => token[field]);

      expect(values.some((value) => value < 0)).toBe(true);
      expect(values.some((value) => value > 0)).toBe(true);
      expect(values.every((value) => value !== 0)).toBe(true);
    }
  });
});

describe("getTokenDetail", () => {
  it("returns pricing and movement for a known token", () => {
    const detail = getTokenDetail("gradients");

    expect(detail).not.toBeNull();
    expect(detail?.price).toBe(5.67);
    expect(detail?.subnet).toBe("SN56");
    expect(typeof detail?.changePercent24h).toBe("number");
  });

  it("returns null for unknown tokens", () => {
    expect(getTokenDetail("does-not-exist")).toBeNull();
  });
});

describe("getTokenHistory", () => {
  it("uses the expected point counts per range", () => {
    expect(getTokenHistory("root", "1y")?.points.length).toBe(4381);
    expect(getTokenHistory("root", "all")?.points.length).toBe(13141);
  });

  it("returns more points for every longer range", () => {
    const counts = supportedRanges().map((range) => getTokenHistory("root", range)!.points.length);

    for (let index = 1; index < counts.length; index += 1) {
      expect(counts[index]).toBeGreaterThan(counts[index - 1]);
    }
  });

  it("serves the 7d range with two pairs of points out of chronological order", () => {
    const points = getTokenHistory("gradients", "7d")!.points;
    const inversions = points.filter(
      (point, index) => index > 0 && Date.parse(point.timestamp) < Date.parse(points[index - 1].timestamp)
    );

    expect(inversions).toHaveLength(2);
  });

  it("returns deterministic payloads", () => {
    expect(getTokenHistory("gradients", "7d")).toEqual(getTokenHistory("gradients", "7d"));
    expect(getTokenHistory("gradients", "24h")).toEqual(getTokenHistory("gradients", "24h"));
  });
});

describe("getTokenStats", () => {
  it("returns grouped stats blocks", () => {
    const stats = getTokenStats("gradients", "24h");

    expect(stats?.price.close).toBe(5.67);
    expect(stats?.financials.marketCap).toBeGreaterThan(0);
    expect(stats?.financials.mcFdvRatio).toBeGreaterThan(0);
    expect(stats?.financials.mcFdvRatio).toBeLessThanOrEqual(1);
    expect(stats?.trading.totalVolume).toBeGreaterThan(0);
    expect(stats?.subnetData.keyCapacity).toBe(256);
  });

  it("scales trading volume with the range", () => {
    const day = getTokenStats("root", "24h");
    const month = getTokenStats("root", "30d");

    expect(month!.trading.totalVolume).toBeGreaterThan(day!.trading.totalVolume);
  });
});

describe("getTokenTransactions", () => {
  it("returns deterministic descending trades", () => {
    const result = getTokenTransactions("gradients");
    const timestamps = result!.transactions.map((tx) => new Date(tx.timestamp).getTime());

    expect(result!.transactions).toHaveLength(60);
    expect(timestamps).toEqual([...timestamps].sort((a, b) => b - a));
    expect(result).toEqual(getTokenTransactions("gradients"));
  });
});

describe("getMarketSummary", () => {
  it("aggregates the token universe", () => {
    const summary = getMarketSummary();

    expect(summary.marketCap).toBeGreaterThan(0);
    expect(summary.volume24h).toBeGreaterThan(0);
    expect(summary.dailyTrades).toBeGreaterThan(0);
    expect(summary.volumeToMarketCapPercent).toBeGreaterThan(0);
  });
});
