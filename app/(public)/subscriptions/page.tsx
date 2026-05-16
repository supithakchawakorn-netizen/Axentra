import { listRecentPublishedVideos } from "@/lib/data/videos";
import { PageViewEvent } from "@/components/analytics/page-view-event";
import { Events } from "@/lib/posthog/events";
import { VideoLibraryGrid } from "@/components/pages/library/video-library-grid";

export const revalidate = 60;

export const metadata = {
  title: "Subscriptions",
  description: "Latest videos from creators you subscribe to.",
};

export default async function SubscriptionsPage() {
  const videos = await listRecentPublishedVideos({ limit: 48 });

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-2 py-8">
      <PageViewEvent event={Events.ExploreView} properties={{ source: "subscriptions" }} />
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Subscriptions</h1>
        <p className="text-muted-foreground text-sm">
          Personalized feed from creators you follow.
        </p>
      </div>
      <VideoLibraryGrid
        videos={videos}
        mode="subscriptions"
        emptyTitle="No subscriptions yet"
        emptyDescription="Subscribe from any watch page to build your personalized subscription feed."
      />
    </main>
  );
}
