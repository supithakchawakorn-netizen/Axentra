# Roadmap — V1 build order

A practical, solo-founder-friendly build order for V1. Five milestones, each ending in something demoable. Strictly within V1 scope (`scope-v1.md`); nothing in `non-goals.md` shows up here, ever.

This doc is a build plan, not a spec. Specs live in the other docs and are referenced inline.

## Naming alignment

To avoid ambiguity between roadmap milestones and product-stage shorthand:

- This document remains the canonical implementation path for repo **V1** (M1-M5).
- Product shorthand may refer to:
  - **V0 / Phase A** = M1 + M2 (watch + live foundation),
  - **V1** = full M1-M5 scope (including monetization),
  - **V2** = post-V1 viewer brokerage and follow-trade expansion.
- Any V2 follow-trade planning must remain outside this file and follow `non-goals.md` constraints until V1 is shipped.

## Current implementation snapshot

What exists now:

- Public routes for home, explore, live, ticker, video, room, creator profile, pricing, setup, and legal pages.
- Creator studio routes include overview, videos, upload, live, live detail, broker, settings, and analytics.
- Comment surfaces on watch/live pages are currently read-only demo UX in V1.
- Studio guest preview mode can be enabled for local UX iteration without auth.

Planned next (inside V1 hardening):

- Complete external provider credentials and webhook validation in deployed environments.
- Expand integration test depth and runbook execution in release workflow.
- Maintain strict non-goals boundaries (no trade execution, no viewer brokerage, no chart UI).

## Principles

- **Each milestone ends in a demo.** If a milestone doesn't put a real, working surface in front of a real user, it's structured wrong.
- **One way to do each thing.** New features reuse the patterns the previous milestone established (Server Actions for app mutations, Route Handlers for webhooks/cron only, RLS-first, zod at every boundary).
- **Apply for slow third-party access on day one.** SnapTrade production access in particular can take a while; submit the application at the start of M1 so it lands by M4.
- **Migrations are append-only** (`db-schema.md` §Migrations). Each milestone adds its own migration files; never edits prior ones.
- **Skill playbooks govern execution.** Use `build-page`, `add-schema`, `add-integration`, `debug-regression` from `AGENTS.md` §11 for every task.

## Out of every milestone (re-stated)

Nothing in `non-goals.md` appears in any milestone. Specifically: no viewer brokerage, no trade execution, no copy trading, no follow-trade, no pooled capital, no native app, **no chart UI of any kind including sparklines**, no anonymous chat writes.

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
- Proxy (`proxy.ts`) gating `/studio/:path*`.
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

## Milestone 4 — Trust foundation (broker + account lifecycle)

**Goal.** Creators can connect a brokerage read-only via SnapTrade, choose what's visible per field, and earn a verified badge that appears on their profile / videos / rooms. Account deletion and lifecycle hygiene are production-ready before monetization rollout.

**Why now.** SnapTrade prod approval is the slowest external dependency; applying on day one of M1 means it's ready when this milestone starts. The verified badge needs a body of content (M1–M3) for the credibility loop to make sense, and lifecycle hardening should land before paid support flows.

### Pages

- `/studio/broker` (`app/(creator)/studio/broker/page.tsx` + `_actions.ts`) — connect, visibility toggles, refresh, disconnect.
- `/pricing` (`app/(public)/pricing/page.tsx`) prepared for monetization policy content in M5.
- Update `/u/[handle]` — add Activity tab (positions / balances / activity, each gated by `broker_visibility` via `public_broker_*` views), add verified badge.
- Update `/v/[videoId]` and `/room/[roomId]` — verified badge on creator strip.
- Update `/studio/settings` — danger zone: delete account.

### Backend / data

- Migration `0004_broker.sql` — `broker_connections`, `broker_accounts`, `broker_positions`, `broker_activities`, `broker_visibility`. Public views `public_broker_accounts`, `public_broker_positions`, `public_broker_activities`. `maintain_verified_broker` trigger on `broker_visibility` and `broker_connections` that maintains `profiles.verified_broker`. Vault extension enabled if not already.
- Migration `0005_account_lifecycle.sql` — account-lifecycle and cleanup support required for safe monetization rollout.
- Server Actions: `connectBrokerage`, `refreshBrokerage`, `setBrokerVisibility`, `disconnectBrokerage`, `deleteAccount`.
- Route Handlers:
  - `/api/webhooks/snaptrade` — connection lifecycle + sync hints.
  - `/api/webhooks/stripe` — payment webhook foundation, signature-verified and idempotent.
  - `/api/cron/snaptrade-sync` — every 30 min for currently-live creators, daily for others.
- `lib/snaptrade/` exposes only read endpoints (`accounts`, `balances`, `positions`, `activities`). Order endpoints are not imported. This is reviewed in PR.
- Supabase Vault: `snaptrade_user_secret` stored as a Vault secret; `broker_connections.snaptrade_user_secret_id` references it.
- Sentry: scrubbing rule for `/api/webhooks/snaptrade` and any path under `/studio/broker`.
- PostHog: full event coverage from `frontend-rules.md` §11 for broker and account-lifecycle events.

### Integrations

- SnapTrade (read-only; production credentials).
- Stripe webhook foundation required for M5 gift/donation settlement.
- Supabase Vault.
- Rate limiting on unauthenticated POST routes (including `POST /api/livekit/viewer-token`) remains enforced.

### Definition of done

- A creator clicks "Connect brokerage", completes the SnapTrade hosted flow at a real broker, returns to `/studio/broker` and sees their account.
- Toggling `show_positions` makes positions appear on the public profile within one revalidation. Toggling it off hides them within one revalidation.
- The verified badge appears on `/u/[handle]`, `/v/[videoId]`, and `/room/[roomId]` only when the trigger condition holds (connected + at least one visibility toggle on).
- Cron sync refreshes `broker_*` rows on schedule and on creator-triggered "Refresh".
- Disconnect removes the Vault secret, clears `broker_*` rows for that connection, and removes the badge via the trigger.
- Delete account: cascades through `profiles` → all owned content; SnapTrade `deleteSnapTradeUser` is called first; Vault secret row is deleted; auth user is removed.
- Stripe webhook verifies signatures and idempotent event handling with integration test coverage.
- A code review confirms no SnapTrade order endpoint is imported anywhere in the repo.
- All M1–M4 PostHog events firing in production. Sentry captures both server and client errors with proper scrubbing.
- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` green. Migrations apply cleanly on a fresh DB (`pnpm db:reset`).

### Out of scope for M4

Everything in `non-goals.md`. Notably: no paid creator subscriptions, no paid live-room gating, no follow-trade UI or DB columns, no viewer-side broker linking, no chart UI.

---

## Milestone 5 — Monetization (gifts, donations, ads)

**Goal.** Viewers can support creators via donations and gifts, gifts can unlock creator-scoped ad-free windows, and display + video ad delivery runs with entitlement-aware suppression.

**Why now.** Monetization is added after the trust and content surfaces from M1-M4 are stable, so support actions happen on real watch/live volume rather than empty pages.

### Pages

- Update `/v/[videoId]` with donation and gift entrypoints.
- Update `/room/[roomId]` with live gift entrypoint.
- Update `/pricing` to explain gift tiers, donation policy, and creator-scoped ad-free behavior.
- Add creator monetization analytics surfaces in `/studio` (new section or tab).

### Backend / data

- Migration `0006_monetization_core.sql`:
  - `payment_attempts`,
  - `creator_support_ledger`,
  - `creator_ad_free_entitlements`,
  - idempotency constraints, indexes, and RLS.
- Migration `0007_monetization_gifts_ads.sql`:
  - `gift_catalog`,
  - `gift_grants`,
  - `ad_impressions`,
  - `ad_decisions_audit`,
  - payout rollup tables.
- Route Handlers:
  - `POST /api/monetization/checkout`,
  - `GET /api/monetization/checkout/:id`,
  - `POST /api/webhooks/payments`,
  - `POST /api/ads/decision`.
- Optional internal recompute endpoint:
  - `POST /api/monetization/entitlements/recompute` (cron/admin only).

### Integrations

- Stripe for payment intents and settlement webhooks.
- Ad provider(s) for display and video inventory.
- PostHog + Sentry coverage for monetization and ad-decision paths.

### Definition of done

- Anonymous viewer can complete a donation and see settled confirmation.
- Account viewer can complete a gift and see entitlement reflected in ad suppression behavior.
- Creator-scoped ad-free suppresses ads only on supported creator surfaces.
- Refund and chargeback flows revoke or adjust entitlements correctly.
- Webhook replay and idempotency tests pass.
- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` green.

### Out of scope for M5

- Paid creator subscriptions.
- Paid live-room gating.
- Platform-wide ad-free unlock from gifts.

---

## After V1

This roadmap intentionally stops at V1 done. Post-V1 candidates exist (viewer brokerage linking, follow-trade with the strict rules in `non-goals.md`, native app) but those belong in a `roadmap-v2.md` written after V1 ships and after real usage exists to prioritize against. Do not pull post-V1 work forward into M1–M5.

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
- V1 monetization notes: `./v1-monetization-notes.md`
- V2 follow-trade notes (post-V1): `./v2-follow-trade-notes.md`
- Skill playbooks for execution: `../../AGENTS.md` §11
