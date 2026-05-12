import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getRoom } from "@/lib/data/live-rooms";
import { listRoomTickers } from "@/lib/data/videos";
import { APP_NAME, siteUrl } from "@/lib/utils/site";
import { formatDate } from "@/lib/utils/format";
import { StatusPill } from "@/components/shared/status-pill";
import { supabaseConfigured } from "@/lib/env";
import { listCommentsForRoom } from "@/lib/data/comments";
import { ExperimentQualitySignal } from "@/components/experiments/experiment-quality-signal";
import { PageViewEvent } from "@/components/analytics/page-view-event";
import { Events } from "@/lib/posthog/events";
import { RoomMobileLive } from "@/components/pages/room/room-mobile-live";
import { RoomDesktopLive } from "@/components/pages/room/room-desktop-live";
import { MobileDesktopSwitch } from "@/components/layout/mobile-desktop-switch";

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
        <PageViewEvent
          event={Events.LiveView}
          properties={{ room_id: room.id, status: room.status, mode: "ended" }}
        />
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
        <PageViewEvent
          event={Events.LiveView}
          properties={{ room_id: room.id, status: room.status, mode: "ended" }}
        />
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
        <PageViewEvent
          event={Events.LiveView}
          properties={{
            room_id: room.id,
            status: room.status,
            mode: "scheduled",
          }}
        />
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
    <>
      <PageViewEvent
        event={Events.LiveView}
        properties={{ room_id: room.id, status: room.status, mode: "live_page" }}
      />
      <ExperimentQualitySignal signal="watch_page_entry" path={`/room/${room.id}`} />
      <MobileDesktopSwitch
        mobile={
          <RoomMobileLive
            room={room}
            tickers={tickers}
            comments={comments}
            demoBanner={demoBanner}
            demoMode={demoMode}
          />
        }
        desktop={
          <RoomDesktopLive
            room={room}
            tickers={tickers}
            comments={comments}
            demoBanner={demoBanner}
            demoMode={demoMode}
          />
        }
      />
    </>
  );
}
