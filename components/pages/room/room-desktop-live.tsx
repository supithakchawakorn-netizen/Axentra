import Link from "next/link";
import type { PublicLiveRoom } from "@/lib/data/live-rooms";
import type { DemoComment } from "@/lib/data/comments";
import { LiveViewerShell } from "@/components/live/live-viewer-shell";
import { TickerChips } from "@/components/ticker/ticker-chips";
import { VerifiedBrokerBadge } from "@/components/creator/verified-broker-badge";
import { StatusPill } from "@/components/shared/status-pill";
import { CommentsSection } from "@/components/shared/comments-section";

interface RoomDesktopLiveProps {
  room: PublicLiveRoom;
  tickers: { id: string; symbol: string; name: string }[];
  comments: DemoComment[];
  demoBanner: boolean;
  demoMode: boolean;
}

export function RoomDesktopLive({
  room,
  tickers,
  comments,
  demoBanner,
  demoMode,
}: RoomDesktopLiveProps) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      {demoBanner ? (
        <div className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          Demo mode: this is sample live room content.
        </div>
      ) : null}
      {demoMode ? (
        <div className="bg-muted flex aspect-video items-center justify-center rounded-xl border">
          <p className="text-muted-foreground text-sm">
            Demo live stream preview. Connect LiveKit to watch real streams.
          </p>
        </div>
      ) : (
        <LiveViewerShell roomId={room.id} title={room.title} />
      )}
      <header className="glass-panel mt-6 rounded-xl border p-4 space-y-3">
        <StatusPill label="Live now" tone="live" className="uppercase tracking-wider" />
        <h1 className="text-2xl font-semibold tracking-tight">{room.title}</h1>
        {room.creator ? (
          <div className="flex items-center gap-2">
            <Link
              href={`/@${room.creator.handle}`}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              {room.creator.display_name ?? `@${room.creator.handle}`}
            </Link>
            {room.creator.verified_broker ? <VerifiedBrokerBadge /> : null}
          </div>
        ) : null}
        <TickerChips tickers={tickers} />
        {room.description ? (
          <p className="readable-copy text-muted-foreground mt-2 whitespace-pre-wrap text-sm">
            {room.description}
          </p>
        ) : null}
      </header>

      <div className="mt-6">
        <CommentsSection
          title="Live chat"
          comments={comments}
          inputLabel="Post to chat"
          helperText="In V1, chat write is limited to creators and invited co-hosts."
        />
      </div>

      <section className="glass-panel mt-6 rounded-xl border p-4 space-y-2">
        <h2 className="text-sm font-semibold">Next actions</h2>
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <Link href="/live" className="flex min-h-11 items-center rounded-md border px-3 py-2 hover:bg-muted/50">
            View live directory
          </Link>
          <Link href="/explore" className="flex min-h-11 items-center rounded-md border px-3 py-2 hover:bg-muted/50">
            Browse recent videos
          </Link>
          {room.creator ? (
            <Link
              href={`/@${room.creator.handle}`}
              className="flex min-h-11 items-center rounded-md border px-3 py-2 hover:bg-muted/50"
            >
              More from @{room.creator.handle}
            </Link>
          ) : null}
          {room.recording_video_id ? (
            <Link
              href={`/v/${room.recording_video_id}`}
              className="flex min-h-11 items-center rounded-md border px-3 py-2 hover:bg-muted/50"
            >
              Open latest recording
            </Link>
          ) : null}
        </div>
      </section>
    </main>
  );
}

