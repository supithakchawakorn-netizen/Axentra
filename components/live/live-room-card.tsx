import Link from "next/link";
import Image from "next/image";
import type { PublicLiveRoom } from "@/lib/data/live-rooms";
import { StatusPill } from "@/components/shared/status-pill";

export function LiveRoomCard({
  room,
  prefetch = true,
}: {
  room: PublicLiveRoom;
  prefetch?: boolean;
}) {
  return (
    <article className="group snap-start">
      <Link
        href={`/room/${room.id}`}
        prefetch={prefetch}
        className="block space-y-2 touch-pan-y transition-transform duration-150 active:scale-[0.99]"
      >
        <div className="bg-muted premium-lift premium-surface relative aspect-video overflow-hidden rounded-xl border">
          <div className="absolute left-2 top-2 z-10">
            <StatusPill label="Live" tone="live" className="uppercase tracking-wider" />
          </div>
          <span className="absolute right-2 top-2 z-10 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
            {room.viewer_count} watching
          </span>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>
        <div className="soft-enter flex items-start gap-3">
          <div className="bg-muted relative size-9 shrink-0 overflow-hidden rounded-full border">
            {room.creator?.avatar_url ? (
              <Image
                src={room.creator.avatar_url}
                alt={room.creator.display_name ?? room.creator.handle}
                fill
                sizes="32px"
                className="object-cover"
                unoptimized
              />
            ) : null}
          </div>
          <div className="yt-card-meta min-w-0 space-y-1">
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{room.title}</h3>
            {room.creator ? (
              <p className="text-muted-foreground truncate text-xs">
                {room.creator.display_name ?? `@${room.creator.handle}`}
              </p>
            ) : null}
            <p className="text-muted-foreground text-xs">
              <span className="text-destructive mr-1">●</span>
              {room.viewer_count} watching now
            </p>
          </div>
        </div>
      </Link>
    </article>
  );
}
