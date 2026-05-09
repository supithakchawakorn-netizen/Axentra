# Page map — V1

Every public and creator-facing page, what's on it, and what data it needs. Pair with `docs/frontend/routes.md` (file paths) and `docs/backend/db-schema.md` (data model).

Legend:
- 🌐 = anonymous, public
- 🔒 = creator auth required in production
- 👀 = guest/preview mode available in local development

---

## 🌐 `/` Homepage

- Hero strip: tagline + primary CTA "Explore".
- Continue-watching rail (client-side session resume from local watch history).
- **Live now** — horizontal scroller (`live_rooms` where `status = 'live'`).
- **Trending videos** — grid (`videos` where `status = 'ready'`, ordered by recent view rate).
- **Featured creators** — `profiles` with `verified_broker = true` and recent activity.
- **Top tickers** — chips linking to `/t/[ticker]`.
- **Market tape** — top strip with demo/provider market quote snapshots.

## 🌐 `/explore`

- Search + ranked feed of videos and live rooms.
- Continue-from-session rail for previously watched videos.
- Experiment instrumentation for surface quality signals.

## 🌐 `/live`

- Grid of currently-live rooms, ranked by heuristic feed score.
- Empty state when nothing is live.

## 🌐 `/t/[ticker]`

- Header: symbol + name + sector. **No chart, no sparkline.**
- **AI summary** — paragraph + bullets (read-only from `ticker_summaries`; regen is cron-only).
- **News summary** — bullet list (read-only from `ticker_news_summaries`).
- **Live rooms tagged with this ticker**.
- **Recent videos tagged with this ticker** — grid.
- **Top creators on this ticker** — by recent post volume.

## 🌐 `/v/[videoId]`

- Mux player.
- Title, description, posted date.
- Creator strip: avatar, handle, verified-broker badge if applicable.
- Ticker chips → `/t/[ticker]`.
- Gift / donation entrypoint for supporting the current creator.
- Session continuity: stores watch progress locally and surfaces "continue watching" rail.
- Related videos (same creator + same tickers).
- Comment section (read-only in V1; compose area disabled).

## 🌐 `/room/[roomId]`

- LiveKit viewer (subscribe-only token for anonymous; minted via `POST /api/livekit/viewer-token`).
- Chat panel:
  - V1 currently renders demo/read-only comments.
  - Compose box is disabled in public mode.
- Creator strip + verified-broker badge.
- Gift entrypoint optimized for live support moments.
- Ticker chips.
- States: "Joining" (token request), "Live", "Ended" (with link to recording when ready).

## 🌐 `/@[handle]` Creator profile

- URL keeps `@`; routed via `next.config.ts` rewrite from `/@:handle` to the underlying `/u/:handle` segment.
- Banner + avatar.
- Bio + social links.
- **Verified-broker badge** + tooltip explaining "read-only verification".
- Tabs: Videos, Live (scheduled / past), Activity (read-only brokerage view, only fields the creator opted to expose).
- Empty states for each tab.

## 🌐 `/pricing`

- Monetization policy table (donations, gift tiers, creator-scoped ad-free windows).
- Gift and donation FAQ (entitlement duration, refund behavior, creator-only ad suppression).
- CTA links to support flow entrypoints and creator monetization explainer.

## 🌐 `/setup`

- Integration checklist for switching from demo data to real services.
- Per-service status: configured vs missing (derived from env presence).
- Official setup links (Supabase, Mux, LiveKit, OpenAI, PostHog, Sentry, Resend).
- Required env var list per integration.
- "What I need from you next" callout for the first missing required integration.
- UX lab + experiment leaderboard + admin control center diagnostics.

## 🌐 `/sign-in`

- Google OAuth button.
- Email magic-link form.
- Note: "Sign in is for creators. You don't need an account to watch."

## 🔒👀 `/studio`

- Video count, total watch time (Mux data).
- Live sessions count.
- Brokerage connection status.
- Quick actions: Upload, Go live, Connect broker.
- Mobile quick-action grid for one-tap navigation to upload/live/videos/analytics/broker/settings.
- Guest preview mode shows demo data and read-only controls without auth.

## 🔒👀 `/studio/videos`

- Table: thumbnail, title, status, visibility, views, posted date.
- Row actions: edit, change visibility, delete (all Server Actions).
- In preview mode, actions are hidden and demo rows are rendered.

## 🔒👀 `/studio/upload`

- Form: title, description, ticker tags (multi-select against `tickers`), thumbnail, visibility (public/unlisted).
- Mux Direct Upload widget (URL minted by Server Action `createVideoUpload`).
- Status feedback during upload + processing.
- Includes creator guidance block for faster publish flow.

## 🔒👀 `/studio/live`

- "Start a room" button.
- Scheduled rooms list (future-dated `live_rooms`).
- Past rooms list with recording links if `recording_video_id` is set and ready.
- "Invite co-host" generates a one-time publisher-token URL.
- In preview mode, displays a read-only control preview.

## 🔒👀 `/studio/analytics`

- Creator KPI summary cards.
- Top video and live performance blocks.
- Audience behavior and retention heuristics.
- Action recommendations based on engagement metrics.

## 🔒 `/studio/broker`

- "Connect brokerage" CTA if not connected.
- Connected state:
  - Broker name(s) + account count.
  - Field-level visibility toggles (show positions, show balances, show activity, show broker name).
  - "Refresh now" button.
  - "Disconnect" button.
- Help text: read-only; nothing public until visibility toggles are set.

## 🔒 `/studio/settings`

- Handle (with availability check).
- Display name, avatar, banner, bio.
- Social links.
- Notification preferences (transactional only in V1).
- Danger zone: delete account.
