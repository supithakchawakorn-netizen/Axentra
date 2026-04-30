import Link from "next/link";
import { listRecentPublishedVideos } from "@/lib/data/videos";
import { listLiveRooms } from "@/lib/data/live-rooms";
import { listTopTickers } from "@/lib/data/tickers";
import { VideoCard } from "@/components/video/video-card";
import { APP_NAME } from "@/lib/utils/site";
import { PageViewEvent } from "@/components/analytics/page-view-event";
import { Events } from "@/lib/posthog/events";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LiveRoomCard } from "@/components/live/live-room-card";
import { LiveHighlightsStrip } from "@/components/live/live-highlights-strip";
import { HomeGrowthLazy } from "@/components/experiments/home-growth-lazy";
import { defaultFeedRanker } from "@/lib/feed/ranker";

export const revalidate = 60;

export const metadata = {
  title: `${APP_NAME} — Watch the market, live and on demand.`,
  description:
    "Video and live platform for retail market commentary. Creators link their brokerage read-only so viewers can verify positions and performance.",
};

export default async function HomePage() {
  const [videos, live, topTickers] = await Promise.all([
    listRecentPublishedVideos({ limit: 12 }),
    listLiveRooms(),
    listTopTickers(12),
  ]);
  const rankedVideos = defaultFeedRanker.rankVideos(videos);
  const rankedLive = defaultFeedRanker.rankLiveRooms(live);

  return (
    <main className="yt-page-shell w-full space-y-8 px-1 py-6 sm:px-2">
      <PageViewEvent event={Events.HomeView} />
      <PageHeader
        title="Home"
        description="Market commentary videos and live sessions."
      />
      <HomeGrowthLazy />
      <LiveHighlightsStrip rooms={rankedLive} />

      {topTickers.length > 0 ? (
        <section className="space-y-3">
          <SectionHeader
            title="Trending tickers"
            subtitle="Jump to filtered feeds."
          />
          <ul className="flex flex-wrap gap-1.5">
            {topTickers.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/t/${t.symbol}`}
                  className="bg-secondary text-secondary-foreground hover:bg-accent inline-flex items-center rounded-full px-3 py-1.5 font-mono text-xs"
                  title={t.name}
                >
                  ${t.symbol}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

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
            {rankedLive.slice(0, 3).map((r) => (
              <li key={r.id}>
                <LiveRoomCard room={r} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-4">
        <SectionHeader
          title="Recent videos"
          action={
            <Link
              href="/explore"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              See all
            </Link>
          }
        />
        {rankedVideos.length === 0 ? (
          <EmptyState
            title="No videos yet."
            description="Once creators publish their first videos, they'll show up here."
            action={
              <Link
                href="/sign-in?next=/studio"
                className="text-primary inline-block text-sm hover:underline underline-offset-4"
              >
                Become a creator →
              </Link>
            }
          />
        ) : (
          <div className="yt-feed-grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rankedVideos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
