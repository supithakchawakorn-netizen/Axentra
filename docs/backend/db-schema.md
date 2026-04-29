# Database schema — V1

Postgres on Supabase. RLS on **every** table. Default policy is deny.

This document is the source of truth for tables, columns, and high-level RLS intent. Migration SQL lives in `supabase/migrations/`.

## Required extensions

The first migration (`0000_init.sql`) enables:

- `pgcrypto` — `gen_random_uuid()`.
- `citext` — case-insensitive text for `handle` and `email`.
- `pg_trgm` — fuzzy search on handles, titles, ticker symbols.
- `vault` — Supabase Vault for secret storage (SnapTrade user secret, future provider tokens).

## Conventions

- `id` is `uuid` default `gen_random_uuid()` unless noted.
- Timestamps `created_at`, `updated_at` (`timestamptz`, default `now()`), updated via shared trigger `set_updated_at`.
- Soft delete only where explicitly noted (`deleted_at`); otherwise hard delete.
- Foreign keys cascade on user deletion where appropriate.
- Enums declared as Postgres enums (`video_status`, `video_visibility`, `room_status`, `broker_status`).

## Tables

### `profiles`

One row per signed-in user. In V1, every signed-in user is effectively a creator.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | Matches `auth.users.id`. |
| handle | citext UNIQUE | URL-safe, lowercased on insert via trigger. |
| display_name | text | |
| avatar_url | text | |
| banner_url | text | |
| bio | text | |
| socials | jsonb | `{ twitter, youtube, instagram, website }` |
| verified_broker | boolean default false | Maintained by trigger; see §`broker_visibility`. Never written from app code. |
| created_at, updated_at | timestamptz | |

RLS:

- `select`: anyone (public).
- `insert`/`update`/`delete`: only `auth.uid() = id`.
- App code may not write `verified_broker` — column is updated only by the maintainer trigger.

Trigger:

- `handle_new_user` (on `auth.users` insert) creates the matching `profiles` row.

### `tickers`

Curated reference table.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| symbol | text UNIQUE | Uppercased. |
| name | text | |
| exchange | text | |
| sector | text | |
| country | text | |

RLS: `select` anyone. Writes service role only.

### `videos`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| creator_id | uuid FK profiles | |
| title | text | |
| description | text | |
| status | enum `video_status` | `pending`, `processing`, `ready`, `errored`. |
| visibility | enum `video_visibility` | `public`, `unlisted`. |
| mux_asset_id | text | |
| mux_playback_id | text | |
| mux_upload_id | text | |
| duration_seconds | int | |
| thumbnail_url | text | |
| published_at | timestamptz | Set by trigger when `status = ready` and `visibility = public` and `published_at is null`. |
| created_at, updated_at | timestamptz | |

RLS:

- `select`: anyone if `status = 'ready'` and `visibility = 'public'`. Owners see their own regardless.
- `insert`/`update`/`delete`: only `auth.uid() = creator_id`.

Triggers:

- `videos_set_published_at` — maintains `published_at`.

### `video_tickers` (join)

| Column | Type |
|---|---|
| video_id | uuid FK videos |
| ticker_id | uuid FK tickers |
| PK (video_id, ticker_id) | |

RLS: mirrors `videos` visibility for `select`; insert/update by owner of the video.

### `live_rooms`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| creator_id | uuid FK profiles | |
| title | text | |
| description | text | |
| status | enum `room_status` | `scheduled`, `live`, `ended`. |
| livekit_room_name | text UNIQUE | |
| scheduled_at | timestamptz | nullable |
| started_at | timestamptz | |
| ended_at | timestamptz | |
| recording_video_id | uuid FK videos | nullable; set by `/api/webhooks/livekit` after egress + Mux ingest. |
| created_at, updated_at | timestamptz | |

RLS:

- `select`: anyone for any non-deleted row. Owner sees own regardless.
- `insert`/`update`/`delete`: only `auth.uid() = creator_id`.

### `room_tickers` (join)

| Column | Type |
|---|---|
| room_id | uuid FK live_rooms |
| ticker_id | uuid FK tickers |
| PK (room_id, ticker_id) | |

### `ticker_summaries`

AI-generated, cached. Regenerated only by `/api/cron/ticker-summaries`.

| Column | Type |
|---|---|
| ticker_id | uuid PK FK tickers |
| paragraph | text |
| bullets | jsonb |
| model | text |
| prompt_version | text |
| generated_at | timestamptz |
| expires_at | timestamptz |

RLS: `select` anyone. Writes service role only.

### `ticker_news_summaries`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| ticker_id | uuid FK tickers | |
| as_of_date | date | UNIQUE with ticker_id. |
| bullets | jsonb | |
| model | text | |
| prompt_version | text | |
| generated_at | timestamptz | |

RLS: `select` anyone. Writes service role only.

### `broker_connections`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK profiles | |
| snaptrade_user_id | text | Identifier; not a secret. |
| snaptrade_user_secret_id | uuid | References `vault.secrets(id)`. **Plain text never lives here.** |
| status | enum `broker_status` | `pending`, `connected`, `disconnected`, `error`. |
| connected_at | timestamptz | |
| last_sync_at | timestamptz | |
| created_at, updated_at | timestamptz | |

RLS:

- `select`/`update`/`delete`: only `auth.uid() = user_id`.
- Service role for webhook + cron writes.
- App code reads the secret only via `lib/supabase/admin.ts` calling `vault.secrets`.

### `broker_accounts`

| Column | Type |
|---|---|
| id | uuid PK |
| connection_id | uuid FK broker_connections |
| external_id | text |
| broker_name | text |
| account_name | text |
| currency | text |
| cached_balance | numeric(20,4) |
| cached_balance_updated_at | timestamptz |

RLS:

- `select` private to owner.
- Public `select` only via `public_broker_accounts` view.
- Writes service role.

### `broker_positions`

| Column | Type |
|---|---|
| id | uuid PK |
| account_id | uuid FK broker_accounts |
| symbol | text |
| quantity | numeric(20,8) |
| avg_price | numeric(20,8) |
| market_value | numeric(20,4) |
| last_synced_at | timestamptz |

RLS: same pattern as `broker_accounts` via `public_broker_positions`.

### `broker_activities`

| Column | Type |
|---|---|
| id | uuid PK |
| account_id | uuid FK broker_accounts |
| type | text |
| symbol | text |
| quantity | numeric(20,8) |
| price | numeric(20,8) |
| occurred_at | timestamptz |

RLS: same pattern via `public_broker_activities`.

### `broker_visibility`

| Column | Type | Notes |
|---|---|---|
| user_id | uuid PK FK profiles | |
| show_positions | boolean default false | |
| show_balances | boolean default false | |
| show_activity | boolean default false | |
| show_broker_name | boolean default false | |
| updated_at | timestamptz | |

RLS:

- `select`: anyone (public views need to join it).
- `insert`/`update`: only `auth.uid() = user_id`.

Trigger:

- `maintain_verified_broker` — on insert/update of `broker_visibility` and on insert/update of `broker_connections`, recomputes `profiles.verified_broker`:
  - `true` iff the user has at least one `broker_connections.status = 'connected'` row AND any of the four visibility booleans is `true`.
  - `false` otherwise.

### `waitlist`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| email | citext UNIQUE | |
| source | text | e.g. `pricing`. |
| created_at | timestamptz | |

RLS:

- `insert`: anyone (rate-limited at the Route Handler `POST /api/waitlist`).
- `select`/`update`/`delete`: service role only.

### `subscriptions` *(scaffolded for V1, inactive)*

| Column | Type |
|---|---|
| id | uuid PK |
| user_id | uuid FK profiles |
| stripe_customer_id | text |
| stripe_subscription_id | text |
| status | text |
| current_period_end | timestamptz |

RLS: `select` only `auth.uid() = user_id`. Writes service role only (Stripe webhook). No `insert`/`update` policy for `authenticated`.

## Public views

To enforce visibility on broker data:

- `public_broker_accounts` — joins `broker_accounts` with `broker_visibility`. Exposes `account_name`; exposes `broker_name` only if `show_broker_name`; exposes `cached_balance` only if `show_balances`.
- `public_broker_positions` — joins via `broker_accounts → broker_visibility`. Returns rows only if `show_positions`.
- `public_broker_activities` — same pattern; rows only if `show_activity`.

Anonymous reads on profile and ticker pages go through these views.

## Indexes (selected)

- `videos (creator_id, published_at desc)`
- `videos (status, visibility)`
- `live_rooms (status, started_at desc)`
- `video_tickers (ticker_id)`
- `room_tickers (ticker_id)`
- `ticker_summaries (expires_at)`
- `tickers using gin (symbol gin_trgm_ops)` — autocomplete in upload form.

## Migrations

- One migration per change. Sequential numeric prefix.
- Append-only. Never edit a deployed migration. Add a follow-up migration.
- Generate types after every migration: `pnpm db:types` → `types/db.ts`.

## Schema non-goals (forbidden in V1)

These columns/tables must **not** be added in V1:

- `viewer_*_broker_*` — viewer brokerage tables.
- `orders`, `trades_executed`, `copy_trade_*`, `pool_*` — execution / pooled-capital tables.
- `chart_*`, `chart_layouts`, `chart_indicators` — chart terminal state.
- `viewer_accounts`, `follows`, `playlists`, `watch_history`, `bookmarks` — viewer-account tables.

If a task seems to need any of these, stop and reread `docs/project/non-goals.md`.
