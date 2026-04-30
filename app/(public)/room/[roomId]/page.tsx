import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getRoom } from "@/lib/data/live-rooms";
import { listRoomTickers } from "@/lib/data/videos";
import { LiveViewerShell } from "@/components/live/live-viewer-shell";
import { APP_NAME, siteUrl } from "@/lib/utils/site";
import { formatDate } from "@/lib/utils/format";
import { TickerChips } from "@/components/ticker/ticker-chips";
import { VerifiedBrokerBadge } from "@/components/creator/verified-broker-badge";
import { StatusPill } from "@/components/shared/status-pill";
import { supabaseConfigured } from "@/lib/env";
import { listCommentsForRoom } from "@/lib/data/comments";
import { CommentsSection } from "@/components/shared/comments-section";
import { ExperimentQualitySignal } from "@/components/experiments/experiment-quality-signal";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ roomId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { roomId } = await params;
  const room = await getRoom(roomId);
  if (!room) return { title: "Room not found" };
  return {
    title: room.title,
    description:
      room.description?.slice(0, 200) ||
      `${room.creator?.display_name ?? "Creator"} live on ${APP_NAME}.`,
    alternates: { canonical: `${siteUrl()}/room/${room.id}` },
  };
}

export default async function RoomPage({ params }: Props) {
  const { roomId } = await params;
  const [room, tickers] = await Promise.all([
    getRoom(roomId),
    listRoomTickers(roomId),
  ]);
  if (!room) notFound();

  if (room.status === "ended" && room.recording_video_id) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 space-y-4">
        <StatusPill label="Ended" tone="neutral" />
        <h1 className="text-2xl font-semibold tracking-tight">{room.title}</h1>
        <p className="text-muted-foreground text-sm">
          This stream has ended. Watch the recording:
        </p>
        <Link
          href={`/v/${room.recording_video_id}`}
          className="text-primary text-sm hover:underline underline-offset-4"
        >
          Open the recording →
        </Link>
      </main>
    );
  }

  if (room.status === "ended") {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 space-y-3">
        <StatusPill label="Ended" tone="neutral" />
        <h1 className="text-2xl font-semibold tracking-tight">{room.title}</h1>
        <p className="text-muted-foreground text-sm">
          This stream has ended. The recording will appear here once it&apos;s
          processed.
        </p>
        {room.creator ? (
          <Link
            href={`/@${room.creator.handle}`}
            className="text-primary text-sm hover:underline underline-offset-4"
          >
            More from @{room.creator.handle} →
          </Link>
        ) : null}
      </main>
    );
  }

  if (room.status === "scheduled") {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 space-y-3">
        <StatusPill label="Scheduled" tone="warning" />
        <h1 className="text-2xl font-semibold tracking-tight">{room.title}</h1>
        <p className="text-muted-foreground text-sm">
          {room.scheduled_at
            ? `Scheduled for ${formatDate(room.scheduled_at)}.`
            : "Scheduled."}{" "}
          Refresh once it goes live.
        </p>
      </main>
    );
  }

  const demoMode = room.id.startsWith("demo-room-");
  const demoBanner = demoMode || !supabaseConfigured();
  const comments = listCommentsForRoom(room.id);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <ExperimentQualitySignal signal="watch_page_entry" path={`/room/${room.id}`} />
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
        <div className="grid gap-2 text-xs sm:grid-cols-2">
          <Link href="/live" className="rounded-md border px-3 py-2 hover:bg-muted/50">
            View live directory
          </Link>
          <Link href="/explore" className="rounded-md border px-3 py-2 hover:bg-muted/50">
            Browse recent videos
          </Link>
          {room.creator ? (
            <Link
              href={`/@${room.creator.handle}`}
              className="rounded-md border px-3 py-2 hover:bg-muted/50"
            >
              More from @{room.creator.handle}
            </Link>
          ) : null}
          {room.recording_video_id ? (
            <Link
              href={`/v/${room.recording_video_id}`}
              className="rounded-md border px-3 py-2 hover:bg-muted/50"
            >
              Open latest recording
            </Link>
          ) : null}
        </div>
      </section>
    </main>
  );
}
