# Frontend Routes (V1)

## Public routes

- `/` — home feed
- `/explore` — discovery feed
- `/live` — live directory
- `/v/[videoId]` — video watch
- `/room/[roomId]` — live room watch
- `/u/[handle]` — creator/community profile
- `/pricing` — community principles page
- `/setup` — integration/setup diagnostics
- `/sign-in` — auth entry
- `/privacy` and `/terms` — policy surfaces

## Creator studio routes

- `/studio` — overview
- `/studio/upload` — upload flow
- `/studio/videos` — manage videos
- `/studio/videos/[videoId]` — manage a single video
- `/studio/live` — create/manage live rooms
- `/studio/live/[roomId]` — studio room control
- `/studio/settings` — creator settings
- `/studio/analytics` — creator analytics

## API routes kept in pivot

- `/api/webhooks/mux`
- `/api/webhooks/livekit`
- `/api/livekit/viewer-token`

## Removed routes in social pivot

- `/t/[ticker]`
- `/studio/broker`
- `/api/market/quotes`
- `/api/cron/ticker-summaries`
- `/api/cron/news-summaries`
- `/api/cron/snaptrade-sync`
- `/api/webhooks/snaptrade`
- `/api/webhooks/stripe`
- `/api/waitlist`

