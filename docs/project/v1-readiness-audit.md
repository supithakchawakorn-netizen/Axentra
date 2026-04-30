# V1 Readiness Audit

This audit summarizes where the current Axentra codebase stands for shipping V1 and what still needs hardening.

## Overall status

- **Product scope coverage:** mostly complete for V1 surfaces.
- **Engineering baseline:** strong (lint/typecheck/test/build green).
- **Production readiness:** **not fully complete yet**; core integrations still require real credentialed validation and operational hardening.

## What is solid now

- Public and creator route structure is in place per `docs/frontend/routes.md`.
- Mux + LiveKit pipeline is wired with signed webhooks and recording handoff.
- Ticker pages, tagging, and cron-based AI cache generation exist.
- Broker, pricing, waitlist, and visibility scaffolds exist.
- No chart UI shipped.
- No SnapTrade order endpoint wrapper exists under `lib/snaptrade/`.

## Critical remaining work before a real launch

1. **Real external integration verification**
   - Validate Mux, LiveKit, OpenAI, SnapTrade, Stripe, PostHog, Sentry with real envs.
   - Exercise webhook signatures end-to-end in deployed preview/prod environments.

2. **Database deployment verification**
   - Run migrations on a fresh Supabase project and confirm no policy or trigger regressions.
   - Regenerate strict `types/db.ts` from Supabase (`pnpm db:types`) and remove reliance on permissive placeholders.

3. **Security/compliance hardening**
   - Confirm Vault setup and real secret write/read lifecycle for SnapTrade.
   - Confirm all webhook paths are scrubbed in Sentry.
   - Confirm rate-limits for all unauthenticated POSTs in deployed environment.

4. **Operational readiness**
   - Add alerting/monitoring runbook for failed cron/webhook events.
   - Add retry/backoff + idempotency notes for every external boundary.
   - Validate Vercel cron schedules are active and secret-protected in production.

## Recommended gate to declare “launch-ready”

- `pnpm check` passes in CI.
- Fresh-db migration succeeds.
- Credentialed smoke tests pass for every external integration.
- Security checklist passes (secrets, webhook signatures, RLS, rate limits).
- Product walkthroughs pass for core flows:
  - creator signup/upload/watch,
  - go-live/watch/recording,
  - ticker browse + AI cache,
  - broker connect/visibility/disconnect,
  - waitlist submit.
