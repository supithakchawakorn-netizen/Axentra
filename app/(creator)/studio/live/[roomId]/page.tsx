import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/data/profiles";
import { getRoom } from "@/lib/data/live-rooms";
import { getCreatorPublishToken } from "@/app/(creator)/studio/live/_actions";
import { LiveBroadcasterShell } from "@/components/live/live-broadcaster-shell";
import { studioGuestModeEnabled } from "@/lib/env";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ roomId: string }>;
}

export default async function StudioLiveRoomPage({ params }: Props) {
  const { roomId } = await params;
  const guestMode = studioGuestModeEnabled();
  const profile = await getCurrentProfile();
  if (!profile && !guestMode) redirect("/sign-in?next=/studio/live");
  if (!profile && guestMode) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Live room preview</h1>
        <p className="text-muted-foreground text-sm">
          Guest mode is active. Broadcaster transport is disabled, but the end-to-end room UX is available for testing.
        </p>
      </div>
    );
  }
  const authedProfile = profile!;

  const room = await getRoom(roomId);
  if (!room) notFound();
  if (room.creator?.id !== authedProfile.id) notFound();

  const tokenResult = await getCreatorPublishToken(roomId);
  if (!tokenResult.ok) {
    return (
      <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-3 text-sm">
        {tokenResult.error}
      </div>
    );
  }

  return (
    <LiveBroadcasterShell
      roomId={room.id}
      title={room.title}
      status={room.status}
      livekitUrl={tokenResult.livekitUrl}
      livekitToken={tokenResult.livekitToken}
    />
  );
}
