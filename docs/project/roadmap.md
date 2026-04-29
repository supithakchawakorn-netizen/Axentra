md# Roadmap — V1 build order

A practical, solo-founder-friendly build order for V1. Four milestones, each ending in something demoable. Strictly within V1 scope (`scope-v1.md`); nothing in `non-goals.md` shows up here, ever.

This doc is a build plan, not a spec. Specs live in the other docs and are referenced inline.

## Principles

- **Each milestone ends in a demo.** If a milestone doesn't put a real, working surface in front of a real user, it's structured wrong.
- **One way to do each thing.** New features reuse the patterns the previous milestone established (Server Actions for app mutations, Route Handlers for webhooks/cron only, RLS-first, zod at every boundary).
- **Apply for slow third-party access on day one.** SnapTrade production access in particular can take a while; submit the application at the start of M1 so it lands by M4.
- **Migrations are append-only** (`db-schema.md` §Migrations). Each milestone adds its own migration files; never edits prior ones.
- **Skill playbooks govern execution.** Use `build-page`, `add-schema`, `add-integration`, `debug-regression` from `AGENTS.md` §11 for every task.

## Out of every milestone (re-stated)

Nothing in `non-goals.md` appears in any milestone. Specifically: no viewer accounts, no viewer brokerage, no trade execution, no copy trading, no follow-trade, no pooled capital, no native app, **no chart UI of any kind including sparklines**, no anonymous chat writes.

---

## Milestone 1 — Watchable VOD

**Goal.** A creator can sign in, upload a video, and have an anonymous user watch it on a public page with SEO metadata. This is the smallest cut that's a real product.

**Why first.** Auth + DB + VOD pipeline are the load-bearing systems. Get them right once and everything later sits on top. Skipping live and AI keeps the integration surface small enough for one person to hold in their head.

### Pages

- `/` (`app/(public)/page.tsx`) — minimal homepage; "Recent videos" grid only. Live, tickers, featured creators are placeholders.
- `/sign-in` (`app/(auth)/sign-in/page.tsx`) — Google + magic link.
- `/auth/callback` (`app/(auth)/callback/route.ts`).
- `/studio` (`app/(creator)/studio/page.tsx`) — overview with quick actions.
- `/studio/upload` (`app/(creator)/studio/upload/page.tsx` + `_actions.ts`).
- `/studio/videos` (`app/(creator)/studio/videos/page.tsx` + `_actions.ts`).
- `/studio/settings` (`app/(creator)/studio/settings/page.tsx` + `_actions.ts`) — handle, display name, avatar. Full polish later.
- `/v/[videoId]` (`app/(public)/v/[videoId]/page.tsx` + `opengraph-image.tsx`).
- `/u/[handle]` (`app/(public)/u/[handle]/page.tsx` + `opengraph-image.tsx`) with `/@:handle` rewrite in `next.config.ts`.

### Backend / data

- Migrations `0000_init.sql` and `0001_profiles_videos_tickers.sql` (already written).
- Supabase Auth: Google OAuth + email magic link configured in the Supabase dashboard. `handle_new_user` trigger creates the `profiles` row.
- Server Actions in `_actions.ts` files: `createVideoUpload`, `editVideo`, `setVisibility`, `deleteVideo`, `updateProfile`.
- Route Handlers (only): `/api/webhooks/mux` for `video.asset.ready` and `video.asset.errored`.
- Middleware (`middleware.ts`) gating `/studio/:path*`.
- `lib/supabase/{client,server,admin,middleware}.ts`.
- `lib/mux/` typed wrapper exposing only direct-upload, asset-read, and webhook-verify methods.
- `lib/posthog/` initialized; events `creator_signup`, `creator_signin`, `video_upload_start`, `video_upload_complete`, `video_view`, `video_play`.

### Integrations

- Supabase (auth, db, storage for avatars).
- Mux (Direct Upload + signed/public playback + webhooks).
- Sentry (server + client, basic).
- PostHog (EU cloud, anonymous distinct ID).
- Resend or Supabase default SMTP for magic-link emails. Resend is preferred and configured as Supabase's custom SMTP provider.
- **Apply for SnapTrade production access now.** It will not be used until M4.

### Definition of done

- A new Google sign-in produces a `profiles` row with a sensible default handle.
- A creator uploads a video; Mux processes it; `videos.status` flips to `ready`; `published_at` is set by trigger.
- The video appears on `/u/[handle]` and at `/v/[videoId]` with full SEO metadata and OG image.
- An anonymous Chrome incognito session can watch the video without errors.
- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` are green.
- Sentry receives a deliberately thrown error from both server and client.
- PostHog records the M1 events from a real browser session.
- The Mux webhook is signature-verified and idempotent on retry (re-firing a ready event does not duplicate state).

### Out of scope for M1

Live, ticker pages, AI, broker, pricing, waitlist, full settings polish, account deletion. All deferred to later milestones.

---

## Milestone 2 — Live + discovery

**Goal.** A creator can go live; anonymous viewers can watch with subscribe-only access; the recording flows back to Mux as a VOD asset. Discovery surfaces (`/explore`, `/live`) become real.

**Why second.** Live is the second half of the format and the recording handover proves the VOD pipeline from M1 is robust. `/explore` and `/live` need video and live data, both of which now exist.

### Pages

- `/explore` (`app/(public)/explore/page.tsx`) — Recent / Popular / By ticker filter (ticker filter inert until M3).
- `/live` (`app/(public)/live/page.tsx`) — live directory.
- `/room/[roomId]` (`app/(public)/room/[roomId]/page.tsx`).
- `/studio/live` (`app/(creator)/studio/live/page.tsx` + `_actions.ts`).
- Update `/` to include the live-now strip.
- Update `/u/[handle]` to add the Live tab (scheduled / past).

### Backend / data

- Migration `0002_live_rooms.sql` — `live_rooms`, `room_tickers` (table created now even though tagging UI lands in M3), `live_rooms.recording_video_id` FK to `videos`, RLS, indexes.
- Server Actions: `createLiveRoom`, `endLiveRoom`, `inviteCoHost`.
- Route Handlers:
  - `POST /api/livekit/viewer-token` — anonymous subscribe-only, **rate-limited** via `lib/utils/rate-limit.ts`.
  - `/api/webhooks/livekit` — `room_started`, `room_finished`, `egress_ended`.
- Recording handover: on `egress_ended`, the webhook calls Mux "create asset from URL", inserts a `videos` row tied to the creator with `status = processing`, sets `live_rooms.recording_video_id`. The existing M1 Mux webhook flips status to `ready` when ingest completes — no duplicate code path.
- Chat write-gating: compose box hidden for anonymous viewers. Publisher tokens (creator + invited co-host) gate chat writes via LiveKit identity.

### Integrations

- LiveKit (rooms, tokens, Egress to S3).
- Mux (reused; create-asset-from-URL is the only new method added to `lib/mux/`).
- AWS S3 bucket for LiveKit Egress drop zone (configured once; not a code-level integration).

### Definition of done

- Creator schedules a room → goes live → `/live` lists it → an anonymous incognito session watches with audio + video.
- Compose box is **invisible** for the anonymous session. Creator can send chat. An invited co-host opening a one-time URL can also send chat.
- Stopping the stream sets `live_rooms.status = ended`. The Egress recording lands in S3 → LiveKit fires `egress_ended` → Mux ingests → the ended room page shows "Recording available" and links to `/v/[videoId]`.
- LiveKit and Mux webhooks are signature-verified and idempotent.
- Viewer-token endpoint rate-limits a flood from a single IP.
- PostHog: `live_directory_view`, `live_view`, `live_join`, `live_room_create`, `live_room_start`, `live_room_end` firing.

### Out of scope for M2

Ticker tagging, ticker pages, AI, broker, pricing, waitlist.

---

## Milestone 3 — Tickers + AI summaries

**Goal.** Ticker pages render for ~1k seeded symbols with an AI-generated summary, the videos and live rooms tagged with that ticker, and a daily news summary. Upload and live-creation flows can tag tickers. The product stops looking generic.

**Why third.** Tickers are the connective tissue. Adding them now means ticker pages, chips on every video/room, and discovery filters all light up at once. AI is added on a cache-only read path, so it's cheap to operate.

### Pages

- `/t/[ticker]` (`app/(public)/t/[ticker]/page.tsx` + `opengraph-image.tsx`) — header (text only, **no chart, no sparkline**), AI summary, news summary, live rooms, videos, top creators.
- Update `/studio/upload` to support ticker tagging (multi-select autocomplete against `tickers`).
- Update `/studio/live` to support ticker tagging on room creation.
- Update `/v/[videoId]` and `/room/[roomId]` to show ticker chips.
- Update `/` to include the top-tickers strip.
- Update `/explore` to make the "By ticker" filter functional.

### Backend / data

- Migration `0003_ticker_summaries.sql` — `ticker_summaries`, `ticker_news_summaries`, RLS, indexes on `expires_at` and `(ticker_id, as_of_date)`.
- Seed (`supabase/seed.sql`) — curated tickers. Start with S&P 500 + the next 200–500 most-talked-about US equities, plus handful of non-US (e.g. ASML, TSM). ~700–1000 rows is plenty for V1.
- Cron Route Handlers (`x-cron-secret` gated):
  - `/api/cron/ticker-summaries` — selects expired or missing rows, regenerates with concurrency cap.
  - `/api/cron/news-summaries` — daily; one row per `(ticker_id, today)`.
- `vercel.json` cron schedules: ticker summaries hourly, news summaries daily at a fixed UTC time.
- `lib/openai/` typed wrapper + `lib/openai/prompts/{ticker,news}.ts` versioned templates. Outputs validated with the zod schemas in `ai-features.md`.
- News provider: real provider if available; otherwise a typed mock fixture in `lib/news/mock.ts` returning seeded headlines per ticker. The cron consumes the same interface either way.
- Read path: ticker page reads cache-only — no inline regeneration ever.

### Integrations

- OpenAI (server-side, prompted, zod-validated, daily spend cap).
- Vercel Cron.
- News provider (real or mocked behind a stable interface).

### Definition of done

- Seed loads ~700+ tickers cleanly.
- Cron run regenerates ticker summaries for stale or missing rows; rows show `model` and `prompt_version`.
- A ticker page renders within 100ms server time when cache is warm; renders an empty state ("Summary not available yet") when cache is cold.
- Bumping a prompt version expires every row generated under the previous version on the next cron pass.
- A failed OpenAI call or zod-parse failure preserves the prior cached row and reports to Sentry.
- Daily news cron runs and inserts at most one row per `(ticker_id, as_of_date)`.
- Upload form's ticker tagging is autocomplete-driven (`pg_trgm` index from M1's migration). Selected tickers persist to `video_tickers`.
- PostHog: `ticker_view`, `home_view`, `explore_view` firing.

### Out of scope for M3

Broker, pricing, waitlist, account deletion, full settings polish.

---

## Milestone 4 — Trust + waitlist

**Goal.** Creators can connect a brokerage read-only via SnapTrade, choose what's visible per field, and earn a verified badge that appears on their profile / videos / rooms. Pricing page captures waitlist signups. Analytics and error monitoring reach full V1 coverage. V1 complete.

**Why last.** SnapTrade prod approval is the slowest external dependency; applying on day one of M1 means it's ready when this milestone starts. The verified badge needs a body of content (M1–M3) for the credibility loop to make sense. Pricing/waitlist is intentionally last so the page can describe a real product, not a sketch.

### Pages

- `/studio/broker` (`app/(creator)/studio/broker/page.tsx` + `_actions.ts`) — connect, visibility toggles, refresh, disconnect.
- `/pricing` (`app/(public)/pricing/page.tsx`) with "Join waitlist" form. Stripe checkout button rendered but disabled.
- Update `/u/[handle]` — add Activity tab (positions / balances / activity, each gated by `broker_visibility` via `public_broker_*` views), add verified badge.
- Update `/v/[videoId]` and `/room/[roomId]` — verified badge on creator strip.
- Update `/studio/settings` — danger zone: delete account.

### Backend / data

- Migration `0004_broker.sql` — `broker_connections`, `broker_accounts`, `broker_positions`, `broker_activities`, `broker_visibility`. Public views `public_broker_accounts`, `public_broker_positions`, `public_broker_activities`. `maintain_verified_broker` trigger on `broker_visibility` and `broker_connections` that maintains `profiles.verified_broker`. Vault extension enabled if not already.
- Migration `0005_waitlist_subscriptions.sql` — `waitlist`, scaffolded `subscriptions` (Stripe-shaped, no live policies that allow `authenticated` writes).
- Server Actions: `connectBrokerage`, `refreshBrokerage`, `setBrokerVisibility`, `disconnectBrokerage`, `deleteAccount`.
- Route Handlers:
  - `/api/webhooks/snaptrade` — connection lifecycle + sync hints.
  - `/api/webhooks/stripe` — scaffolded; verifies signature, parses, no-ops in V1 (no live products).
  - `/api/cron/snaptrade-sync` — every 30 min for currently-live creators, daily for others.
  - `POST /api/waitlist` — rate-limited, single-purpose insert.
- `lib/snaptrade/` exposes only read endpoints (`accounts`, `balances`, `positions`, `activities`). Order endpoints are not imported. This is reviewed in PR.
- Supabase Vault: `snaptrade_user_secret` stored as a Vault secret; `broker_connections.snaptrade_user_secret_id` references it.
- Sentry: scrubbing rule for `/api/webhooks/snaptrade` and any path under `/studio/broker`.
- PostHog: full event coverage from `frontend-rules.md` §11 — broker events + `waitlist_submit`.

### Integrations

- SnapTrade (read-only; production credentials).
- Stripe (scaffolded; no live products, no checkout enabled).
- Supabase Vault.
- Rate limiting on `POST /api/waitlist` and `POST /api/livekit/viewer-token` (the latter from M2; verify still in place).

### Definition of done

- A creator clicks "Connect brokerage", completes the SnapTrade hosted flow at a real broker, returns to `/studio/broker` and sees their account.
- Toggling `show_positions` makes positions appear on the public profile within one revalidation. Toggling it off hides them within one revalidation.
- The verified badge appears on `/u/[handle]`, `/v/[videoId]`, and `/room/[roomId]` only when the trigger condition holds (connected + at least one visibility toggle on).
- Cron sync refreshes `broker_*` rows on schedule and on creator-triggered "Refresh".
- Disconnect removes the Vault secret, clears `broker_*` rows for that connection, and removes the badge via the trigger.
- Delete account: cascades through `profiles` → all owned content; SnapTrade `deleteSnapTradeUser` is called first; Vault secret row is deleted; auth user is removed.
- `POST /api/waitlist` rejects bursts from a single IP. A duplicate email returns success-shaped (no leak about existing rows).
- Stripe webhook verifies signatures and 200s on a no-op; an integration test covers a sample webhook payload.
- A code review confirms no SnapTrade order endpoint is imported anywhere in the repo.
- All M1–M4 PostHog events firing in production. Sentry captures both server and client errors with proper scrubbing.
- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` green. Migrations apply cleanly on a fresh DB (`pnpm db:reset`).

### Out of scope for M4 (and V1 entirely)

Everything in `non-goals.md`. Notably: no live Premium subscriptions, no follow-trade UI or DB columns, no viewer-side broker linking, no chart UI.

---

## After V1

This roadmap intentionally stops at V1 done. Post-V1 candidates exist (viewer accounts, follow-trade with the strict rules in `non-goals.md`, monetization, native app) but those belong in a `roadmap-v2.md` written after V1 ships and after real usage exists to prioritize against. Do not pull post-V1 work forward into M1–M4.

## Cross-references

- Scope: `scope-v1.md`
- Non-goals: `non-goals.md`
- User flows per feature: `../product/user-flows.md`
- Pages and contents: `../product/page-map.md`
- Routes and file paths: `../frontend/routes.md`
- DB schema: `../backend/db-schema.md`
- Auth + RLS: `../backend/auth-rules.md`
- AI features: `../product/ai-features.md`
- Brokerage rules: `../product/creator-broker-link.md`
- Skill playbooks for execution: `../../AGENTS.md` §11
