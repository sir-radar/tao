import type { HistoryRange } from "./contracts";
import { normalizeHistory, normalizeMarketSummary, normalizeStats, normalizeTokenDetail, normalizeTokenList } from "./normalize";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) { super(message); this.name = "ApiError"; }
}

async function get(path: string, signal?: AbortSignal): Promise<unknown> {
  let response: Response;
  try { response = await fetch(`${API_BASE_URL}${path}`, { signal, headers: { Accept: "application/json" } }); }
  catch (error) { if (error instanceof DOMException && error.name === "AbortError") throw error; throw new ApiError(0, "The API could not be reached."); }
  let payload: unknown;
  try { payload = await response.json(); } catch { throw new ApiError(response.status, "The API returned an unreadable response."); }
  if (!response.ok) {
    const candidate = typeof payload === "object" && payload && "message" in payload ? (payload as { message?: unknown }).message : null;
    throw new ApiError(response.status, typeof candidate === "string" ? candidate : `Request failed (${response.status}).`);
  }
  return payload;
}

export const marketApi = {
  summary: async (signal?: AbortSignal) => normalizeMarketSummary(await get("/api/market/summary", signal)),
  tokens: async (signal?: AbortSignal) => normalizeTokenList(await get("/api/tokens", signal)),
  detail: async (id: string, signal?: AbortSignal) => normalizeTokenDetail(await get(`/api/tokens/${encodeURIComponent(id)}`, signal), id),
  history: async (id: string, range: HistoryRange, signal?: AbortSignal) => normalizeHistory(await get(`/api/tokens/${encodeURIComponent(id)}/history?range=${range}`, signal), id, range),
  stats: async (id: string, range: HistoryRange, signal?: AbortSignal) => normalizeStats(await get(`/api/tokens/${encodeURIComponent(id)}/stats?range=${range}`, signal), id, range),
};
