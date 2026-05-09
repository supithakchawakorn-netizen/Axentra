import Link from "next/link";
import type { PublicLiveRoom } from "@/lib/data/live-rooms";
import type { PublicVideoSummary } from "@/lib/data/videos";
import type { TickerRow } from "@/lib/data/tickers";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LiveRoomCard } from "@/components/live/live-room-card";
import { VideoCard } from "@/components/video/video-card";
import { HomeGrowthLazy } from "@/components/experiments/home-growth-lazy";
import { ContinueWatchingStrip } from "@/components/video/continue-watching-strip";
import { WolfpackHeroStrip } from "@/components/shared/wolfpack-hero-strip";

interface HomeMobileProps {
  videos: PublicVideoSummary[];
  live: PublicLiveRoom[];
  topTickers: TickerRow[];
}

export function HomeMobile({ videos, live, topTickers }: HomeMobileProps) {
  return (
    <main className="yt-page-shell w-full space-y-6 px-1 py-5">
      <PageHeader
        title="Home"
        description="Mobile-first wolfpack feed. Swipe through live and video cards."
      />
      <WolfpackHeroStrip caption="Varg Packs live market feed." />
      <HomeGrowthLazy />
      <ContinueWatchingStrip
        title="Continue watching"
        subtitle="Resume from where you left off."
      />

      {topTickers.length > 0 ? (
        <section className="space-y-3">
          <SectionHeader title="Trending" subtitle="Tap to jump by symbol." />
          <ul className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1">
            {topTickers.map((ticker) => (
              <li key={ticker.id} className="snap-start">
                <Link
                  href={`/t/${ticker.symbol}`}
                  prefetch={false}
                  className="bg-secondary text-secondary-foreground inline-flex rounded-full px-3 py-1.5 font-mono text-xs"
                >
                  ${ticker.symbol}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {live.length > 0 ? (
        <section className="space-y-3">
          <SectionHeader title={`Live now (${live.length})`} />
          <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
            {live.slice(0, 6).map((room) => (
              <li key={room.id} className="w-[88%] min-w-[88%] snap-start">
                <LiveRoomCard room={room} prefetch={false} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-3">
        <SectionHeader
          title="Recent videos"
          action={
            <Link href="/explore" prefetch={false} className="text-sm text-muted-foreground">
              See all
            </Link>
          }
        />
        {videos.length === 0 ? (
          <EmptyState
            title="No videos yet."
            description="Once creators publish their first videos, they'll appear here."
          />
        ) : (
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
            {videos.map((video) => (
              <div
                key={video.id}
                className="w-[85%] min-w-[85%] snap-start"
              >
                <VideoCard video={video} prefetch={false} />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

