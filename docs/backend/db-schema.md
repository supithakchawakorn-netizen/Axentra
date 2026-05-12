# Database Schema (V1 Social Pivot)

## Core identity/media tables

- `profiles`
- `videos`
- `live_rooms`
- `video_tickers` and `room_tickers` (transition layer used as topic tags)
- `comments` (if enabled in environment)

## New community/reputation tables

- `communities`
  - owner, slug, name, description
- `community_memberships`
  - member role and join state
- `community_posts`
  - community-authored discussion threads/posts
- `creator_reputation_scores`
  - `insight_quality`, `consistency`, `transparency`, `community_trust`

## Removed finance tables

- `broker_connections`
- `broker_accounts`
- `broker_positions`
- `broker_activities`
- `broker_visibility`
- `ticker_summaries`
- `ticker_news_summaries`
- `subscriptions`

## RLS model

- Default deny on all tables.
- Public read only on approved public surfaces.
- Authenticated writes scoped to owner/member rules.
- Reputation score updates scoped to creator ownership or service role pathways.

## Migration notes

- `0006_social_community_pivot.sql` introduces community/reputation tables.
- Existing ticker join tables remain as a compatibility layer during topic-tag transition.

