# Reputation Implementation Checklist

Execution checklist for the first trust/reputation rollout. This is the practical companion to `docs/product/reputation-strategy.md`.

## 1) Foundation and scope

- [x] Publish canonical strategy doc (`docs/product/reputation-strategy.md`).
- [x] Link strategy in repo brain (`AGENTS.md` docs table).
- [x] Keep implementation inside V1 boundaries (no chart UI, no trade execution, no follower loop).

## 2) Instrumentation

- [x] Add trust/reputation event constants in `lib/posthog/events.ts`:
  - `reputation_panel_view`
  - `reputation_component_view`
  - `content_helpful_vote`
  - `content_not_helpful_vote`
  - `creator_consistency_milestone` (reserved constant)
  - `trusted_creator_return_view` (reserved constant)
- [x] Add analytics matrix entries in `docs/frontend/analytics-audit-matrix.md`.

## 3) Reputation UI

- [x] Add creator reputation panel component with 4 explainable components:
  - Insight quality
  - Consistency
  - Transparency
  - Community trust
- [x] Add panel to creator profile page (`/@handle` surface).
- [x] Fire `reputation_panel_view` and `reputation_component_view` on panel mount.

## 4) Trust feedback loop

- [x] Add reusable helpfulness vote component with `Helpful` / `Not helpful`.
- [x] Wire votes to PostHog events (`content_helpful_vote`, `content_not_helpful_vote`).
- [x] Add vote module to video watch surfaces (desktop + mobile).
- [x] Add vote module to live room surfaces (desktop + mobile).
- [x] Include `content_type`, `content_id`, and inferred `market_category` in vote properties.

## 5) Ranking rollout

- [x] Add trust-weighted ranking mode behind `FEED_TRUST_RANKING_ENABLED`.
- [x] Keep fallback to existing deterministic heuristic when flag is off.
- [x] Add lightweight ranking diagnostics logging for top-ranked video/live items in trust mode.
- [x] Document environment toggle in `.env.example`.

## 6) Quality checks

- [x] Typecheck passes after implementation (`npm run typecheck`).
- [x] Lints for changed files are clean (IDE lint diagnostics).

## Status

All checklist items in this phase are implemented.

