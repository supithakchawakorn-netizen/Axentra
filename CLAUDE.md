
This repo's shared brain is **`AGENTS.md`**. Read it first, every task.

## Skills (run these as procedures)

If the user request matches one of these, follow the playbook in `AGENTS.md` §11 step by step. Do not improvise the order.

- `build-page` — adding or changing a route under `app/`.
- `add-schema` — any DB change (table, column, enum, view, index, policy).
- `add-integration` — new external service or new endpoint of an existing service.
- `debug-regression` — failing test, bug report, Sentry incident.

## Quick pointers

- V1 scope and non-goals: `docs/project/scope-v1.md`, `docs/project/non-goals.md`
- Build order: `docs/project/roadmap.md`
- Routes: `docs/frontend/routes.md`
- DB and auth: `docs/backend/db-schema.md`, `docs/backend/auth-rules.md`
- UI rules: `docs/frontend/frontend-rules.md`
- AI features: `docs/product/ai-features.md`
- Brokerage link: `docs/product/creator-broker-link.md`

## Stop conditions

If a request would expand V1 scope (viewer accounts, viewer brokerage, trading, copy trading, follow-trade, pooled capital, native app, **any chart UI including sparklines**), stop and flag it instead of building it. See `AGENTS.md` §2 and §8.

## Default behaviors

- Server Components first; `"use client"` only when needed.
- Server Actions for app-internal mutations; Route Handlers only for webhooks, cron, and unauthenticated-client endpoints.
- Validate every external boundary with zod.
- Migrations for every schema change. Never edit a deployed migration.
- AI regeneration happens only in `/api/cron/*`; never on the read path.
- SnapTrade is read-only. Never import an order endpoint.
- No secret behind `NEXT_PUBLIC_*`.

## Commands

`pnpm dev | build | lint | typecheck | test | db:types | db:migrate | db:reset | format`
