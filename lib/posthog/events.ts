/**
 * PostHog event names. Centralized so we don't drift between server- and
 * client-side instrumentation.
 *
 * Source of truth: docs/frontend/frontend-rules.md §11.
 */
export const Events = {
  // M1
  CreatorSignup: "creator_signup",
  CreatorSignin: "creator_signin",
  VideoUploadStart: "video_upload_start",
  VideoUploadComplete: "video_upload_complete",
  VideoView: "video_view",
  VideoPlay: "video_play",
  Video25: "video_25",
  Video50: "video_50",
  Video75: "video_75",
  Video100: "video_100",

  // M2
  LiveDirectoryView: "live_directory_view",
  LiveView: "live_view",
  LiveJoin: "live_join",
  LiveRoomCreate: "live_room_create",
  LiveRoomStart: "live_room_start",
  LiveRoomEnd: "live_room_end",

  // M3
  HomeView: "home_view",
  ExploreView: "explore_view",

  // Growth experiments
  ExperimentImpression: "experiment_impression",
  ExperimentClick: "experiment_click",
  ExperimentQualitySignal: "experiment_quality_signal",

  // Reputation + trust (V1 trust UX)
  ReputationPanelView: "reputation_panel_view",
  ReputationComponentView: "reputation_component_view",
  ContentHelpfulVote: "content_helpful_vote",
  ContentNotHelpfulVote: "content_not_helpful_vote",
  CreatorConsistencyMilestone: "creator_consistency_milestone",
  TrustedCreatorReturnView: "trusted_creator_return_view",
} as const;

export type EventName = (typeof Events)[keyof typeof Events];
