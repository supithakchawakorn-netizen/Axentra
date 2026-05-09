import Link from "next/link";
import type { PublicLiveRoom } from "@/lib/data/live-rooms";
import type { PublicVideoSummary } from "@/lib/data/videos";
import type { TickerRow } from "@/lib/data/tickers";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LiveRoomCard } from "@/components/live/live-room-card";
import { LiveHighlightsStrip } from "@/components/live/live-highlights-strip";
import { VideoCard } from "@/components/video/video-card";
import { HomeGrowthLazy } from "@/components/experiments/home-growth-lazy";
import { WolfpackHeroStrip } from "@/components/shared/wolfpack-hero-strip";

interface HomeDesktopProps {
  videos: PublicVideoSummary[];
  live: PublicLiveRoom[];
  topTickers: TickerRow[];
}

export function HomeDesktop({ videos, live, topTickers }: HomeDesktopProps) {
  return (
    <main className="yt-page-shell w-full space-y-8 px-1 py-6 sm:px-2">
      <PageHeader
        title="Home"
        description="Wolfpack market commentary videos and live sessions."
      />
      <WolfpackHeroStrip caption="Verified creator commentary, no noise." />
      <HomeGrowthLazy />
      <LiveHighlightsStrip rooms={live} />

      {topTickers.length > 0 ? (
        <section className="space-y-3">
          <SectionHeader title="Trending tickers" subtitle="Jump to filtered feeds." />
          <ul className="flex flex-wrap gap-1.5">
            {topTickers.map((ticker) => (
              <li key={ticker.id}>
                <Link
                  href={`/t/${ticker.symbol}`}
                  className="bg-secondary text-secondary-foreground hover:bg-accent inline-flex items-center rounded-full px-3 py-1.5 font-mono text-xs"
                  title={ticker.name}
                >
                  ${ticker.symbol}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {live.length > 0 ? (
        <section className="space-y-4">
          <SectionHeader
            title={`Live now (${live.length})`}
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
            {live.slice(0, 3).map((room) => (
              <li key={room.id}>
                <LiveRoomCard room={room} />
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
        {videos.length === 0 ? (
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
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

