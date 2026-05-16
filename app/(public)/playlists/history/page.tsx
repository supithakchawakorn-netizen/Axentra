import { listRecentPublishedVideos } from "@/lib/data/videos";
import { VideoLibraryGrid } from "@/components/pages/library/video-library-grid";

export const revalidate = 60;

export const metadata = {
  title: "Watch history",
  description: "Resume recently watched sessions.",
};

export default async function HistoryPlaylistsPage() {
  const videos = await listRecentPublishedVideos({ limit: 64 });

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-2 py-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Watch history</h1>
      </div>
      <VideoLibraryGrid
        videos={videos}
        mode="history"
        emptyTitle="No watch history yet"
        emptyDescription="Play a few videos and your watch history will appear here."
      />
    </main>
  );
}
