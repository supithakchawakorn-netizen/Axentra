import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/data/profiles";
import { getRoom } from "@/lib/data/live-rooms";
import { getCreatorPublishToken } from "@/app/(creator)/studio/live/_actions";
import { LiveBroadcasterShell } from "@/components/live/live-broadcaster-shell";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ roomId: string }>;
}

export default async function StudioLiveRoomPage({ params }: Props) {
  const { roomId } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect("/sign-in?next=/studio/live");

  const room = await getRoom(roomId);
  if (!room) notFound();
  if (room.creator?.id !== profile.id) notFound();

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
