import { Router } from "express";
import { getMarketSummary } from "../data.js";

export const marketRouter = Router();

marketRouter.get("/summary", (_req, res) => {
  res.json(getMarketSummary());
});
