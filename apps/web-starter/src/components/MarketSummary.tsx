"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCompact, formatPercent } from "@/lib/format";
import { useMarketSummary } from "@/lib/queries";
import { Movement } from "./Movement";
import { ResourceError } from "./ResourceState";

export function MarketSummary() {
  const query = useMarketSummary();

  if (query.isPending) {
    return <section aria-label="Market summary loading" className="grid grid-cols-6 gap-4 max-[1100px]:gap-3">{Array.from({ length: 6 }, (_, index) => <Card key={index} className="h-[109px] gap-2 border-0 p-4 shadow-none"><Skeleton className="h-4 w-24" /><Skeleton className="h-7 w-28" /><Skeleton className="h-5 w-14" /></Card>)}</section>;
  }

  if (query.isError) {
    return <ResourceError title="Market summary unavailable" error={query.error} retry={() => query.refetch()} />;
  }

  const data = query.data;
  const metrics = [
    { label: "Market cap", value: formatCompact(data.marketCap, "$"), change: data.marketCapChangePercent24h },
    { label: "Volume (24h)", value: formatCompact(data.volume24h, "$"), change: data.volumeChangePercent24h },
    { label: "Vol/Mkt Cap (24h)", value: formatPercent(data.volumeToMarketCapPercent, false), change: null },
    { label: "Daily Trades", value: formatCompact(data.dailyTrades), change: data.dailyTradesChangePercent24h },
    { label: "Daily Traders", value: formatCompact(data.dailyTraders), change: data.dailyTradersChangePercent24h },
    { label: "Active wallets", value: formatCompact(data.activeWallets), change: data.activeWalletsChangePercent24h },
  ];

  return <section aria-label="Global market summary" className="grid grid-cols-6 gap-4 max-[1100px]:gap-3">{metrics.map((metric) => <Card key={metric.label} className="h-[109px] gap-1 border-0 p-4 shadow-none"><p className="text-sm text-muted-foreground">{metric.label}</p><p className="text-[23px] leading-tight tracking-tight tabular">{metric.value}</p>{metric.change === null ? <span className="mt-0.5 w-fit rounded-md bg-positive/10 px-1.5 py-0.5 text-xs text-positive">24H ratio</span> : <Movement value={metric.change} compact />}</Card>)}</section>;
}
