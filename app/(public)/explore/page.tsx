import { listRecentPublishedVideos } from "@/lib/data/videos";
import { listLiveRooms } from "@/lib/data/live-rooms";
import {
  listTopTickers,
  listVideosForTicker,
  getTickerBySymbol,
} from "@/lib/data/tickers";
import { VideoCard } from "@/components/video/video-card";
import Link from "next/link";
import { PageViewEvent } from "@/components/analytics/page-view-event";
import { Events } from "@/lib/posthog/events";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeader } from "@/components/shared/section-header";
import { LiveRoomCard } from "@/components/live/live-room-card";
import { ExploreGrowthLazy } from "@/components/experiments/explore-growth-lazy";
import { ExperimentQualitySignal } from "@/components/experiments/experiment-quality-signal";
import { defaultFeedRanker } from "@/lib/feed/ranker";

export const revalidate = 60;

export const metadata = {
  title: "Explore",
  description: "Recent videos and live rooms across creators on Axentra.",
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
    <main className="yt-page-shell w-full px-1 py-6 space-y-10 sm:px-2">
      <ExperimentQualitySignal signal="route_continuation" path="/explore" />
      <PageViewEvent
        event={Events.ExploreView}
        properties={tickerRow ? { ticker_id: tickerRow.id, symbol: tickerRow.symbol } : undefined}
      />
      <PageHeader
        title="Explore feed"
        description={
          normalizedQuery
            ? `Showing results for "${query}".`
            : "Latest uploads and live market streams."
        }
      />
      <ExploreGrowthLazy />

      {rankedLive.length > 0 ? (
        <section className="space-y-4">
          <SectionHeader
            title={`Live now (${rankedLive.length})`}
            action={
              <Link
                href="/live"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                See all
              </Link>
            }
          />
          <ul className="yt-feed-grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rankedLive.slice(0, 6).map((r) => (
              <li key={r.id}>
                <LiveRoomCard room={r} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-4">
        <SectionHeader
          title={tickerRow ? `Videos tagged $${tickerRow.symbol}` : "Recent videos"}
        />
        {tickerRow || normalizedQuery ? (
          <p className="text-muted-foreground text-sm">
            <Link href="/explore" className="hover:text-foreground transition-colors">
              ← Clear filters
            </Link>
          </p>
        ) : null}
        {rankedVideos.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {tickerRow
              ? `No videos tagged ${tickerRow.symbol} yet.`
              : "No videos yet. Check back soon."}
          </p>
        ) : (
          <div className="yt-feed-grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rankedVideos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        )}
      </section>

      <section className="glass-panel rounded-xl border p-4 space-y-3">
        <SectionHeader
          title="By ticker"
          subtitle="Apply one ticker filter at a time."
        />
        {topTickers.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No tickers seeded yet.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {topTickers.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/explore?ticker=${t.symbol}`}
                  className={`bg-secondary text-secondary-foreground hover:bg-accent inline-flex items-center rounded-md px-2.5 py-1 font-mono text-xs ${
                    tickerSymbol === t.symbol
                      ? "ring-2 ring-foreground/30"
                      : ""
                  }`}
                  title={t.name}
                >
                  ${t.symbol}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
