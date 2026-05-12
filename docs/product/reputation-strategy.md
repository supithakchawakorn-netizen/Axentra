# Reputation Strategy (V1 -> V2)

This document converts the product thesis into an execution spec for Varg Packs.

## Core thesis

Varg Packs is not a generic content platform.

Content (video + live) is the vehicle. The product moat is:

- reputation
- identity
- belonging
- credibility
- trust-based interaction

## Product philosophy

Most social products optimize for session depth ("keep users scrolling").

Varg Packs optimizes for trust depth ("help users trust who they watch and return to credible creators").

## Reputation definition (canonical)

**Reputation on Varg Packs = proven market insight + consistency + integrity over time.**

This definition drives ranking, profile UX, creator incentives, moderation, and monetization.

## What reputation is not

- Not follower count.
- Not vanity engagement spikes.
- Not sensational content volume.
- Not paid reach.

## Reputation model (V1)

Use explainable components instead of one opaque score.

### Component scores

1. **Insight quality (40%)**
   - Viewer helpfulness feedback (`helpful` / `not_helpful`) on watch and live surfaces.
   - Optional quality moderators in V2: watch completion quality thresholds.

2. **Consistency (25%)**
   - Publishing cadence and live-room reliability over rolling windows (30d, 90d).
   - Penalize long inactivity after frequent posting.

3. **Transparency (20%)**
   - Verified broker status and stable disclosure surfaces.
   - Rewards clarity, not performance claims.

4. **Community trust (15%)**
   - Low moderation incident rate.
   - Positive creator interaction quality.

### UX requirement

Show reputation as a **4-part panel** (bars + labels + trend) rather than a single black-box number.

## Ranking policy (V1)

Feed ranking should treat trust as primary and popularity as secondary.

Suggested weighted blend:

- Reputation components: 60%
- Freshness/recency: 20%
- Session relevance (ticker + watch history): 15%
- Popularity: 5%

Guardrails:

- Never hard-block new creators from discovery.
- Use a "new creator exposure floor" in explore/live ranking.

## Psychological loops to build

1. **Identity loop**: creator profile reflects who they are and how they think.
2. **Contribution loop**: useful teaching and analysis earn visible recognition.
3. **Reputation loop**: useful + consistent creators gain distribution advantages.
4. **Tribe loop**: users return because their niche market community is here.
5. **Progress loop**: visible milestones make growth emotionally sticky.

## UX implications

### Home and discovery

- Keep category-first navigation (`Stock`, `Forex`, `Crypto`) with realtime context.
- Prioritize "credible now" creators over pure trend spikes.
- Show trust cues inline on cards (verified badge, consistency marker, helpfulness rate in V2).

### Creator profile

- Add a dedicated reputation block:
  - insight quality
  - consistency
  - transparency
  - community trust
- Show trend direction over 30d.

### Watch/live pages

- Add lightweight post-session feedback:
  - "Was this useful?" yes/no
- Keep interaction low-friction and non-spammy.

## Monetization alignment

Monetization should reinforce trust, not distort it.

- Donations/gifts should not buy distribution.
- Creator-scoped ad-free remains entitlement logic only.
- Future paid surfaces should use reputation prerequisites (not follower thresholds).

## Moderation alignment

Moderation should protect trust signals from gaming.

- Detect engagement manipulation patterns.
- Weight repeated bad-faith behavior into community-trust component.
- Ensure moderation outcomes are auditable and explainable.

## Analytics event additions (proposed)

Add these events to `lib/posthog/events.ts` and audit matrix when implemented:

- `reputation_panel_view`
- `reputation_component_view`
- `content_helpful_vote`
- `content_not_helpful_vote`
- `creator_consistency_milestone`
- `trusted_creator_return_view`

Event property guidelines:

- No PII.
- Include `content_type` (`video` | `live`) and `market_category` (`stock` | `forex` | `crypto`) where relevant.
- Include `creator_id` only if already accepted by analytics policy.

## 30-day implementation plan

### Week 1: Definition + instrumentation

- Lock metric definitions and formulas.
- Add event constants and instrumentation stubs.
- Publish this doc and align team language.

### Week 2: Reputation UI foundation

- Add profile reputation panel with 4 components.
- Add placeholders where scores are not yet available.

### Week 3: Ranking integration

- Add trust-weighted ranking blend behind a feature flag.
- Log rank-factor diagnostics server-side for audits.

### Week 4: Controlled rollout

- Run A/B test: trust-weighted feed vs current blend.
- Evaluate retention, repeat view rate, and moderation quality deltas.

## Success metrics

- 7-day repeat viewer rate by creator cohort.
- Creator 30-day retention.
- Helpfulness vote ratio.
- Moderation incident rate per 1,000 sessions.
- % watch time on trusted/verified creators.

## Positioning language

Primary line:

**Build market credibility, not followers.**

Alternates:

- "Communities built on trust."
- "Your market identity with proof."
- "Reputation over reach."

## Scope guardrails

This strategy must stay inside V1 boundaries:

- No chart UI additions.
- No trade execution.
- No viewer brokerage linking in V1.
- No follower-first product loop design.

