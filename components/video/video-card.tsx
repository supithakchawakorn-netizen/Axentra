import Link from "next/link";
import Image from "next/image";
import type { PublicVideoSummary } from "@/lib/data/videos";
import { formatDate, formatDuration } from "@/lib/utils/format";

export function VideoCard({ video }: { video: PublicVideoSummary }) {
  const thumb = video.thumbnail_url
    ? video.thumbnail_url
    : video.mux_playback_id
      ? `https://image.mux.com/${video.mux_playback_id}/thumbnail.jpg?width=640&height=360&fit_mode=smartcrop`
      : null;
  return (
    <article className="group">
      <Link href={`/v/${video.id}`} className="block space-y-2.5">
        <div className="bg-muted premium-lift premium-surface relative aspect-video overflow-hidden rounded-xl border">
          {thumb ? (
            <Image
              src={thumb}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              unoptimized
            />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
              No thumbnail
            </div>
          )}
          {video.duration_seconds ? (
            <span className="absolute right-1.5 bottom-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
              {formatDuration(video.duration_seconds)}
            </span>
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        </div>
        <div className="soft-enter flex items-start gap-3">
          <div className="bg-muted relative size-8 shrink-0 overflow-hidden rounded-full border">
            {video.creator?.avatar_url ? (
              <Image
                src={video.creator.avatar_url}
                alt={video.creator.display_name ?? video.creator.handle}
                fill
                sizes="32px"
                className="object-cover"
                unoptimized
              />
            ) : null}
          </div>
          <div className="yt-card-meta min-w-0 space-y-1">
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
              {video.title}
            </h3>
            <p className="text-muted-foreground truncate text-xs">
              {video.creator
                ? (video.creator.display_name ?? `@${video.creator.handle}`)
                : "Unknown creator"}
            </p>
            <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              {video.published_at ? <span>{formatDate(video.published_at)}</span> : null}
              {video.duration_seconds ? <span aria-hidden>•</span> : null}
              {video.duration_seconds ? (
                <span>{formatDuration(video.duration_seconds)}</span>
              ) : null}
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
