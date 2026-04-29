md# AGENTS.md — Axentra repo brain

This file is the **single source of truth** for agentic coding in this repo. Claude Code, Cursor, and human contributors all read this first. `CLAUDE.md` and `.cursorrules` are pointers to this file.

If something here conflicts with a doc under `docs/`, fix the doc and keep this file authoritative for cross-cutting rules.

---

## 1. Mission (one paragraph)

Axentra is a web-first video and live platform for retail market commentary. Anyone can watch videos and live rooms without signing in. Creators sign in to publish, host live rooms, and (optionally) link a brokerage account read-only so viewers can verify their positions and performance. V1 is a media product, not a trading product.

---

## 2. Hard V1 boundaries (read this every time)

V1 ships:

- Homepage, public feed/explore, live directory, public ticker pages, creator profiles
- Creator auth (Google + email magic link)
- Creator studio (videos, upload, live, broker, settings)
- Video watch page (Mux), live room page (LiveKit)
- AI ticker / news summaries (OpenAI, cached, regenerated only via cron)
- Creator-side brokerage link (SnapTrade, **read-only**)
- Pricing page (UI only; Stripe scaffolded, no live Premium yet)
- Web only. PWA manifest is allowed; no React Native, no Capacitor, no native shells.

V1 **does not** ship:

- Viewer accounts, viewer sign-in, follows, playlists, watch history, bookmarks
- Viewer brokerage linking
- Trade execution of any kind
- Copy trading
- Follow-trade (planned later as Premium, **using each viewer's own linked individual account — never pooled money**)
- Pooled capital, fund-like products, anything that resembles managing money for others
- Native mobile apps
- Any chart UI: candles, indicators, watchlists, alerts, sparklines, mini-charts, drawing tools. **No chart library is to be added in V1.**
- Live chat written by anonymous users (chat-write rules below)

If a task asks for any of the above, **stop and flag it**. Do not silently expand scope.

See `docs/project/scope-v1.md` and `docs/project/non-goals.md` for the canonical list.

---

## 3. Stack and external services

| Concern | Choice | Notes |
|---|---|---|
| Framework | Next.js App Router + TypeScript | Server components by default. |
| Styling | Tailwind + shadcn/ui | No other UI libs. |
| Auth + DB | Supabase | Postgres, Auth, RLS, Storage, Vault. |
| VOD | Mux | Direct upload, signed playback for unlisted, public for listed. |
| Live | LiveKit | Cloud rooms; tokens minted server-side; recording via Egress. |
| Brokerage | SnapTrade | **Creators only. Read-only. No order endpoints used.** |
| Payments | Stripe | Wired but Premium features inactive in V1. |
| AI | OpenAI | Ticker and news summaries. Server-side. Cached. Regenerated via cron only. |
| Analytics | PostHog | **EU cloud** (single region across the project). Anonymous distinct IDs for viewers. |
| Errors | Sentry | Both server and client. Webhook bodies scrubbed. |
| Email | Resend | Transactional only in V1. |
| Hosting | Vercel | One project, preview branches per PR, Vercel Cron for scheduled jobs. |

Secrets live in `.env.local` (dev) and Vercel project env (prod). Never commit secrets.

### 3a. Env var taxonomy

| Prefix | Visibility | Use for |
|---|---|---|
| `NEXT_PUBLIC_*` | bundled to browser | Public URLs, public keys (Supabase anon, PostHog public key). |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | Admin client; webhook + cron only. |
| `MUX_*`, `LIVEKIT_API_*`, `SNAPTRADE_*`, `STRIPE_SECRET_*`, `OPENAI_API_KEY`, `RESEND_API_KEY` | server only | Service-side calls. |
| `CRON_SECRET` | server only | Header check on `/api/cron/*`. |
| `SENTRY_AUTH_TOKEN` | server only | Build-time source map upload. |

Hard rule: **a secret never lives behind `NEXT_PUBLIC_*`**. If you find one, treat it as a leak.

The full expected list is in `.env.example`. New services must update `.env.example` *and* this section in the same PR.

---

## 4. Repo layoutapp/                  # Next.js App Router
(public)/           # Anonymous-friendly routes
(auth)/             # Sign-in, callback
(creator)/studio/   # Auth-gated creator UI
api/                # Route handlers (webhooks, cron, public-client endpoints only)
components/
ui/                 # shadcn primitives (do not hand-edit generated files)
video/ live/ ticker/ creator/ layout/ shared/
lib/                  # Service clients and pure helpers
supabase/ mux/ livekit/ snaptrade/ stripe/ openai/ posthog/ sentry/ resend/ utils/
hooks/
types/                # Shared TS types and zod schemas
config/               # Static config (nav, plans, feature flags, disclaimers)
supabase/
migrations/         # SQL migrations, ordered, append-only
seed.sql
docs/                 # Authoritative product + engineering docs
tests/

Full route map: `docs/frontend/routes.md`. Page-by-page contents: `docs/product/page-map.md`.

---

## 5. Conventions

### TypeScript

- `strict: true`, `noUncheckedIndexedAccess: true`.
- No `any`. Use `unknown` + narrow.
- Zod for **every** external boundary: form input, Server Action input, webhook body, AI output, cron payload.
- Shared types in `types/`. DB types generated from Supabase into `types/db.ts`.

### React / Next

- **Default to Server Components.** Add `"use client"` only when needed (state, effects, browser APIs, event handlers).
- Data fetching in Server Components or Route Handlers. Never in client components for SSR-critical content.
- All public watch pages render on the server with SEO metadata (`generateMetadata`).

### Server Actions vs Route Handlers (decision rule)

Use **Server Actions** by default for:

- Any mutation initiated from inside the app (creator studio forms, broker connect, profile updates).
- Any read-after-write inside the app.

Use **Route Handlers** (`app/api/.../route.ts`) only for:

- Third-party webhooks (`/api/webhooks/*`).
- Vercel cron (`/api/cron/*`).
- Tokens/URLs needed by an unauthenticated public client (e.g. anonymous viewer LiveKit subscribe-token at `/api/livekit/viewer-token`).
- Cases where Server Actions don't fit (multipart streaming, third-party redirect endpoints).

There is **one** way to do each thing. If a task tempts you to add a Route Handler that mirrors an existing Server Action, don't — extend the action.

### Styling

- Tailwind utility-first. No CSS modules, no styled-components.
- Use shadcn/ui primitives; extend via `cva` variants in `components/ui/*`.
- Dark mode is the default; light mode supported. Theme via `next-themes`.

### Naming

- Files: `kebab-case.tsx` for components, `kebab-case.ts` for non-React modules.
- Components: `PascalCase`. Hooks: `useCamelCase`. Server Actions: `verbNoun` (e.g. `publishVideo`).
- DB tables: `snake_case`, plural (`videos`, `live_rooms`).
- Env vars: see §3a.

### Imports

- Absolute imports via `@/` (configured in `tsconfig.json`).
- One import group per source: std lib → third-party → `@/` → relative.

---

## 6. Commands

```bashpnpm dev              # next dev
pnpm build            # next build
pnpm start            # next start
pnpm lint             # eslint
pnpm typecheck        # tsc --noEmit
pnpm test             # vitest
pnpm db:types         # regen types/db.ts from Supabase
pnpm db:migrate       # apply migrations
pnpm db:reset         # local reset + seed
pnpm format           # prettier --write

CI runs `lint`, `typecheck`, `test`, `build` on every PR. PRs that don't pass cannot merge.

### Testing scope (V1)

- **Unit tests**: pure helpers in `lib/utils/`, all zod schemas, all prompt builders in `lib/openai/prompts/`.
- **Integration tests**: every webhook handler (signature verification + zod parse + idempotent write).
- **No E2E in V1.** Playwright/Cypress is deferred.

---

## 7. Where to find more

| Topic | Doc |
|---|---|
| Mission and audience | `docs/project/overview.md` |
| What's in V1 | `docs/project/scope-v1.md` |
| What's explicitly out | `docs/project/non-goals.md` |
| Build order | `docs/project/roadmap.md` |
| End-to-end user flows | `docs/product/user-flows.md` |
| Every page, what's on it | `docs/product/page-map.md` |
| Brokerage link rules | `docs/product/creator-broker-link.md` |
| AI summaries | `docs/product/ai-features.md` |
| UI patterns and rules | `docs/frontend/frontend-rules.md` |
| Route map | `docs/frontend/routes.md` |
| Database schema | `docs/backend/db-schema.md` |
| Auth and RLS | `docs/backend/auth-rules.md` |

---

## 8. Hard rules for agents

Do:

- Read `docs/project/scope-v1.md` and `docs/project/non-goals.md` before starting any non-trivial task.
- Prefer Server Components, then Server Actions, then Route Handlers in that order (see §5 decision rule).
- Add a migration for any schema change. Never edit a deployed migration.
- Validate all external inputs with zod and verify webhook signatures.
- Cache AI output in Postgres before returning. **Regeneration only happens in `/api/cron/*`** — never on the read path.
- Treat SnapTrade as **read-only**. Use only account read endpoints. Never import or wrap an order/trade endpoint.
- Rate-limit any unauthenticated POST endpoint with `lib/utils/rate-limit.ts` (token bucket keyed by IP + route).

Do not:

- Add viewer-side brokerage linking, trade execution, copy trading, follow-trade, pooled capital, or anything fund-like.
- Add any chart UI (candles, indicators, sparklines, mini-charts) in V1.
- Add a native app or React Native code.
- Bypass RLS by using the service role key from a client component or any non-webhook/non-cron route.
- Commit secrets, fixtures with real PII, or real brokerage tokens.
- Hand-edit shadcn/ui generated files; re-run the CLI and add a wrapper component instead.
- Put a secret behind `NEXT_PUBLIC_*`.

When in doubt: ask in the PR description, link the relevant doc, and stop.

---

## 9. Workflow

- Branch: `feat/...`, `fix/...`, `docs/...`, `chore/...`.
- Commits: Conventional Commits (`feat:`, `fix:`, etc.).
- One PR = one logical change.
- A PR that changes behavior must update the related doc in the same PR.
- A PR that adds a new external service must update `AGENTS.md` §3, §3a, and `.env.example`.

---

## 10. Security baseline

- All third-party webhooks verify signatures **before** parsing the body.
- All secrets server-side only. `NEXT_PUBLIC_*` vars are public; never put a secret behind that prefix.
- Supabase RLS on by default for every table. Default policy is deny.
- Sensitive long-lived tokens (e.g. `snaptrade_user_secret`) are stored using **Supabase Vault** (`vault.secrets`) and referenced by id from app rows. The plain text never lives in a regular table column.
- Sentry scrubs request bodies for `/api/webhooks/*` and any path that touches SnapTrade.
- No user-generated HTML rendered as `dangerouslySetInnerHTML`.

---

## 11. Skills (playbooks for Claude / Cursor)

Each skill is a fixed-shape procedure. When the user's request matches a skill, run it in order. Do not improvise the order.

### Skill: `build-page`

**Trigger**: "build page", "add page", "create route", or any change inside `app/`.

**Read first**: `docs/product/page-map.md`, `docs/frontend/routes.md`, `docs/frontend/frontend-rules.md`. If page reads from DB, also `docs/backend/db-schema.md`.

**Steps**:

1. Confirm V1 scope in `scope-v1.md`. If absent, stop.
2. Find the canonical file path in `routes.md`. Do not invent one.
3. Decide Server vs Client at the component level (state/effects → client; everything else server).
4. Implement `page.tsx` as a Server Component. Add `generateMetadata` if public.
5. Add `loading.tsx` and `error.tsx` for the segment.
6. Wire PostHog event(s) listed in `frontend-rules.md` §11.
7. If new data is read, confirm RLS allows it for the intended audience.
8. Update `page-map.md` if the page surface changes.
9. Run `pnpm lint && pnpm typecheck && pnpm test && pnpm build`.

**Done when**: SSR renders, RLS-respecting, has metadata + loading + error, all checks pass, doc updated.

**Pitfalls**: don't fetch from a client component for SSR content; don't call `admin.ts` from a page.

---

### Skill: `add-schema`

**Trigger**: any request that needs a new table, column, enum, view, index, or policy.

**Read first**: `docs/backend/db-schema.md`, `docs/backend/auth-rules.md`, `docs/project/non-goals.md`.

**Steps**:

1. Check `non-goals.md` for forbidden tables (`orders`, `pool_*`, `viewer_broker_*`, `chart_*`, etc.). If forbidden, stop.
2. Create migration `supabase/migrations/<timestamp>_<short_name>.sql`.
3. Define table → enable RLS → write policies → indexes → triggers (in that order).
4. Default RLS is deny. Add explicit `select`/`insert`/`update`/`delete` policies.
5. Apply locally: `pnpm db:reset`.
6. Regenerate types: `pnpm db:types`.
7. Update `db-schema.md` with the new shape and RLS intent.
8. If exposed publicly, also update `auth-rules.md`.

**Done when**: migration applies cleanly on a fresh DB, types regenerated, both docs updated, tests still pass.

**Pitfalls**: never edit a deployed migration; never add policies that allow `authenticated` to write to reference tables.

---

### Skill: `add-integration`

**Trigger**: new external service, or new endpoint of an existing one (new webhook, new SDK call surface).

**Read first**: `AGENTS.md` §3 + §3a, the relevant `lib/<service>/` folder, the relevant product doc (`creator-broker-link.md`, `ai-features.md`, etc.).

**Steps**:

1. Confirm in V1 scope. SnapTrade order endpoints are forbidden; do not add them under any framing.
2. If new service: update `AGENTS.md` §3, `§3a` env section, `.env.example`.
3. Add a typed client wrapper in `lib/<service>/`. Export only the methods used.
4. For every external boundary, define a zod schema in `types/<service>.ts`.
5. If webhook: `app/api/webhooks/<service>/route.ts` with signature verification first, zod parse second, service-role write third.
6. If cron: `app/api/cron/<task>/route.ts` with `CRON_SECRET` header check first.
7. If public-client endpoint (e.g. anonymous viewer token): rate-limit with `lib/utils/rate-limit.ts`.
8. Update the related product doc.

**Done when**: signature/secret verified, zod parse covers every field used, no service-role usage outside webhook/cron/scripts, doc updated, tests for the boundary added.

**Pitfalls**: don't put a service secret behind `NEXT_PUBLIC_*`; don't store long-lived third-party tokens in plain columns (use Supabase Vault).

---

### Skill: `debug-regression`

**Trigger**: bug report, failing test, Sentry incident, "this used to work".

**Read first**: failing log, the test, then the doc nearest the failing area.

**Steps**:

1. Reproduce locally. If you can't reproduce, stop and write down what's missing instead of guessing.
2. Check Sentry (release, breadcrumbs, request id).
3. Find the smallest commit range that introduced it (`git log -- <path>`, `git bisect` if needed).
4. Write a failing test that captures the regression — before the fix.
5. Make the minimal fix. Do not refactor on the same PR.
6. Run `pnpm lint && pnpm typecheck && pnpm test && pnpm build`. If schema-touching: `pnpm db:reset && pnpm db:types`.
7. Note the root cause in the PR description (one sentence).

**Done when**: regression test in place and passing, full check suite green, root cause documented, no unrelated changes.

**Pitfalls**: fixing the symptom and not the cause; expanding scope while debugging; muting an error instead of handling it.
