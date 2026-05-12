# Analytics Audit Matrix

## Active event taxonomy (social pivot)

- `home_view`
- `explore_view`
- `live_directory_view`
- `live_view`
- `live_join`
- `live_room_create`
- `live_room_start`
- `live_room_end`
- `video_view`
- `video_play`
- `video_25`
- `video_50`
- `video_75`
- `video_100`
- `reputation_panel_view`
- `reputation_component_view`
- `content_helpful_vote`
- `content_not_helpful_vote`
- `creator_consistency_milestone`
- `trusted_creator_return_view`
- `experiment_impression`
- `experiment_click`
- `experiment_quality_signal`

## Retired event families

- ticker events
- broker connect/visibility/disconnect
- waitlist submit

## Validation checklist

- Home, explore, live, video, room, and profile fire expected page-level events.
- Helpfulness feedback emits exactly one vote event per action.
- No finance-specific events remain in client or server captures.

