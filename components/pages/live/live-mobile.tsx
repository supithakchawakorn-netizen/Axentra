import Link from "next/link";
import type { PublicLiveRoom } from "@/lib/data/live-rooms";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LiveRoomCard } from "@/components/live/live-room-card";
import { WolfpackHeroStrip } from "@/components/shared/wolfpack-hero-strip";

interface LiveMobileProps {
  rooms: PublicLiveRoom[];
}

export function LiveMobile({ rooms }: LiveMobileProps) {
  return (
    <main className="yt-page-shell w-full space-y-5 px-1 py-5">
      <PageHeader
        title="Live"
        description="Swipe through active Varg Packs streams."
      />
      <WolfpackHeroStrip caption="Live market rooms from the wolfpack." />
      <div className="glass-panel rounded-xl border px-4 py-3 text-xs text-muted-foreground">
        Rooms are ranked by current viewer activity.
      </div>
      {rooms.length === 0 ? (
        <EmptyState
          title="No one is live right now."
          description="Browse recent videos while creators are offline."
          action={
            <Link href="/explore" className="text-foreground hover:underline underline-offset-4">
              Browse recent videos →
            </Link>
          }
        />
      ) : (
        <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
          {rooms.map((room) => (
            <li key={room.id} className="w-[88%] min-w-[88%] snap-start">
              <LiveRoomCard room={room} prefetch={false} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

