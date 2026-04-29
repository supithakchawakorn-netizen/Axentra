md# Creator brokerage link — read-only

Creators can connect a brokerage account through SnapTrade so viewers can verify their positions and activity. This is a **trust feature**, not a trading feature.

## Hard rules

1. **Read-only.** `lib/snaptrade/` exposes only read endpoints: accounts, balances, positions, activities. Order endpoints must not be imported or wrapped.
2. **Creator-only in V1.** Viewers cannot link brokerages.
3. **Creator controls visibility.** Connecting an account does not auto-publish anything. Each surface (positions, balances, activity, broker name) is gated by a creator toggle. Default is **off**.
4. **Verified badge** is shown publicly only when at least one account is connected *and* at least one visibility toggle is on. This is enforced by a trigger that maintains `profiles.verified_broker`.
5. **No follow-trade in V1.** Viewers cannot mirror trades. The eventual Premium follow-trade will use each viewer's own linked individual account, never pooled money. (See `docs/project/non-goals.md`.)

## Secret storage

- `snaptrade_user_secret` (and any future per-user broker secret) is stored in **Supabase Vault** (`vault.secrets`).
- `broker_connections.snaptrade_user_secret_id` references the Vault row by id. The plain text never lives in a regular column.
- Access pattern: server-side only, via the admin Supabase client, only from `/api/webhooks/snaptrade/*`, `/api/cron/snaptrade-sync/*`, and the Server Actions in `app/(creator)/studio/broker/_actions.ts`.

## Data model (see `db-schema.md` for full DDL)

- `broker_connections` — one row per creator + provider.
- `broker_accounts` — accounts inside a connection.
- `broker_positions` — current holdings, refreshed on sync.
- `broker_activities` — recent fills, refreshed on sync.
- `broker_visibility` — per-creator visibility toggles.
- Public reads go through the views `public_broker_accounts`, `public_broker_positions`, `public_broker_activities`, which join `broker_visibility` and only return rows the creator allowed.

## Flow

### Connect

1. Creator clicks "Connect brokerage" in `/studio/broker`.
2. Server Action `connectBrokerage` registers the SnapTrade user if needed, calls `loginSnapTradeUser`, and returns the hosted connect URL.
3. User completes the broker handshake on SnapTrade's hosted flow.
4. On webhook `/api/webhooks/snaptrade`, server marks `broker_connections.status = connected`, stores the user secret in Supabase Vault, and triggers an initial sync.

### Sync (read-only)

- Triggered by:
  - Webhook events (account-created, sync-needed).
  - Creator-triggered "Refresh".
  - Scheduled cron (`/api/cron/snaptrade-sync`): every 30 min for live creators, daily for others.
- Pulls accounts → balances → positions → recent activities. Writes through to `broker_*`. **Never** calls a SnapTrade order endpoint.

### Visibility

- Toggled per field in `/studio/broker`.
- Public surfaces (`/@[handle]`, `/v/[videoId]`, `/room/[roomId]`) read only from `public_broker_*` views.
- Toggling off hides immediately (no caching beyond Next route revalidation).

### Disconnect

- Server Action `disconnectBrokerage` calls SnapTrade to delete the user, deletes the Vault secret row, sets `status = disconnected`, and removes the verified badge via the trigger.
- Historical `broker_activities` are hard-deleted unless the creator explicitly opted to keep them (V1: always hard-delete; opt-in retention is a later feature).

## Public display rules

| Field | Where it shows | Default | Notes |
|---|---|---|---|
| Verified badge | profile, video, live room | on if connected + any toggle on | Tooltip explains "read-only verification". |
| Broker name (e.g. "IBKR") | profile | off | |
| Positions list | profile → Activity tab | off | Quantities + symbols, no $ unless balances also on. |
| Balances ($) | profile → Activity tab | off | Off by default for privacy. |
| Activity (recent fills) | profile → Activity tab | off | Time-windowed (e.g. last 30 days). |

## Security and privacy

- Vault for secrets (above). Service-role Supabase access restricted to webhook, cron, and broker Server Actions.
- Sentry scrubs SnapTrade request bodies and headers.
- A creator can request full data deletion from `/studio/settings` → danger zone, which cascades to all `broker_*` rows and the Vault secret.

## What this is **not**

- Not a chart terminal.
- Not a place to enter or modify orders.
- Not a fund. Axentra never holds, pools, or routes user funds. See `docs/project/non-goals.md`.
