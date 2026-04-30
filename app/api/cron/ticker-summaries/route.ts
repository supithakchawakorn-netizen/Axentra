import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOpenAI, DEFAULT_MODEL } from "@/lib/openai";
import {
  buildTickerPrompt,
  TICKER_PROMPT_VERSION,
  TickerSummaryOutputZ,
} from "@/lib/openai/prompts/ticker";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Hourly cron: regenerate up to N ticker summaries that are missing or expired
 * for the current `TICKER_PROMPT_VERSION`.
 *
 * Strict cache write path. Read paths NEVER call OpenAI directly per
 * docs/product/ai-features.md.
 */
const BATCH = 8;
const SUMMARY_TTL_DAYS = 30;

export async function POST(req: Request) {
  return handle(req);
}

export async function GET(req: Request) {
  return handle(req);
}

async function handle(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ ok: false, error: "Cron not configured." }, { status: 500 });
  }
  const provided =
    req.headers.get("x-cron-secret") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    null;
  if (provided !== cronSecret) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createAdminClient();

  const nowIso = new Date().toISOString();

  // Step 1: tickers with no row at the current prompt version, or whose row
  // has expired.
  const { data: candidatesRaw, error: candErr } = await supabase
    .from("tickers")
    .select(
      `id, symbol, name,
        ticker_summaries:ticker_summaries(prompt_version, expires_at)`,
    )
    .limit(500);

  if (candErr) {
    console.error("[cron/ticker-summaries] candidates", candErr.message);
    return NextResponse.json({ ok: false, error: candErr.message }, { status: 500 });
  }

  type Cand = {
    id: string;
    symbol: string;
    name: string;
    ticker_summaries: { prompt_version: number; expires_at: string }[] | null;
  };
  const candidates = (candidatesRaw ?? []) as unknown as Cand[];

  const stale = candidates.filter((c) => {
    const current = (c.ticker_summaries ?? []).find(
      (r) => r.prompt_version === TICKER_PROMPT_VERSION,
    );
    if (!current) return true;
    return current.expires_at <= nowIso;
  });

  const targets = stale.slice(0, BATCH);

  let regenerated = 0;
  let failed = 0;

  for (const t of targets) {
    try {
      const prompt = buildTickerPrompt({ symbol: t.symbol, name: t.name });
      const client = getOpenAI();
      const completion = await client.chat.completions.create({
        model: DEFAULT_MODEL,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: prompt.system },
          { role: "user", content: prompt.user },
        ],
      });
      const raw = completion.choices[0]?.message?.content ?? "";
      const parsed = TickerSummaryOutputZ.safeParse(JSON.parse(raw || "{}"));
      if (!parsed.success) {
        failed += 1;
        console.error(
          "[cron/ticker-summaries] zod parse failed",
          t.symbol,
          parsed.error.issues[0]?.message,
        );
        continue;
      }

      const expiresAt = new Date(
        Date.now() + SUMMARY_TTL_DAYS * 24 * 60 * 60 * 1000,
      ).toISOString();

      const { error: upsertErr } = await supabase
        .from("ticker_summaries")
        .upsert(
          {
            ticker_id: t.id,
            prompt_version: TICKER_PROMPT_VERSION,
            body: parsed.data.body,
            generated_at: new Date().toISOString(),
            expires_at: expiresAt,
            model: DEFAULT_MODEL,
          },
          { onConflict: "ticker_id,prompt_version" },
        );
      if (upsertErr) {
        failed += 1;
        console.error("[cron/ticker-summaries] upsert", t.symbol, upsertErr.message);
        continue;
      }
      regenerated += 1;
    } catch (e) {
      failed += 1;
      console.error(
        "[cron/ticker-summaries] exception",
        t.symbol,
        e instanceof Error ? e.message : "unknown",
      );
    }
  }

  return NextResponse.json({
    ok: true,
    considered: targets.length,
    regenerated,
    failed,
    remainingStale: Math.max(stale.length - targets.length, 0),
  });
}
