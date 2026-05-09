md# Scope — V1

This document is the **canonical V1 scope**. If a feature is not on this list, treat it as out of scope.

## In V1

### Public, no-login surfaces

- **Homepage** (`/`) — featured creators, trending videos, currently-live rooms, top tickers.
- **Explore / public feed** (`/explore`) — recent and trending videos with simple filters (recent, popular, ticker).
- **Live directory** (`/live`) — all currently-live rooms; sorted by viewer count.
- **Public ticker pages** (`/t/[ticker]`) — symbol header (text only, **no chart**), AI summary, recent videos and live rooms tagged with this ticker.
- **Creator profile** (`/@[handle]`) — bio, avatar, banner, social links, optional brokerage badge, video grid, scheduled live rooms. URL keeps the `@` via Next.js rewrite (see `routes.md`).
- **Video watch page** (`/v/[videoId]`) — Mux player, title, description, creator strip, ticker chips, related videos.
- **Live room watch page** (`/room/[roomId]`) — LiveKit viewer, **read-only chat for everyone except the creator and creator-invited co-hosts**, creator strip, ticker chips.
- **Pricing page** (`/pricing`) — monetization explainer for gifts/donations and creator-scoped ad-free policy.

### Creator surfaces (auth required)

- **Sign-in** (`/sign-in`) — Google OAuth + email magic link.
- **Creator studio** (`/studio`) — overview.
  - Videos list (`/studio/videos`).
  - Upload (`/studio/upload`) — Mux direct upload + metadata + ticker tagging.
  - Live (`/studio/live`) — schedule a room, get LiveKit credentials, go live, invite co-hosts (publisher tokens).
  - Broker (`/studio/broker`) — SnapTrade connect, manage visibility toggles, disconnect.
  - Settings (`/studio/settings`) — handle, profile, notification prefs.

### Live chat policy (V1)

- **Read**: anyone (anonymous included) sees chat messages.
- **Write**: only the creator and co-hosts the creator explicitly invited via a one-time publisher-token link.
- No anonymous chat writes. Viewer chat-write remains out of V1.

### AI features

- **Ticker summaries** — short, cached, AI-generated paragraph + bullet points on `/t/[ticker]`. Regeneration only via `/api/cron/ticker-summaries`.
- **News summaries** — daily AI-summarized headlines per ticker. Regeneration only via `/api/cron/news-summaries`.

### Creator brokerage link (read-only)

- SnapTrade connect flow.
- Read positions, balances, and recent activity windows. **No order endpoints used.**
- Creator chooses which fields are visible publicly. See `docs/product/creator-broker-link.md`.

### Creator monetization (V1)

- **Donations** — one-time support to creators from viewers (anonymous and account-based paths).
- **Gifts** — fixed SKU support actions that can grant creator-scoped ad-free windows.
- **Creator-scoped ad-free** — entitlement-based ad suppression on a specific creator's surfaces only.
- **Ad stack** — display and video ads with entitlement-aware suppression and frequency controls.
- **Settlement and entitlement lifecycle** — payment-intent create, webhook-confirmed settlement, idempotent ledger writes, entitlement grant/revoke.

### Cross-cutting

- Auth (Supabase) for creators only.
- Database (Supabase Postgres) with RLS on every table.
- Mux for VOD upload + playback.
- LiveKit for live rooms; LiveKit Egress for recording, handed off to Mux on completion.
- OpenAI for summaries (server-side, cached, cron-regenerated).
- PostHog (EU cloud) for analytics, Sentry for errors, Resend for transactional email.
- SEO: server-rendered metadata for all public pages.
- Web only. PWA manifest is acceptable. No native shells.
- Basic accessibility (semantic HTML, focus states, color contrast).
- Rate limiting on every unauthenticated POST endpoint.

## Out of V1

See `non-goals.md`. Anything not listed above is out.
