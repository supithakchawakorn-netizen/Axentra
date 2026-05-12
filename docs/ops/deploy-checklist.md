# Deploy Checklist

## Pre-deploy

1. Confirm `pnpm check` is green locally and in CI.
2. Confirm migration files are append-only and reviewed.
3. Confirm `.env.example` includes any new required environment variables.
4. Confirm route-level loading and error boundaries exist for changed surfaces.

## Deploy

1. Merge to `master`.
2. Wait for Vercel production deployment completion.
3. Verify Vercel env variables are present and not exposing secrets through `NEXT_PUBLIC_*`.

## Post-deploy smoke checks

1. Home, explore, live, ticker, watch, room pages return 200.
2. Creator studio preview mode loads with no crash.
3. `/api/cron/*` endpoints reject unauthorized requests.
4. Setup page integration matrix reflects expected service state.

## Rollback conditions

- Any webhook route returning sustained 5xx.
- AI cron route producing sustained failures.
- Auth middleware redirect loops.
