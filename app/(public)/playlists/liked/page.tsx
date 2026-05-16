import { listRecentPublishedVideos } from "@/lib/data/videos";
import { VideoLibraryGrid } from "@/components/pages/library/video-library-grid";

export const revalidate = 60;

export const metadata = {
  title: "Liked videos",
  description: "Videos you have liked on the platform.",
};

export default async function LikedPlaylistsPage() {
  const videos = await listRecentPublishedVideos({ limit: 64 });

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-2 py-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Liked videos</h1>
      </div>
      <VideoLibraryGrid
        videos={videos}
        mode="liked"
        emptyTitle="No liked videos yet"
        emptyDescription="Tap Like on any watch page to add videos here."
      />
    </main>
  );
}
