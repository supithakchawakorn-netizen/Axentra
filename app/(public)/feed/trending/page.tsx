import { listRecentPublishedVideos } from "@/lib/data/videos";
import { defaultFeedRanker } from "@/lib/feed/ranker";
import { VideoCard } from "@/components/video/video-card";

export const revalidate = 60;

export const metadata = {
  title: "Trending",
  description: "Trending videos across the platform right now.",
};

export default async function TrendingFeedPage() {
  const videos = await listRecentPublishedVideos({ limit: 36 });
  const ranked = defaultFeedRanker.rankVideos(videos);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-2 py-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Trending</h1>
        <p className="text-muted-foreground text-sm">
          Discover what viewers are watching most across creators.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ranked.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </main>
  );
}
