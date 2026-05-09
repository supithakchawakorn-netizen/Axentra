# Routes — V1

App Router structure with file paths and notes. Pair with `docs/product/page-map.md` (content per page).

## Top-level

`app/`
- `layout.tsx` — Root layout: fonts, providers (Theme, PostHog), body shell
- `globals.css`
- `not-found.tsx`
- `global-error.tsx`
- `sitemap.ts`
- `robots.ts`
- `manifest.ts` — PWA manifest (web only)

## Public group `(public)`

Anonymous-friendly. Renders site shell with no auth requirements.

`app/(public)/`
- `layout.tsx`
- `page.tsx` — `/` homepage
- `explore/page.tsx` — `/explore`
- `live/page.tsx` — `/live`
- `setup/page.tsx` — `/setup`
- `pricing/page.tsx` — `/pricing`
- `privacy/page.tsx` — `/privacy`
- `terms/page.tsx` — `/terms`
- `risk-disclaimer/page.tsx` — `/risk-disclaimer`
- `t/[ticker]/page.tsx` — `/t/AAPL`
- `v/[videoId]/page.tsx` — `/v/<id>`
- `room/[roomId]/page.tsx` — `/room/<id>`
- `u/[handle]/page.tsx` — internal route backing `/@<handle>`

### Creator profile route — `@handle` URLs

The folder `@[handle]` is **not used** because Next.js reserves leading `@` for parallel-route slots. Implementation:

- Underlying file path: `app/(public)/u/[handle]/page.tsx`.
- Public URL stays `/@grace` via a rewrite in `next.config.ts`:

```ts
async rewrites() {
  return [{ source: "/@:handle", destination: "/u/:handle" }];
}
```

- Canonical link in metadata uses `/@<handle>` (the public form).
- The `u/` segment is internal. Do not link to it from UI.

### Public-page rendering rules

- `[ticker]` is uppercase-normalized server-side; lowercase requests redirect to canonical case.
- Ticker, video, and creator pages export `generateMetadata` and an `opengraph-image.tsx`.
- All public pages can be statically rendered with `revalidate` and tag-based revalidation on writes.

## Auth group `(auth)`

`app/(auth)/`
- `layout.tsx` — minimal centered card layout
- `sign-in/page.tsx` — `/sign-in`
- `callback/route.ts` — `/auth/callback`

## Creator group `(creator)`

Creator studio routes. In local/dev flows, guest preview mode can allow read-only studio access without sign-in.

`app/(creator)/studio/`
- `layout.tsx` — studio shell + preview/auth mode banner
- `page.tsx` — `/studio`
- `analytics/page.tsx` — `/studio/analytics`
- `videos/page.tsx` + `_actions.ts` — `/studio/videos`
- `upload/page.tsx` + `_actions.ts` — `/studio/upload`
- `live/page.tsx` + `_actions.ts` — `/studio/live`
- `live/[roomId]/page.tsx` — `/studio/live/<roomId>`
- `broker/page.tsx` + `_actions.ts` — `/studio/broker`
- `settings/page.tsx` + `_actions.ts` — `/studio/settings`

## API routes `app/api/`

Only webhooks, cron, and unauthenticated-client endpoints. Anything callable from inside the app belongs in a Server Action (see `frontend-rules.md` §5).

`app/api/`
- `livekit/viewer-token/route.ts` — POST subscribe-only token, rate-limited
- `waitlist/route.ts` — POST pricing waitlist, rate-limited
- `market/quotes/route.ts` — market data proxy (demo/provider mode)
- `cron/ticker-summaries/route.ts` — regenerate stale ticker summaries
- `cron/news-summaries/route.ts` — daily ticker news summaries
- `cron/snaptrade-sync/route.ts` — broker sync
- `webhooks/mux/route.ts` — Mux events
- `webhooks/livekit/route.ts` — LiveKit events
- `webhooks/stripe/route.ts` — scaffolded
- `webhooks/snaptrade/route.ts` — SnapTrade connection lifecycle

Removed (intentionally) compared to earlier draft: `/api/mux/upload`, `/api/livekit/token` (creator), `/api/snaptrade/connect`, `/api/ai/*`. These are Server Actions or read-from-cache, not Route Handlers.

### Webhook rules

- Verify signature **before** parsing the body (return 401 on failure).
- Parse with zod.
- Use the Supabase service-role client (only here and in cron / trusted server scripts).
- Idempotent on retry.
- Return 2xx fast; offload heavy work as needed.

### Cron rules

- Header check: `x-cron-secret` must equal `process.env.CRON_SECRET`. 401 otherwise.
- Idempotent: re-running must not double-write.
- Configured in `vercel.json` with cron schedules.

## Proxy

`proxy.ts`:

- Matches `/studio/:path*` and `/auth/callback`.
- Refreshes the Supabase session cookie via `lib/supabase/middleware.ts`.
- For `/studio/*`, redirect behavior is controlled by studio guest preview mode.
- Does **not** match `/api/webhooks/*` or `/api/cron/*` (those handle auth via signatures / cron secret).

## Route conventions

- One default-exported component per `page.tsx`.
- `_actions.ts` files (underscore-prefixed) hold Server Actions for the adjacent page; not routable.
- `not-found.tsx` and `error.tsx` per segment where useful.
- Dynamic segments validated server-side; bad inputs → `notFound()`.
- Public pages add `export const revalidate = N` where appropriate; on writes, call `revalidateTag(...)` from the Server Action.

## Out of scope

- No `pages/` directory.
- No catch-all marketing routes.
- No locale segments — V1 is English-only.
- No native shell wrappers.
