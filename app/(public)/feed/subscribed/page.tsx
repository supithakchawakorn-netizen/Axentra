import { listRecentPublishedVideos } from "@/lib/data/videos";
import { VideoLibraryGrid } from "@/components/pages/library/video-library-grid";

export const revalidate = 60;

export const metadata = {
  title: "Subscribed feed",
  description: "Feed of recently published videos from subscribed creators.",
};

export default async function SubscribedFeedPage() {
  const videos = await listRecentPublishedVideos({ limit: 48 });
  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-2 py-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Subscribed feed</h1>
        <p className="text-muted-foreground text-sm">
          Your creator subscription timeline, newest first.
        </p>
      </div>
      <VideoLibraryGrid
        videos={videos}
        mode="subscriptions"
        emptyTitle="No subscribed videos available"
        emptyDescription="Subscribe to creators to populate this feed."
      />
    </main>
  );
}
