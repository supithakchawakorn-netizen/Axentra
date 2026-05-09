# Analytics Audit Matrix (V1)

Use this matrix to keep `docs/frontend/frontend-rules.md` event requirements aligned with implementation.

## View events

| Event | Current emitter | Status |
|---|---|---|
| `home_view` | `app/(public)/page.tsx` via `PageViewEvent` | Implemented |
| `explore_view` | `app/(public)/explore/page.tsx` via `PageViewEvent` | Implemented |
| `live_directory_view` | `app/(public)/live/page.tsx` via `PageViewEvent` | Implemented |
| `ticker_view` | `app/(public)/t/[ticker]/page.tsx` via `PageViewEvent` | Implemented |
| `video_view` | `components/video/video-player.tsx` | Implemented |
| `live_view` | `app/(public)/room/[roomId]/page.tsx` + `components/live/live-viewer-shell.tsx` | Implemented |

## Engagement events

| Event | Current emitter | Status |
|---|---|---|
| `video_play` | `components/video/video-player.tsx` | Implemented |
| `video_25` / `video_50` / `video_75` / `video_100` | `components/video/video-player.tsx` | Implemented |
| `live_join` | `components/live/live-viewer-shell.tsx` | Implemented |

## Creator + ops events

| Event | Current emitter | Status |
|---|---|---|
| `creator_signup` | Auth/signup flow | Implemented |
| `creator_signin` | Auth/sign-in flow | Implemented |
| `video_upload_start` / `video_upload_complete` | Studio upload flow | Implemented |
| `live_room_create` / `live_room_start` / `live_room_end` | Studio live flow | Implemented |
| `broker_connect_start` / `broker_connect_complete` / `broker_visibility_toggle` | Partially mapped to broker events | Needs naming alignment |
| `waitlist_submit` | `app/api/waitlist/route.ts` and pricing flow | Implemented |

## Audit cadence

- Re-run this matrix whenever new funnel events are added.
- If event names change in `lib/posthog/events.ts`, update `frontend-rules.md` and this matrix in the same PR.
