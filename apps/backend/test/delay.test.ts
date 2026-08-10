import { afterEach, describe, expect, it } from "vitest";
import { findToken } from "../src/catalog.js";
import {
  BROKEN_HISTORY_TOKEN_ID,
  historyRequestShouldFail,
  historyTokenAlwaysFails
} from "../src/utils/delay.js";

afterEach(() => {
  delete process.env.ENABLE_API_INSTABILITY;
});

describe("historyTokenAlwaysFails", () => {
  it("targets a token that exists in the catalog", () => {
    expect(findToken(BROKEN_HISTORY_TOKEN_ID)).toBeDefined();
  });

  it("fails every request for the broken token and no others", () => {
    expect(historyTokenAlwaysFails(BROKEN_HISTORY_TOKEN_ID)).toBe(true);
    expect(historyTokenAlwaysFails(BROKEN_HISTORY_TOKEN_ID)).toBe(true);
    expect(historyTokenAlwaysFails("root")).toBe(false);
  });

  it("is disabled with the rest of the instability", () => {
    process.env.ENABLE_API_INSTABILITY = "false";
    expect(historyTokenAlwaysFails(BROKEN_HISTORY_TOKEN_ID)).toBe(false);
  });
});

describe("historyRequestShouldFail", () => {
  it("fails on a fixed request cadence", () => {
    const outcomes = Array.from({ length: 18 }, () => historyRequestShouldFail());
    const failedAt = outcomes.flatMap((failed, index) => (failed ? [index + 1] : []));

    expect(failedAt).toEqual([9, 18]);
  });

  it("is disabled by ENABLE_API_INSTABILITY=false", () => {
    process.env.ENABLE_API_INSTABILITY = "false";
    expect(Array.from({ length: 20 }, () => historyRequestShouldFail())).not.toContain(true);
  });
});
