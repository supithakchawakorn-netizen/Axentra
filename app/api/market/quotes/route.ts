import { NextResponse } from "next/server";
import { marketDataProviderConfigured, serverEnv } from "@/lib/env";
import type { MarketQuote } from "@/lib/market-data/types";

export const dynamic = "force-dynamic";

const DEFAULT_SYMBOLS = ["SPY", "QQQ", "NVDA", "AAPL", "MSFT"];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const symbols = normalizeSymbols(url.searchParams.get("symbols"));
  if (!marketDataProviderConfigured()) {
    return NextResponse.json(
      { error: "Market data provider is not configured." },
      { status: 503 },
    );
  }

  const env = serverEnv();
  try {
    const upstreamUrl = new URL(env.MARKET_DATA_BASE_URL!);
    upstreamUrl.searchParams.set("symbols", symbols.join(","));
    const res = await fetch(upstreamUrl.toString(), {
      headers: {
        Authorization: `Bearer ${env.MARKET_DATA_API_KEY}`,
      },
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream market provider error (${res.status}).` },
        { status: 502 },
      );
    }
    const payload = (await res.json()) as unknown;
    const quotes = normalizeProviderPayload(payload, symbols);
    return NextResponse.json({ quotes });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch market quotes.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function normalizeSymbols(raw: string | null): string[] {
  const parsed = raw
    ? raw
        .split(",")
        .map((symbol) => symbol.trim().toUpperCase())
        .filter(Boolean)
    : [];
  return parsed.length > 0 ? parsed.slice(0, 20) : DEFAULT_SYMBOLS;
}

function normalizeProviderPayload(
  payload: unknown,
  symbols: string[],
): MarketQuote[] {
  const now = Date.now();
  if (Array.isArray(payload)) {
    return payload
      .map((entry) => parseQuote(entry, now))
      .filter((quote): quote is MarketQuote => Boolean(quote));
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.quotes)) {
      return record.quotes
        .map((entry) => parseQuote(entry, now))
        .filter((quote): quote is MarketQuote => Boolean(quote));
    }
    if (record.data && Array.isArray(record.data)) {
      return record.data
        .map((entry) => parseQuote(entry, now))
        .filter((quote): quote is MarketQuote => Boolean(quote));
    }
    const values = Object.values(record);
    if (values.length > 0 && values.every((entry) => entry && typeof entry === "object")) {
      const mapped = values
        .map((entry) => parseQuote(entry, now))
        .filter((quote): quote is MarketQuote => Boolean(quote));
      if (mapped.length > 0) return mapped;
    }
  }

  return symbols.map((symbol) => ({
    symbol,
    price: 0,
    changePercent: 0,
    updatedAt: now,
  }));
}

function parseQuote(value: unknown, fallbackTs: number): MarketQuote | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const symbolRaw =
    typeof row.symbol === "string"
      ? row.symbol
      : typeof row.ticker === "string"
        ? row.ticker
        : null;
  if (!symbolRaw) return null;

  const price = toNumber(row.price ?? row.last ?? row.close ?? 0);
  const changePercent = toNumber(
    row.changePercent ?? row.change_percent ?? row.percent_change ?? 0,
  );
  const updatedAtRaw = toNumber(row.updatedAt ?? row.updated_at ?? row.ts);
  return {
    symbol: symbolRaw.toUpperCase(),
    price,
    changePercent,
    updatedAt: updatedAtRaw > 0 ? updatedAtRaw : fallbackTs,
  };
}

function toNumber(value: unknown): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}
