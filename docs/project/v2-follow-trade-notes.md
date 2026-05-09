# V2 follow-trade notes (post-V1)

This document is forward-looking only. It does not change V1 scope.

## Purpose

Define the minimum architecture and compliance guardrails for a future Premium
follow-trade capability where viewers mirror creator trades using their own
individual linked brokerage accounts.

## Non-negotiable constraints

- No pooled capital.
- No fund-like or managed-money structure.
- Varg Packs does not execute trades as principal/custodian.
- Execution happens through each viewer's own linked brokerage account.
- Follow-trade implementation starts only after V1 is shipped.

See `non-goals.md` for canonical constraints.

## Prerequisites before implementation

1. Viewer identity system (accounts, consent, authz model).
2. Viewer brokerage linking flow and secure credential lifecycle.
3. Risk and consent controls:
   - explicit opt-in per creator,
   - max allocation controls,
   - kill switch / pause / unfollow immediately.
4. Order intent and delivery audit trail:
   - creator action timestamp,
   - follower execution attempt timestamp,
   - broker response status.
5. PnL attribution model:
   - realized PnL basis,
   - fee/revenue-share trigger conditions,
   - dispute handling and reconciliation.

## Suggested phased rollout

- Phase 1: Viewer brokerage linking and account health checks only.
- Phase 2: Read-only "shadow follow" simulation (no order dispatch).
- Phase 3: Limited beta auto-follow with hard risk limits.
- Phase 4: Premium rollout with compliance-reviewed monetization logic.

## Engineering checklist (future)

- Add dedicated `roadmap-v2.md` after V1 ship.
- Define service boundaries for:
  - trade-intent ingestion,
  - follower-order fanout,
  - execution status collector,
  - reconciliation and payout ledger.
- Add incident runbooks for delayed execution and broker outages.
