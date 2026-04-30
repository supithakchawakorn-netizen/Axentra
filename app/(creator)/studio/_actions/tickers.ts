"use server";

import { z } from "zod";
import { searchTickers, listTickersByIds, type TickerRow } from "@/lib/data/tickers";

const SearchInputZ = z.object({
  q: z.string().trim().max(64),
  limit: z.number().int().min(1).max(20).default(10),
});

export async function searchTickersAction(input: {
  q: string;
  limit?: number;
}): Promise<{ ok: true; results: TickerRow[] } | { ok: false; error: string }> {
  const parsed = SearchInputZ.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const results = await searchTickers(parsed.data.q, parsed.data.limit);
  return { ok: true, results };
}

const HydrateInputZ = z.object({
  ids: z.array(z.string().uuid()).max(16),
});

export async function hydrateTickersAction(input: {
  ids: string[];
}): Promise<{ ok: true; results: TickerRow[] } | { ok: false; error: string }> {
  const parsed = HydrateInputZ.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const results = await listTickersByIds(parsed.data.ids);
  return { ok: true, results };
}
