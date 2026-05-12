# V1 monetization notes (gifts, donations, ads)

This document defines the V1 monetization milestone for Varg Packs.

## Purpose

Define the V1 monetization architecture for:

- viewer-to-creator donations,
- gift-based support mechanics,
- display and video ad delivery,
- creator-scoped ad-free entitlements unlocked by gifts.

Decisions locked:

- support both anonymous and account-based viewers,
- build display and video ads in parallel,
- ad-free unlock is creator-scoped (not platform-wide).

## Non-negotiable constraints

- No pooled capital, no fund-like behavior.
- No trade execution coupling.
- Payment settlement truth is webhook-first (never client-only fulfillment).
- Anonymous viewer flow remains first-class.

See `non-goals.md` for canonical constraints.

## 1) Product rules

### Donation vs gift rules

- **Donation**
  - Free-amount one-time support.
  - Optional short message.
  - Not ranked in live-room feed and no animated on-screen treatment.
  - Does not automatically grant ad-free unless policy explicitly enables it.
- **Gift**
  - Fixed SKU from gift catalog.
  - Optional short message.
  - Can appear in creator activity feed and live-room gift rail.
  - Can grant creator-scoped ad-free entitlement depending on SKU policy.

### Gift SKU baseline

Use server-side config (not client hardcoded) for pricing and entitlement policy.

| Tier | Example amount | Ad-free grant | Creator UX treatment |
|---|---:|---|---|
| micro | $1-$2 | none | feed entry only |
| standard | $5 | 24h creator-scoped | feed entry + mild highlight |
| support | $10 | 72h creator-scoped | feed entry + highlight |
| premium | $25+ | 7d creator-scoped | feed entry + featured card |

### Creator-visible UX constraints

- Creator can enable/disable gifts and donations independently.
- Creator can set message moderation mode: `auto`, `manual_review`, `off`.
- Gift feed must be rate-limited visually to avoid stream spam.
- No "pay to pin" claims in initial rollout.
- No implied investment guarantee or performance language in gift messaging.

## 2) Payment + entitlement contract

### Canonical settlement flow

1. Viewer initiates gift/donation checkout.
2. Server creates payment intent and stores `payment_attempt` row with idempotency key.
3. Provider webhook confirms settlement.
4. Webhook handler atomically:
   - marks payment settled,
   - writes ledger entry,
   - grants or extends entitlement (if eligible),
   - emits analytics and audit log.
5. Client polls or receives settled state through read path.

### Identity model

- **Account viewer**: `viewer_id` from authenticated user.
- **Anonymous viewer**: `anon_id` (signed, rotating token in secure cookie) plus payment receipt token.

Entitlements are keyed by:

- `subject_type`: `viewer` | `anon`,
- `subject_id`,
- `creator_id`,
- `entitlement_type` (`ad_free_creator`),
- `starts_at`, `ends_at`.

### Required state machines

- `payment_attempt.status`: `initiated -> pending -> succeeded | failed | expired`.
- `ledger_entry.status`: `posted | refunded | chargeback`.
- `entitlement.status`: `active | revoked | expired`.

### Revocation and extension rules

- Successful qualifying gift:
  - if no active entitlement, create one from now.
  - if active entitlement exists, extend from current `ends_at`.
- Refund/chargeback on qualifying gift:
  - revoke remaining entitlement window tied to that ledger source.
- Entitlement operations must be idempotent by provider event id.

### API and webhook surfaces

- `POST /api/monetization/checkout`
- `GET /api/monetization/checkout/:id`
- `POST /api/webhooks/payments`
- `POST /api/monetization/entitlements/recompute` (internal/admin/cron only)

All external boundaries must use zod validation.

## 3) Ad decision contract

### Purpose

Return deterministic ad policy for a request context so UI/player paths can render or suppress ads consistently.

### Decision input

- `subject` (`viewer` or `anon`) with resolved identity.
- `creator_id` for current content owner.
- `surface` (`home`, `explore`, `profile`, `video`, `live`, `ticker`).
- `placement_type` (`display`, `video_preroll`, `video_midroll`, `live_overlay`).
- request metadata (geo, device class, session id).

### Decision output

- `show_ads`: boolean.
- `suppression_reason`: nullable enum.
- `allowed_placements`: array.
- `frequency_cap_state`.
- `decision_ttl_seconds`.

### Suppression precedence

1. Policy/legal suppression.
2. Active creator-scoped ad-free entitlement.
3. Frequency cap suppression.
4. Default show.

### Creator-scoped ad-free behavior

- Suppress ads only when:
  - entitlement subject matches current viewer identity,
  - entitlement `creator_id` matches content creator,
  - current time is within entitlement window.
- Non-matching creators continue to show ads.

## 4) Phased delivery

### Phase A: donations + ad decision foundation

- Add donation entrypoints on video/live watch pages.
- Add `app/api/monetization/checkout/route.ts`, `app/api/webhooks/payments/route.ts`, `app/api/ads/decision/route.ts`.
- Add core schema migration for payment attempts, support ledger, and entitlements.

### Phase B: gift catalog + activity surfaces

- Add gift picker components on watch/live pages.
- Add creator-side gift controls in studio settings or monetization tab.
- Add gift catalog and grant schema.

### Phase C: video + display ad parallel rollout

- Add deterministic ad slots across public surfaces.
- Extend ad decision route for video/live placement types.
- Add impressions and decision audit schema.

### Phase D: account-based viewer experiences

- Add viewer support history and entitlement views for signed-in viewers.
- Keep anonymous checkout path fully supported.

### Phase E: creator monetization analytics + payout readiness

- Add creator monetization analytics in studio.
- Add payout rollups and reconciliation reports.

## 5) Risk controls before launch

### Fraud and abuse

- Token-bucket rate limit for unauthenticated monetization POST endpoints.
- Idempotency key required on checkout create.
- Webhook signature verification before parse/write.
- Replay defense with unique provider event table.
- Gift message abuse checks (length limits, URL/keyword policy, mute/block list).

### Integrity and reconciliation

- Daily reconciliation:
  - provider settled totals vs internal ledger totals,
  - entitlement grants vs qualifying gift rows.
- Drift alert thresholds and on-call ownership.
- Immutable audit logs for settlement and entitlement changes.

### Privacy and security

- No secrets in public env.
- Minimize PII retention for anonymous flow.
- Store only provider references, never raw card data.
- Sentry scrub rules for payment and webhook routes.

### Operational readiness gate

- Webhook idempotency verified with replay tests.
- Refund and chargeback revocation path verified.
- Ad suppression correctness verified for creator-scoped entitlements.
- Failure mode tested: ad decision service down defaults to safe policy.

