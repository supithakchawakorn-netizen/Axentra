md# Page map — V1

Every public and creator-facing page, what's on it, and what data it needs. Pair with `docs/frontend/routes.md` (file paths) and `docs/backend/db-schema.md` (data model).

Legend:
- 🌐 = anonymous, public
- 🔒 = creator auth required

---

## 🌐 `/` Homepage

- Hero strip: tagline + primary CTA "Explore".
- **Live now** — horizontal scroller (`live_rooms` where `status = 'live'`).
- **Trending videos** — grid (`videos` where `status = 'ready'`, ordered by recent view rate).
- **Featured creators** — `profiles` with `verified_broker = true` and recent activity.
- **Top tickers** — chips linking to `/t/[ticker]`.

## 🌐 `/explore`

- Filter bar: "Recent", "Popular", "By ticker".
- Grid of videos. Pagination or infinite scroll (server-rendered first page, client paginates after).

## 🌐 `/live`

- Grid of currently-live rooms, sorted by viewer count.
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
- Related videos (same creator + same tickers).

## 🌐 `/room/[roomId]`

- LiveKit viewer (subscribe-only token for anonymous; minted via `POST /api/livekit/viewer-token`).
- Chat panel:
  - Renders messages for everyone.
  - Compose box: **hidden** for anonymous viewers; visible only for the creator and creator-invited co-hosts (publisher token holders).
- Creator strip + verified-broker badge.
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

- Free vs Premium feature table.
- CTA: "Join waitlist" → `POST /api/waitlist`.
- Stripe checkout button visually present but **disabled** in V1 (no live products).

## 🌐 `/sign-in`

- Google OAuth button.
- Email magic-link form.
- Note: "Sign in is for creators. You don't need an account to watch."

## 🔒 `/studio`

- Video count, total watch time (Mux data).
- Live sessions count.
- Brokerage connection status.
- Quick actions: Upload, Go live, Connect broker.

## 🔒 `/studio/videos`

- Table: thumbnail, title, status, visibility, views, posted date.
- Row actions: edit, change visibility, delete (all Server Actions).

## 🔒 `/studio/upload`

- Form: title, description, ticker tags (multi-select against `tickers`), thumbnail, visibility (public/unlisted).
- Mux Direct Upload widget (URL minted by Server Action `createVideoUpload`).
- Status feedback during upload + processing.

## 🔒 `/studio/live`

- "Start a room" button.
- Scheduled rooms list (future-dated `live_rooms`).
- Past rooms list with recording links if `recording_video_id` is set and ready.
- "Invite co-host" generates a one-time publisher-token URL.

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
