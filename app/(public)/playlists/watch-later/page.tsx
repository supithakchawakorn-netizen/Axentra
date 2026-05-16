import { listRecentPublishedVideos } from "@/lib/data/videos";
import { VideoLibraryGrid } from "@/components/pages/library/video-library-grid";

export const revalidate = 60;

export const metadata = {
  title: "Watch later",
  description: "Saved videos to watch later.",
};

export default async function WatchLaterPlaylistsPage() {
  const videos = await listRecentPublishedVideos({ limit: 64 });

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-2 py-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Watch later</h1>
      </div>
      <VideoLibraryGrid
        videos={videos}
        mode="watch-later"
        emptyTitle="No saved videos yet"
        emptyDescription="Use Watch later on a video page to save it here."
      />
    </main>
  );
}
