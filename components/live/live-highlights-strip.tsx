import Link from "next/link";
import type { PublicLiveRoom } from "@/lib/data/live-rooms";
import { StatusPill } from "@/components/shared/status-pill";

export function LiveHighlightsStrip({ rooms }: { rooms: PublicLiveRoom[] }) {
  if (rooms.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Live highlights</h2>
        <Link
          href="/live"
          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
        >
          Open live directory
        </Link>
      </div>
      <ul className="flex snap-x gap-3 overflow-x-auto pb-1">
        {rooms.slice(0, 8).map((room) => (
          <li key={room.id} className="min-w-[170px] snap-start sm:min-w-[190px]">
            <Link href={`/room/${room.id}`} className="group block space-y-2">
              <div className="relative aspect-[9/16] overflow-hidden rounded-xl border bg-gradient-to-br from-primary/30 via-accent/20 to-muted">
                <div className="absolute left-2 top-2">
                  <StatusPill label="Live" tone="live" className="uppercase tracking-wider" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="line-clamp-2 text-xs font-semibold text-white">{room.title}</p>
                  <p className="mt-1 text-[11px] text-white/80">{room.viewer_count} watching</p>
                </div>
              </div>
              <p className="text-muted-foreground line-clamp-1 text-xs">
                {room.creator?.display_name ?? `@${room.creator?.handle ?? "creator"}`}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
