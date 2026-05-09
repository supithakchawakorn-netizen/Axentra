# User flows — V1

Step-by-step flows for the primary user journeys. Use these as the spec when building pages, server actions, and webhook handlers.

## 1. Anonymous viewer — discovers and watches a video

1. User lands on `/` (homepage).
2. Sees featured creators, trending videos, live-now strip, top tickers.
3. Clicks a video → `/v/[videoId]`.
4. Page server-renders with SEO metadata, Mux playback URL, creator strip, ticker chips.
5. Mux player streams. View is logged via PostHog (anonymous distinct ID).
6. User clicks a ticker chip → `/t/[ticker]`.
7. Ticker page shows AI summary + recent videos + live rooms tagged with that ticker.

No auth at any step.

## 2. Anonymous viewer — joins a live room

1. User lands on `/live` (live directory) or sees a live card on `/`.
2. Clicks a live card → `/room/[roomId]`.
3. Page calls Route Handler `POST /api/livekit/viewer-token` (rate-limited, no auth required) → returns a **subscribe-only** LiveKit token.
4. Page joins LiveKit, renders video grid + chat.
5. Chat behavior:
   - Anyone can read.
   - Compose box is **hidden** for anonymous viewers (no input, no error). They cannot send messages in V1.
6. PostHog logs `live_join` with anonymous distinct ID.

## 3. Anonymous viewer — reads a ticker page

1. User lands on `/t/[ticker]` (search, link, homepage).
2. Server fetches:
   - Cached AI summary from `ticker_summaries` (always returned from cache; regen is cron-only — see §AI).
   - Recent `videos` joined via `video_tickers`.
   - Currently-live `live_rooms` joined via `room_tickers`.
3. Page renders. Below-the-fold "news summary" component reads the latest `ticker_news_summaries` row.

No chart of any kind on this page.

## 4. Creator — signs in for the first time

1. User clicks "Sign in" → `/sign-in`.
2. Picks Google OAuth or email magic link.
3. Supabase Auth handles the round trip; callback at `/auth/callback`.
4. Postgres trigger `handle_new_user` creates a `profiles` row (handle suggested from email or Google name; user can change in settings).
5. User redirected to `/studio` overview with a "complete your profile" banner.

## 5. Creator — uploads a video

1. From `/studio` → **Upload**.
2. Form: title, description, ticker tags (autocomplete from `tickers`), thumbnail (optional), visibility (public / unlisted).
3. Server Action `createVideoUpload` (no Route Handler equivalent) calls Mux Direct Upload API → returns upload URL + asset placeholder + writes a pending `videos` row.
4. Browser uploads file directly to Mux (no proxy through our server).
5. Mux webhook (`/api/webhooks/mux`) updates `videos.status = ready` on `video.asset.ready`, stores `playback_id` and `duration_seconds`.
6. A trigger on `videos` sets `published_at = now()` when `status = ready` and `visibility = public` and `published_at is null`.
7. Creator sees the video in `/studio/videos`.

## 6. Creator — goes live

1. From `/studio` → **Live** → "Start a room".
2. Server Action `createLiveRoom` creates a `live_rooms` row (`status = scheduled`) and a LiveKit room.
3. Server mints a **publisher** token (publish + subscribe) for the creator.
4. Studio "Go live" page joins LiveKit, shows preview, controls for camera/mic/share.
5. On stream start (LiveKit `room_started` webhook → `/api/webhooks/livekit`), `live_rooms.status = live`. Broadcast appears on `/live` and on the creator profile.
6. Anonymous viewers see the room at `/room/[roomId]` with subscribe-only tokens (see §2).
7. Creator can invite a co-host via `/studio/live` → "Invite co-host" → server issues a one-time publisher token URL the co-host opens once. Co-hosts can write chat. **Anonymous viewers cannot.**
8. On stop, `live_rooms.status = ended`. Recording handover (§7) runs if recording was enabled.

## 7. Live recording handover (LiveKit → Mux)

1. When the creator enables recording, `createLiveRoom` calls LiveKit Egress to record the room to a configured S3 bucket.
2. On `egress_ended`, LiveKit posts to `/api/webhooks/livekit`.
3. Webhook handler (service role) calls Mux's "create asset from URL" with the S3 object URL, writes a `videos` row tied to the creator with `status = processing` and a back-reference `live_rooms.recording_video_id`.
4. Mux processes the asset → `video.asset.ready` → `/api/webhooks/mux` flips `videos.status = ready`.
5. Recording is now visible on the creator profile and on the ended room page as "Recording available".

## 8. Creator — links a brokerage (read-only)

See `docs/product/creator-broker-link.md`. High-level:

1. From `/studio` → **Broker**.
2. Click "Connect brokerage" → Server Action `connectBrokerage` calls SnapTrade to register the user (if needed) and returns the hosted connect URL.
3. Creator goes through SnapTrade hosted flow at their broker.
4. SnapTrade webhook (`/api/webhooks/snaptrade`) confirms link, server stores the SnapTrade `userSecret` in **Supabase Vault**, references it by id in `broker_connections`.
5. Creator returns to `/studio/broker`, sees connected accounts, picks visibility per field (positions, balances, activity, broker name).
6. A trigger on `broker_visibility` updates `profiles.verified_broker = true` if there is at least one connected account and at least one visibility toggle is on.
7. Read-only sync runs on schedule and on creator-triggered refresh.

## 9. Creator — manages content

- `/studio/videos`: list, edit metadata, change visibility, delete.
- `/studio/live`: schedule rooms, see past sessions and recordings.
- `/studio/settings`: handle, display name, avatar, bio, social links, notification prefs.

## 10. Viewer — sends donation or gift

1. Viewer visits `/v/[videoId]` or `/room/[roomId]` and taps "Support creator".
2. Viewer selects either:
   - donation (custom amount), or
   - gift SKU (fixed amount and optional ad-free grant).
3. Server creates a payment intent and returns checkout session details.
4. Payment provider webhook confirms settlement.
5. Server writes support ledger rows and grants/extends creator-scoped ad-free entitlement when eligible.
6. Viewer sees settlement success and support confirmation.

## 11. Viewer — receives creator-scoped ad-free after gift

1. Viewer lands on content by the same creator they supported.
2. Ad decision layer checks entitlement by subject id + creator id + time window.
3. If active, ads are suppressed only on that creator's surfaces.
4. Ads continue on other creators' surfaces unless separate entitlements exist.

## 12. Pricing and monetization policy

1. User visits `/pricing`.
2. Page explains donations, gift tiers, and creator-scoped ad-free rules.
3. Page links to support flow entrypoints and policy details.
