# Webhook Replay Runbook

## Scope

- Mux: `/api/webhooks/mux`
- LiveKit: `/api/webhooks/livekit`
- SnapTrade: `/api/webhooks/snaptrade`
- Stripe: `/api/webhooks/stripe`

## Before replay

1. Validate webhook secret is configured for the provider.
2. Confirm signature verification still matches provider format.
3. Confirm idempotency behavior for target event type in tests.

## Replay procedure

1. Pull failed payload body and headers from provider dashboard.
2. Re-send payload to the webhook endpoint with original signature header when possible.
3. If signature cannot be reused, generate a new event from provider replay tooling.
4. Confirm webhook returns 200 and state changes exactly once.

## After replay

1. Validate Supabase row state for affected resources.
2. Confirm no duplicate rows were created.
3. Record incident note: event id, root cause, replay time, owner.
