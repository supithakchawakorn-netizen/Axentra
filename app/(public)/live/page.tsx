import Link from "next/link";
import { listLiveRooms } from "@/lib/data/live-rooms";
import { APP_NAME } from "@/lib/utils/site";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LiveRoomCard } from "@/components/live/live-room-card";
import { ExperimentQualitySignal } from "@/components/experiments/experiment-quality-signal";

export const revalidate = 30;

export const metadata = {
  title: "Live now",
  description: `Creators streaming on ${APP_NAME} right now.`,
};

export default async function LivePage() {
  const rooms = await listLiveRooms();

  return (
    <main className="yt-page-shell w-full space-y-6 px-1 py-6 sm:px-2">
      <ExperimentQualitySignal signal="route_continuation" path="/live" />
      <PageHeader
        title="Live"
        description="Now streaming across the market creators network."
      />
      <div className="glass-panel rounded-xl border px-4 py-3 text-xs text-muted-foreground">
        Live rooms are sorted by viewer activity. Jump in and switch rooms freely.
      </div>

      {rooms.length === 0 ? (
        <EmptyState
          title="No one is live right now."
          description="Check back soon, or browse recent videos while creators are offline."
          action={
            <Link
              href="/explore"
              className="text-foreground hover:underline underline-offset-4"
            >
              Browse recent videos →
            </Link>
          }
        />
      ) : (
        <ul className="yt-feed-grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((r) => (
            <li key={r.id}>
              <LiveRoomCard room={r} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
