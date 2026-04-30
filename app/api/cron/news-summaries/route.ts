import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOpenAI, DEFAULT_MODEL } from "@/lib/openai";
import {
  buildNewsPrompt,
  NEWS_PROMPT_VERSION,
  NewsSummaryOutputZ,
} from "@/lib/openai/prompts/news";
import { mockHeadlinesFor } from "@/lib/news/mock";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Daily cron: write one `ticker_news_summaries` row per (ticker, today).
 *
 * Cache-only write path. Read paths NEVER call OpenAI per
 * docs/product/ai-features.md.
 */
const BATCH = 8;

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
  const today = new Date();
  const isoDay = today.toISOString().slice(0, 10);

  // Tickers without a row for today.
  const { data: candidatesRaw, error: candErr } = await supabase
    .from("tickers")
    .select(
      `id, symbol, name,
        ticker_news_summaries:ticker_news_summaries(as_of_date)`,
    )
    .limit(500);
  if (candErr) {
    console.error("[cron/news-summaries] candidates", candErr.message);
    return NextResponse.json({ ok: false, error: candErr.message }, { status: 500 });
  }

  type Cand = {
    id: string;
    symbol: string;
    name: string;
    ticker_news_summaries: { as_of_date: string }[] | null;
  };
  const candidates = (candidatesRaw ?? []) as unknown as Cand[];
  const targets = candidates
    .filter(
      (c) =>
        !(c.ticker_news_summaries ?? []).some((r) => r.as_of_date === isoDay),
    )
    .slice(0, BATCH);

  let regenerated = 0;
  let failed = 0;

  for (const t of targets) {
    try {
      const headlines = mockHeadlinesFor({
        symbol: t.symbol,
        name: t.name,
        asOf: today,
      });
      const prompt = buildNewsPrompt({
        symbol: t.symbol,
        name: t.name,
        headlines,
      });
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
      const parsed = NewsSummaryOutputZ.safeParse(JSON.parse(raw || "{}"));
      if (!parsed.success) {
        failed += 1;
        console.error(
          "[cron/news-summaries] zod parse failed",
          t.symbol,
          parsed.error.issues[0]?.message,
        );
        continue;
      }

      const { error: upsertErr } = await supabase
        .from("ticker_news_summaries")
        .upsert(
          {
            ticker_id: t.id,
            as_of_date: isoDay,
            prompt_version: NEWS_PROMPT_VERSION,
            body: parsed.data.body,
            generated_at: new Date().toISOString(),
            headline_count: headlines.length,
            model: DEFAULT_MODEL,
          },
          { onConflict: "ticker_id,as_of_date" },
        );
      if (upsertErr) {
        failed += 1;
        console.error("[cron/news-summaries] upsert", t.symbol, upsertErr.message);
        continue;
      }
      regenerated += 1;
    } catch (e) {
      failed += 1;
      console.error(
        "[cron/news-summaries] exception",
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
    asOfDate: isoDay,
  });
}
