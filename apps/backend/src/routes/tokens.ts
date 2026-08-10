import { Router, type Request, type Response } from "express";
import {
  getTokenDetail,
  getTokenEvents,
  getTokenHistory,
  getTokenStats,
  getTokenTransactions,
  listTokens
} from "../data.js";
import {
  delay,
  historyLatencyMs,
  historyRequestShouldFail,
  historyTokenAlwaysFails,
  tokensListLatencyMs
} from "../utils/delay.js";
import { isHistoryRange, supportedRanges } from "../utils/generatePriceSeries.js";

export const tokensRouter = Router();

function parseRange(req: Request, res: Response) {
  const range = req.query.range;

  if (!isHistoryRange(range)) {
    res.status(400).json({
      error: "Unsupported range",
      message: `Use one of: ${supportedRanges().join(", ")}.`,
      supportedRanges: supportedRanges()
    });
    return null;
  }

  return range;
}

function notFound(res: Response, id: string) {
  res.status(404).json({
    error: "Unknown token",
    message: `No token with id "${id}" exists.`
  });
}

function requestKey(req: Request) {
  return req.ip + req.originalUrl + (req.get("user-agent") ?? "");
}

tokensRouter.get("/", async (req, res) => {
  const latencyMs = tokensListLatencyMs(requestKey(req));
  await delay(latencyMs);

  res.json({
    tokens: listTokens(),
    meta: {
      latencyMs,
      latencyEnabled: latencyMs > 0
    }
  });
});

tokensRouter.get("/:id", (req, res) => {
  const detail = getTokenDetail(req.params.id);
  if (!detail) return notFound(res, req.params.id);

  res.json(detail);
});

tokensRouter.get("/:id/history", async (req, res) => {
  const range = parseRange(req, res);
  if (!range) return;

  const history = getTokenHistory(req.params.id, range);
  if (!history) return notFound(res, req.params.id);

  const latencyMs = historyLatencyMs(range, requestKey(req));
  await delay(latencyMs);

  if (historyTokenAlwaysFails(req.params.id)) {
    res.status(500).json({
      error: "Internal server error",
      message: `The upstream price service has no history feed for "${req.params.id}".`
    });
    return;
  }

  if (historyRequestShouldFail()) {
    res.status(500).json({
      error: "Internal server error",
      message: "The upstream price service failed to respond. Please retry."
    });
    return;
  }

  res.json({
    ...history,
    meta: {
      latencyMs,
      latencyEnabled: latencyMs > 0
    }
  });
});

tokensRouter.get("/:id/stats", (req, res) => {
  const range = parseRange(req, res);
  if (!range) return;

  const stats = getTokenStats(req.params.id, range);
  if (!stats) return notFound(res, req.params.id);

  res.json(stats);
});

tokensRouter.get("/:id/transactions", (req, res) => {
  const transactions = getTokenTransactions(req.params.id);
  if (!transactions) return notFound(res, req.params.id);

  res.json(transactions);
});

tokensRouter.get("/:id/events", (req, res) => {
  const events = getTokenEvents(req.params.id);
  if (!events) return notFound(res, req.params.id);

  res.json(events);
});
