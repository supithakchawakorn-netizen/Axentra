"use client";

import { useEffect, useMemo, useState } from "react";
import { getMarketDataProvider } from "@/lib/market-data/provider";
import type { MarketQuote } from "@/lib/market-data/types";

function quoteTone(changePercent: number) {
  if (changePercent > 0) return "text-emerald-300";
  if (changePercent < 0) return "text-red-300";
  return "text-muted-foreground";
}

export function MarketTape({
  symbols = ["SPY", "QQQ", "NVDA", "AAPL", "MSFT"],
  compact = false,
}: {
  symbols?: string[];
  compact?: boolean;
}) {
  const [quotes, setQuotes] = useState<MarketQuote[]>([]);
  const [error, setError] = useState<string | null>(null);
  const provider = useMemo(() => getMarketDataProvider(), []);
  const mode = process.env.NEXT_PUBLIC_MARKET_DATA_MODE ?? "demo";

  useEffect(() => {
    let cancelled = false;
    void provider
      .getSnapshot(symbols)
      .then((snapshot) => {
        if (cancelled) return;
        setError(null);
        setQuotes(snapshot);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Market feed unavailable.");
      });
    const unsubscribe = provider.subscribe(symbols, (updates) => {
      if (cancelled) return;
      setQuotes(updates);
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [provider, symbols]);

  return (
    <section className="glass-panel rounded-xl border px-3 py-2">
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Realtime market tape
        </p>
        <p className="text-[10px] text-muted-foreground">
          {mode === "provider"
            ? "Provider mode (live endpoint)"
            : "Demo mode (simulated stream)"}
        </p>
      </div>
      {error ? (
        <p className="mb-2 text-[11px] text-amber-300">
          {error}
        </p>
      ) : null}
      {quotes.length === 0 ? (
        <p className="text-xs text-muted-foreground">Loading quotes...</p>
      ) : null}
      <ul className={`flex flex-wrap items-center gap-2 ${compact ? "text-xs" : "text-sm"}`}>
        {quotes.map((quote) => (
          <li key={quote.symbol} className="rounded-full border bg-muted/30 px-2.5 py-1">
            <span className="mr-1 font-mono">{quote.symbol}</span>
            <span className="mr-1">${quote.price.toFixed(2)}</span>
            <span className={quoteTone(quote.changePercent)}>
              {quote.changePercent >= 0 ? "+" : ""}
              {quote.changePercent.toFixed(2)}%
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
