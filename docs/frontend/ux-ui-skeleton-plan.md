# UX/UI Skeleton Plan (Post-Platform Phase)

This plan assumes backend/platform scaffolding is in place and focuses on shipping a cohesive, production-grade frontend UX.

## 1) UX goals

- Clarify the anonymous viewer journey from discovery to trust signals.
- Reduce creator friction in upload/live/broker workflows.
- Normalize visual language across all public and studio surfaces.
- Improve conversion surfaces (creator signup, pricing waitlist).

## 2) Information architecture pass

- Re-evaluate top nav labels and ordering (`/`, `/explore`, `/live`, `/pricing`).
- Standardize page headers, breadcrumbs, and section hierarchy.
- Ensure profile tab IA (Videos / Live / Activity) is obvious and mobile-friendly.

## 3) Design system consolidation

- Define semantic token usage for status (`ready`, `live`, `error`, `processing`).
- Create reusable primitives for:
  - page header,
  - section header,
  - empty state,
  - badge/chip,
  - stats row,
  - error callout.
- Add consistent spacing/rhythm rules for `max-w-*` containers.

## 4) Core page UX refinements

- **Homepage:** stronger hierarchy for live strip vs videos vs top tickers.
- **Explore:** clearer filter affordances and active state chips.
- **Ticker page:** cleaner summary/news composition and recency cues.
- **Video page:** improve creator strip and metadata density.
- **Room page:** clarify live/scheduled/ended state transitions.
- **Profile:** improve tabs and verified-broker explanation text.

## 5) Studio UX refinements

- **Upload:** tighten field grouping, progress, and success states.
- **Videos:** improve row actions discoverability and edit dialog ergonomics.
- **Live:** improve start/end controls and room state messaging.
- **Broker:** guide users through connect → toggle visibility → public preview.
- **Settings:** stronger danger-zone safeguards and confirmation UX.

## 6) Accessibility hardening

- Keyboard and focus-state audit for all interactive controls.
- Color contrast audit for badges, chips, and muted text.
- Semantic heading order + landmark usage pass.
- Motion/animation restraint for reduced-motion users.

## 7) Performance and responsiveness

- Mobile-first polish for all public/studio pages.
- Reduce layout shifts in media-heavy surfaces.
- Add skeleton/loading patterns consistently on dynamic routes.

## 8) Instrumentation for UX outcomes

- Ensure key UX events are tracked and named consistently.
- Add event properties that support UX funnel analysis:
  - referrer context,
  - page section source,
  - CTA placement.

## 9) Execution sequence

1. Design system primitives and shared page scaffolds.
2. Public-surface UX pass (`/`, `/explore`, `/live`, `/t/[ticker]`, `/v/[videoId]`, `/room/[roomId]`, `/pricing`).
3. Studio UX pass (`/studio/*`).
4. Accessibility and responsive QA sweep.
5. Final polish + analytics validation.
