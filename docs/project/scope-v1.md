# Scope — V1

This document is the **canonical V1 scope** for the social pivot. If a feature is not on this list, treat it as out of scope.

## In V1

### Public surfaces

- **Homepage** (`/`) — trust-first discovery feed with category tabs, realtime community pulse, and recent creator content.
- **Explore feed** (`/explore`) — ranked content discovery optimized for contribution quality and reputation signals.
- **Live directory** (`/live`) — currently-live community rooms.
- **Community hubs** (`/c/[slug]`) — topic/community pages with posts, live rooms, and related videos.
- **Creator profile** (`/@[handle]`) — identity card, reputation panel, contributions, live sessions, and discussion context.
- **Video watch page** (`/v/[videoId]`) — player, creator context, contribution feedback, comments, and related content.
- **Live room page** (`/room/[roomId]`) — LiveKit viewer with chat/discussion and trust signals.

### Auth and identity

- **Sign-in** (`/sign-in`) — Google OAuth + email magic link.
- **Profiles** — handle, display name, bio, avatar/banner, social links, and reputation indicators.
- **Identity and trust** — profile-level contribution metrics and transparent reputation components.

### Creator and community tools

- **Studio** (`/studio`) with:
  - content upload (`/studio/upload`)
  - video management (`/studio/videos`)
  - live room management (`/studio/live`)
  - profile/settings (`/studio/settings`)
- **Community contribution signals**:
  - helpful/not-helpful feedback
  - consistency milestones
  - reputation component scoring (explainable, not a black box)

### Social interaction model

- **Read/write comments** on watch and live surfaces according to moderation policy.
- **Community participation** via posts, replies, and role-aware moderation.
- **Meaningful interaction** prioritized over vanity metrics.

### Cross-cutting

- Supabase auth + Postgres with RLS.
- Mux for VOD.
- LiveKit for live sessions.
- PostHog for analytics, Sentry for observability, Resend for transactional email.
- SEO metadata for public routes.
- Web only (PWA allowed), no native shells.
- Basic accessibility and rate limiting on unauthenticated POST endpoints.

## Out of V1

See `non-goals.md`. Anything not listed above is out.
