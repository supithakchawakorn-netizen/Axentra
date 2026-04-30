-- 0003_ticker_summaries.sql
-- Tables: ticker_summaries, ticker_news_summaries.
-- Read path is cache-only. /api/cron/* refreshes rows when expired.

-- =============================================================================
-- ticker_summaries: AI-generated company / market context summary per ticker.
-- One row per (ticker_id, prompt_version). Bumping prompt_version invalidates
-- existing rows (cron picks them up next pass).
-- =============================================================================

create table public.ticker_summaries (
  id              uuid        primary key default gen_random_uuid(),
  ticker_id       uuid        not null references public.tickers(id) on delete cascade,
  prompt_version  int         not null default 1,
  body            text        not null,
  model           text        not null,
  source_count    int         not null default 0,
  generated_at    timestamptz not null default now(),
  expires_at      timestamptz not null,
  created_at      timestamptz not null default now(),
  unique (ticker_id, prompt_version)
);

create index ticker_summaries_expires_idx
  on public.ticker_summaries (expires_at);

create index ticker_summaries_ticker_idx
  on public.ticker_summaries (ticker_id);

alter table public.ticker_summaries enable row level security;

create policy "ticker_summaries_public_select"
on public.ticker_summaries for select
using (true);

-- writes are service-role only (cron). No insert/update/delete policies for
-- `authenticated`.

-- =============================================================================
-- ticker_news_summaries: daily news roll-up per ticker.
-- One row per (ticker_id, as_of_date).
-- =============================================================================

create table public.ticker_news_summaries (
  id              uuid        primary key default gen_random_uuid(),
  ticker_id       uuid        not null references public.tickers(id) on delete cascade,
  as_of_date      date        not null,
  prompt_version  int         not null default 1,
  body            text        not null,
  model           text        not null,
  headline_count  int         not null default 0,
  generated_at    timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  unique (ticker_id, as_of_date)
);

create index ticker_news_summaries_ticker_date_idx
  on public.ticker_news_summaries (ticker_id, as_of_date desc);

alter table public.ticker_news_summaries enable row level security;

create policy "ticker_news_summaries_public_select"
on public.ticker_news_summaries for select
using (true);

-- writes are service-role only.
