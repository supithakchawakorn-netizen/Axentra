# AI features — V1

V1 uses OpenAI for two narrow features:

1. **Ticker summaries** — short evergreen-ish description of a ticker.
2. **News summaries** — daily digest of recent headlines per ticker.

Both are server-side, cached in Postgres, and **regenerated only by cron**. The read path always reads from cache.

## Hard rules

- **Server-side only.** Never call OpenAI from a client component.
- **Cache-first, cron-only regen.** Page reads return whatever is in `ticker_summaries` / `ticker_news_summaries`. If a row is missing, render an empty state. Regeneration is the responsibility of `/api/cron/ticker-summaries` and `/api/cron/news-summaries`. **No background regen on the read path. No "refresh on stale" inline.**
- **Schema validation.** Every model output is parsed with zod. Parse failure → discard, keep the prior cached row, log to Sentry.
- **No financial advice.** Prompts explicitly forbid recommendations, price predictions, and buy/sell calls. Disclaimers shown on UI.
- **No PII in prompts.** Inputs are market data and public news only.

## Ticker summaries

### Inputs

- Ticker symbol.
- Static reference data: company name, sector, exchange, country (from `tickers`).

### Output schema (zod)

```ts
const TickerSummary = z.object({
  paragraph: z.string().min(40).max(800),
  bullets: z.array(z.string().min(10).max(200)).min(3).max(5),
  disclaimer: z.string(),
});
```

### Storage

`ticker_summaries`:
- `ticker_id`, `paragraph`, `bullets jsonb`, `model`, `prompt_version`, `generated_at`, `expires_at`.

### Refresh policy

- `expires_at` set to `generated_at + interval '7 days'`.
- The cron route `/api/cron/ticker-summaries`:
  1. Selects rows where `expires_at < now()` or where the ticker has no row yet.
  2. Regenerates one ticker per iteration with concurrency cap.
  3. Writes the new row in a single transaction.
- Triggered by Vercel Cron (e.g. hourly). Idempotent.

## News summaries

### Inputs

- Ticker symbol.
- Recent headlines (title, source, published_at, url) from a news provider (mock fixture in V1 if not yet integrated).

### Output schema (zod)

```ts
const NewsSummary = z.object({
  asOf: z.string(), // ISO date
  bullets: z.array(z.object({
    text: z.string().min(10).max(280),
    sourceCount: z.number().int().nonnegative(),
  })).min(1).max(8),
  disclaimer: z.string(),
});
```

### Storage

`ticker_news_summaries` (one row per ticker per day):
- `ticker_id`, `as_of_date` (UNIQUE with ticker_id), `bullets jsonb`, `model`, `prompt_version`, `generated_at`.

### Refresh policy

- `/api/cron/news-summaries` runs daily.
- For each ticker with fresh headlines, generate or skip if a row already exists for `as_of_date = today`.

## Prompt management

- Prompts in `lib/openai/prompts/` as typed templates.
- Each prompt has a `version` string (`v1`, `v2`, …) stored alongside output.
- Bumping a prompt version invalidates rows generated with the previous version (cron treats them as expired).

## Failure modes

| Failure | Behavior |
|---|---|
| OpenAI 5xx / timeout (cron) | Skip row, retry next run. Log to Sentry. |
| Schema parse fails (cron) | Discard. Keep prior cached row. Log to Sentry. |
| No cached row exists (read path) | Render "Summary not available yet" empty state. Cron will fill it. |
| Cost spike | Per-day spend cap in `lib/openai/`. If hit, cron exits early. Reads still work from cache. |

## Disclaimers (UI)

Every AI-rendered surface includes a small disclaimer line, sourced from `config/disclaimers.ts`:
> "AI-generated summary. Informational only — not financial advice."

## Out of scope for AI in V1

- Per-video transcripts/chapters, sentiment scores, live captioning, chatbot/Q&A, anything that
