# Routes — V1

App Router structure with file paths and notes. Pair with `docs/product/page-map.md` (content per page).

## Top-levelapp/
├── layout.tsx           # Root layout: fonts, providers (Theme, PostHog), <body>
├── globals.css
├── not-found.tsx
├── sitemap.ts
├── robots.ts
└── manifest.ts          # PWA manifest (web only)

## Public group `(public)`

Anonymous-friendly. Renders site shell with no auth requirements.app/(public)/
├── layout.tsx
├── page.tsx                    # /        Homepage
├── explore/page.tsx            # /explore
├── live/page.tsx               # /live
├── setup/page.tsx              # /setup
├── pricing/page.tsx            # /pricing
├── t/[ticker]/
│   ├── page.tsx                # /t/AAPL
│   └── opengraph-image.tsx
├── v/[videoId]/
│   ├── page.tsx                # /v/abc123
│   └── opengraph-image.tsx
├── room/[roomId]/page.tsx      # /room/xyz
└── u/[handle]/                 # See "Creator profile route" below
├── page.tsx
└── opengraph-image.tsx

### Creator profile route — `@handle` URLs

The folder `@[handle]` is **not used** because Next.js reserves leading `@` for parallel-route slots. Implementation:

- Underlying file path: `app/(public)/u/[handle]/page.tsx`.
- Public URL stays `/@grace` via a rewrite in `next.config.ts`:

```tsasync rewrites() {
return [
{ source: '/@:handle', destination: '/u/:handle' },
];
}
```

- Canonical link in metadata uses `/@<handle>` (the public form).
- The `u/` segment is internal. Do not link to it from UI.

### Public-page rendering rules

- `[ticker]` is uppercase-normalized server-side; lowercase requests redirect to canonical case.
- Ticker, video, and creator pages export `generateMetadata` and an `opengraph-image.tsx`.
- All public pages can be statically rendered with `revalidate` and tag-based revalidation on writes.

## Auth group `(auth)`app/(auth)/
├── layout.tsx                  # Minimal centered card layout
├── sign-in/page.tsx            # /sign-in
└── callback/route.ts           # /auth/callback

## Creator group `(creator)`

Auth-gated. `middleware.ts` redirects unauthenticated users hitting `/studio/*` to `/sign-in?next=...`.app/(creator)/
└── studio/
├── layout.tsx              # Studio shell (sidebar)
├── page.tsx                # /studio (overview)
├── videos/
│   ├── page.tsx            # /studio/videos
│   └── _actions.ts         # editVideo, setVisibility, deleteVideo
├── upload/
│   ├── page.tsx            # /studio/upload
│   └── _actions.ts         # createVideoUpload
├── live/
│   ├── page.tsx            # /studio/live
│   └── _actions.ts         # createLiveRoom, endLiveRoom, inviteCoHost
├── broker/
│   ├── page.tsx            # /studio/broker
│   └── _actions.ts         # connectBrokerage, refreshBrokerage, setVisibility, disconnectBrokerage
└── settings/
├── page.tsx            # /studio/settings
└── _actions.ts         # updateProfile, deleteAccount

## API routes `app/api/`

Only webhooks, cron, and unauthenticated-client endpoints. Anything callable from inside the app belongs in a Server Action (see `frontend-rules.md` §5).app/api/
├── livekit/
│   └── viewer-token/route.ts       # POST: subscribe-only token, rate-limited, no auth
├── waitlist/route.ts               # POST: pricing-page waitlist, rate-limited
├── cron/
│   ├── ticker-summaries/route.ts   # Vercel cron: regenerate stale ticker summaries
│   ├── news-summaries/route.ts     # Vercel cron: daily news summaries
│   └── snaptrade-sync/route.ts     # Vercel cron: refresh broker data
└── webhooks/
├── mux/route.ts                # asset.ready, asset.errored
├── livekit/route.ts            # room_started, room_finished, egress_ended
├── stripe/route.ts             # scaffolded; no live products in V1
└── snaptrade/route.ts          # connection status, sync hints

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

## Middleware

`middleware.ts`:

- Matches `/studio/:path*` and `/auth/callback`.
- Refreshes the Supabase session cookie via `lib/supabase/middleware.ts`.
- For `/studio/*`, if no session, redirect to `/sign-in?next=<path>`.
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
