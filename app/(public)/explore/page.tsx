import { listRecentPublishedVideos } from "@/lib/data/videos";
import { listLiveRooms } from "@/lib/data/live-rooms";
import {
  listTopTickers,
  listVideosForTicker,
  getTickerBySymbol,
} from "@/lib/data/tickers";
import { PageViewEvent } from "@/components/analytics/page-view-event";
import { Events } from "@/lib/posthog/events";
import { ExperimentQualitySignal } from "@/components/experiments/experiment-quality-signal";
import { defaultFeedRanker } from "@/lib/feed/ranker";
import { ExploreMobile } from "@/components/pages/explore/explore-mobile";
import { ExploreDesktop } from "@/components/pages/explore/explore-desktop";

export const revalidate = 60;

export const metadata = {
  title: "Explore",
  description: "Recent videos and live rooms across creators on Varg Packs.",
};

interface ExploreSearchParams {
  ticker?: string;
  q?: string;
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<ExploreSearchParams>;
}) {
  const sp = await searchParams;
  const tickerSymbol = sp.ticker?.toUpperCase().trim();
  const query = sp.q?.trim() ?? "";
  const normalizedQuery = query.toLowerCase();

  const tickerRow = tickerSymbol ? await getTickerBySymbol(tickerSymbol) : null;

  const [tickerVideos, allVideos, live, topTickers] = await Promise.all([
    tickerRow ? listVideosForTicker(tickerRow.id, 36) : Promise.resolve([]),
    !tickerRow ? listRecentPublishedVideos({ limit: 24 }) : Promise.resolve([]),
    listLiveRooms(),
    listTopTickers(20),
  ]);

  const allCandidateVideos = tickerRow
    ? tickerVideos.map((v) => ({
        id: v.id,
        title: v.title,
        description: v.description ?? "",
        duration_seconds: v.duration_seconds,
        thumbnail_url: null,
        mux_playback_id: v.mux_playback_id,
        published_at: v.published_at,
        creator: v.profiles
          ? {
              id: v.creator_id,
              handle: v.profiles.handle,
              display_name: v.profiles.display_name,
              avatar_url: v.profiles.avatar_url,
            }
          : null,
      }))
    : allVideos;
  const videos = normalizedQuery
    ? allCandidateVideos.filter((v) => {
        const haystack = [
          v.title,
          v.description ?? "",
          v.creator?.display_name ?? "",
          v.creator?.handle ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedQuery);
      })
    : allCandidateVideos;
  const filteredLive = normalizedQuery
    ? live.filter((room) => {
        const haystack = [
          room.title,
          room.description ?? "",
          room.creator?.display_name ?? "",
          room.creator?.handle ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedQuery);
      })
    : live;
  const rankedLive = defaultFeedRanker.rankLiveRooms(filteredLive, {
    query: query || undefined,
    ticker: tickerRow?.symbol,
  });
  const rankedVideos = defaultFeedRanker.rankVideos(videos, {
    query: query || undefined,
    ticker: tickerRow?.symbol,
  });
  return (
    <>
      <ExperimentQualitySignal signal="route_continuation" path="/explore" />
      <PageViewEvent
        event={Events.ExploreView}
        properties={tickerRow ? { ticker_id: tickerRow.id, symbol: tickerRow.symbol } : undefined}
      />
      <div className="sm:hidden">
        <ExploreMobile
          query={query}
          normalizedQuery={normalizedQuery}
          tickerSymbol={tickerSymbol}
          tickerRow={tickerRow}
          rankedLive={rankedLive}
          rankedVideos={rankedVideos}
          topTickers={topTickers}
        />
      </div>
      <div className="hidden sm:block">
        <ExploreDesktop
          query={query}
          normalizedQuery={normalizedQuery}
          tickerSymbol={tickerSymbol}
          tickerRow={tickerRow}
          rankedLive={rankedLive}
          rankedVideos={rankedVideos}
          topTickers={topTickers}
        />
      </div>
    </>
  );
}
