import "server-only";

import type { PublicLiveRoom } from "@/lib/data/live-rooms";
import type { PublicVideoSummary } from "@/lib/data/videos";

export interface FeedRankingContext {
  query?: string;
  ticker?: string;
}

/**
 * AI ranker placeholder interface.
 * V1 uses a deterministic heuristic ranker, but the call shape is stable
 * so we can swap in model-based ranking later without changing page code.
 */
export interface FeedRanker {
  rankVideos(videos: PublicVideoSummary[], context?: FeedRankingContext): PublicVideoSummary[];
  rankLiveRooms(rooms: PublicLiveRoom[], context?: FeedRankingContext): PublicLiveRoom[];
}

export class HeuristicFeedRanker implements FeedRanker {
  rankVideos(videos: PublicVideoSummary[], context: FeedRankingContext = {}) {
    const query = context.query?.trim().toLowerCase() ?? "";
    return [...videos].sort((a, b) => scoreVideo(b, query) - scoreVideo(a, query));
  }

  rankLiveRooms(rooms: PublicLiveRoom[], context: FeedRankingContext = {}) {
    const query = context.query?.trim().toLowerCase() ?? "";
    return [...rooms].sort((a, b) => scoreRoom(b, query) - scoreRoom(a, query));
  }
}

export const defaultFeedRanker: FeedRanker = new HeuristicFeedRanker();

function scoreVideo(video: PublicVideoSummary, query: string) {
  const hours = video.published_at
    ? Math.max(0, (Date.now() - new Date(video.published_at).getTime()) / 3_600_000)
    : 72;
  const recencyScore = Math.max(0, 100 - hours * 2.5);
  const verifiedScore = video.creator?.verified_broker ? 8 : 0;
  const title = video.title.toLowerCase();
  const creator = `${video.creator?.display_name ?? ""} ${video.creator?.handle ?? ""}`.toLowerCase();
  const queryScore = query
    ? title.includes(query) || creator.includes(query)
      ? 24
      : 0
    : 0;
  return recencyScore + verifiedScore + queryScore;
}

function scoreRoom(room: PublicLiveRoom, query: string) {
  const viewerScore = Math.min(90, room.viewer_count * 0.7);
  const startedAt = room.started_at ? new Date(room.started_at).getTime() : Date.now();
  const liveRecencyHours = Math.max(0, (Date.now() - startedAt) / 3_600_000);
  const freshnessScore = Math.max(0, 30 - liveRecencyHours * 4);
  const title = room.title.toLowerCase();
  const creator = `${room.creator?.display_name ?? ""} ${room.creator?.handle ?? ""}`.toLowerCase();
  const queryScore = query
    ? title.includes(query) || creator.includes(query)
      ? 20
      : 0
    : 0;
  return viewerScore + freshnessScore + queryScore;
}
