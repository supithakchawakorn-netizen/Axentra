# Auth rules — V1

Supabase Auth + Postgres RLS. RLS is the **primary** authorization layer. Server code does not bypass RLS except in narrowly scoped service-role paths.

## Who signs in

- **Creators only in V1.** Anyone who signs in becomes a `profiles` row and is treated as a creator.
- **Viewers do not sign in.** All public watch and discovery surfaces work anonymously.

## Sign-in methods

- Google OAuth.
- Email magic link (Supabase passwordless).

No password sign-in in V1.

## Files

- `lib/supabase/client.ts` — browser client. Cookies via `@supabase/ssr`.
- `lib/supabase/server.ts` — Server Component / Server Action client. Reads cookies; **respects RLS**.
- `lib/supabase/admin.ts` — service-role client. **Only** import in `app/api/webhooks/*`, `app/api/cron/*`, and trusted server scripts.
- `lib/supabase/middleware.ts` — refreshes session cookies in `middleware.ts`.

## Middleware

`middleware.ts`:

- Matches `/studio/:path*` and `/auth/callback`.
- Refreshes the Supabase session cookie.
- For `/studio/*`, if no session, redirects to `/sign-in?next=<path>`.
- Does **not** match `/api/webhooks/*` or `/api/cron/*`.

## Sign-in flow

1. User hits `/sign-in`.
2. Picks Google or email.
3. Google: redirect to Google → back to `/auth/callback?code=...`. Email: link in email → `/auth/callback?token_hash=...&type=email`.
4. `app/(auth)/callback/route.ts` exchanges the code for a session cookie.
5. Postgres trigger `handle_new_user` creates the `profiles` row on first sign-in.
6. Redirect to `next` if present, else `/studio`.

## Sign-out

Server Action `signOut()`:

```ts"use server";
const supabase = createServerClient();
await supabase.auth.signOut();
redirect("/");

## Roles

V1 has **one role**: signed-in user (≈ creator). No admin role surfaced in product. Admin operations happen via direct DB tools or scripts.

## RLS pattern

Default deny. Each table has explicit policies. Common patterns:

### Public-readable, owner-writable

```sqlalter table public.videos enable row level security;create policy "videos_public_select"
on public.videos for select
using (status = 'ready' and visibility = 'public');create policy "videos_owner_select"
on public.videos for select
using (auth.uid() = creator_id);create policy "videos_owner_insert"
on public.videos for insert
with check (auth.uid() = creator_id);create policy "videos_owner_update"
on public.videos for update
using (auth.uid() = creator_id)
with check (auth.uid() = creator_id);create policy "videos_owner_delete"
on public.videos for delete
using (auth.uid() = creator_id);

### Owner-only (sensitive)

`broker_connections`, `broker_accounts`, `broker_positions`, `broker_activities`:

- `select`/`insert`/`update`/`delete` only when `auth.uid() = user_id` (or `connection.user_id` via join check).
- Public reads happen through the `public_broker_*` views, which apply `broker_visibility` checks.

### Reference data

`tickers`, `ticker_summaries`, `ticker_news_summaries`:

- `select`: anyone.
- Writes: service role only.

## Service role usage

`lib/supabase/admin.ts` is the only place a service-role client is constructed. Allowed callers:

- `app/api/webhooks/*`
- `app/api/cron/*`
- Trusted server scripts in `scripts/`

Banned callers: any client component, any page Server Component, any Server Action triggered by user input.

## Server Action vs Route Handler — auth implications

- Server Actions: run with the user's session via `lib/supabase/server.ts`. RLS enforced. Default for app-internal mutations.
- Route Handlers: have no inherent session unless the request carries auth cookies. For public client endpoints (e.g. anonymous viewer LiveKit token), do **not** assume `auth.uid()`. Verify caller via:
  - Webhook signature, or
  - `CRON_SECRET` header, or
  - Rate limiting + caller-IP-based checks for unauthenticated public endpoints.

## Rate limiting

Every unauthenticated POST endpoint must use `lib/utils/rate-limit.ts` (token bucket keyed by IP + route).

Endpoints that require it in V1:

- `POST /api/livekit/viewer-token`
- `POST /api/waitlist`

Webhook and cron routes do not need IP rate limiting (signature/secret-gated), but should still be idempotent.

## Webhooks

Every webhook route:

1. Reads raw body.
2. Verifies signature with the provider's library (Mux, LiveKit, Stripe, SnapTrade).
3. Returns `401` if verification fails.
4. Parses body with zod.
5. Performs writes via `admin.ts`.
6. Returns `200` quickly; offload heavy work as needed.

## Cron

`app/api/cron/*`:

- First line: check `request.headers.get('x-cron-secret') === process.env.CRON_SECRET`. 401 otherwise.
- Use `admin.ts`.
- Idempotent on retry.
- Configured in `vercel.json`.

## Sessions and cookies

- `@supabase/ssr` only.
- Auth cookies httpOnly + Secure + SameSite=Lax.
- No long-lived JWTs in localStorage.

## Account deletion

- `/studio/settings` → "Delete account" → Server Action `deleteAccount`:
  - Calls SnapTrade `deleteSnapTradeUser` if a connection exists.
  - Deletes the corresponding Vault secret row.
  - Calls `admin.ts` to delete the auth user; FK cascades remove `profiles`, videos, live rooms, broker rows, etc.
  - Logs the deletion to an audit table (service role only).

## What auth does **not** do in V1

- No viewer accounts. No following. No bookmarks.
- No 2FA in V1 (revisit before viewer accounts ship).
- No SSO / enterprise IdPs.
- No invite-only or beta gating beyond the optional waitlist UI.

## Hard rules

- RLS is authoritative. If a Server Action *needs* to bypass RLS, the policy is wrong — fix the policy.
- Never expose the service role key in `NEXT_PUBLIC_*` or any client bundle.
- Never call `admin.ts` from a route that accepts user input without webhook signature or cron-secret verification.
- Never trust `auth.uid()` to be present in webhook or cron routes — there is no user session there.
- Every unauthenticated POST route must rate-limit before doing work.
