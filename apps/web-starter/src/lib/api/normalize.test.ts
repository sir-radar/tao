import { describe, expect, it } from "vitest";
import { PayloadError } from "./contracts";
import { normalizeMarketSummary } from "./normalize";

describe("normalizeMarketSummary", () => {
  it("keeps usable values and nulls invalid leaves", () => {
    expect(normalizeMarketSummary({ marketCap: 12_500, volume24h: "invalid", dailyTrades: 42 })).toMatchObject({
      marketCap: 12_500,
      volume24h: null,
      dailyTrades: 42,
    });
  });

  it("rejects a resource with no usable metrics", () => {
    expect(() => normalizeMarketSummary({ generatedAt: "not-a-date", marketCap: Number.NaN })).toThrow(PayloadError);
  });
});
