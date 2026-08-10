import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { marketRouter } from "./routes/market.js";
import { tokensRouter } from "./routes/tokens.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/market", marketRouter);
app.use("/api/tokens", tokensRouter);

app.use((_req, res) => {
  res.status(404).json({
    error: "Not found",
    message: "The requested route does not exist."
  });
});

app.listen(port, () => {
  console.log(`TAO take-home backend listening on http://localhost:${port}`);
  console.log("Available routes:");
  console.log("  GET /health");
  console.log("  GET /api/market/summary");
  console.log("  GET /api/tokens");
  console.log("  GET /api/tokens/:id");
  console.log("  GET /api/tokens/:id/history?range=1h|24h|7d|30d|90d|1y|all");
  console.log("  GET /api/tokens/:id/stats?range=1h|24h|7d|30d|90d|1y|all");
  console.log("  GET /api/tokens/:id/transactions");
  console.log("  GET /api/tokens/:id/events");
});
