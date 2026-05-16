import Link from "next/link";
import type { PublicLiveRoom } from "@/lib/data/live-rooms";
import type { PublicVideoSummary } from "@/lib/data/videos";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeader } from "@/components/shared/section-header";
import { LiveRoomCard } from "@/components/live/live-room-card";
import { VideoCard } from "@/components/video/video-card";
import { ExploreGrowthLazy } from "@/components/experiments/explore-growth-lazy";
import { WolfpackHeroStrip } from "@/components/shared/wolfpack-hero-strip";

interface ExploreDesktopProps {
  query: string;
  normalizedQuery: string;
  rankedLive: PublicLiveRoom[];
  rankedVideos: PublicVideoSummary[];
}

export function ExploreDesktop({
  query,
  normalizedQuery,
  rankedLive,
  rankedVideos,
}: ExploreDesktopProps) {
  const nextDive = rankedVideos[0] ?? null;
  const feedPrimary = rankedVideos.slice(0, 12);
  const keepScrolling = rankedVideos.slice(12, 32);

  return (
    <main className="yt-page-shell w-full space-y-10 px-1 py-6 sm:px-2">
      <PageHeader
        title="Explore feed"
        description={
          normalizedQuery
            ? `Showing results for "${query}".`
            : "Latest community uploads and live sessions."
        }
      />
      <WolfpackHeroStrip caption="Discover the strongest community narratives." />
      {nextDive ? (
        <section className="glass-panel rounded-xl border p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Next dive
              </p>
              <p className="text-sm">
                Keep momentum with a top-ranked clip from the current feed.
              </p>
            </div>
            <Link
              href={`/v/${nextDive.id}`}
              className="rounded-full border px-3 py-1.5 text-sm hover:bg-muted/50"
            >
              Watch next →
            </Link>
          </div>
        </section>
      ) : null}
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
            {rankedLive.slice(0, 6).map((room) => (
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
        />
        {normalizedQuery ? (
          <p className="text-muted-foreground text-sm">
            <Link href="/explore" className="hover:text-foreground transition-colors">
              ← Clear filters
            </Link>
          </p>
        ) : null}
        {rankedVideos.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No videos yet. Check back soon.
          </p>
        ) : (
          <div className="yt-feed-grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {feedPrimary.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </section>

      {keepScrolling.length > 0 ? (
        <section className="space-y-4">
          <SectionHeader
            title="Keep scrolling"
            subtitle="More community content tailored from this session's ranking."
          />
          <div className="yt-feed-grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {keepScrolling.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="glass-panel rounded-xl border p-4 space-y-3">
        <SectionHeader title="Community filters" subtitle="Try popular discovery themes." />
        <ul className="flex flex-wrap gap-1.5">
          {["builders", "creators", "community", "learning", "live"].map((topic) => (
            <li key={topic}>
              <Link
                href={`/explore?q=${topic}`}
                className="bg-secondary text-secondary-foreground hover:bg-accent inline-flex items-center rounded-md px-2.5 py-1 text-xs"
              >
                {topic}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

