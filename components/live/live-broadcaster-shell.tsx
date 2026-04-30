"use client";

import "@livekit/components-styles";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ControlBar,
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { Button } from "@/components/ui/button";
import { endLiveRoom } from "@/app/(creator)/studio/live/_actions";
import { StatusPill } from "@/components/shared/status-pill";

interface Props {
  roomId: string;
  title: string;
  status: "scheduled" | "live" | "ended";
  livekitUrl: string;
  livekitToken: string;
}

export function LiveBroadcasterShell({
  roomId,
  title,
  status,
  livekitUrl,
  livekitToken,
}: Props) {
  const router = useRouter();
  const [isEnded, setIsEnded] = useState(status === "ended");
  const [isPending, startTransition] = useTransition();

  function onEnd() {
    if (!confirm("End the stream? Recording will be processed and posted to your profile.")) return;
    startTransition(async () => {
      await endLiveRoom({ roomId });
      setIsEnded(true);
      router.refresh();
    });
  }

  if (isEnded) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground text-sm">
          Stream ended. The recording will appear on your profile once Mux
          finishes processing it.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex items-baseline justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <StatusPill label="Live" tone="live" className="uppercase tracking-wider" />
        </div>
        <Button variant="destructive" onClick={onEnd} disabled={isPending}>
          End stream
        </Button>
      </header>
      <div className="border-border overflow-hidden rounded-lg border bg-black" style={{ height: "min(70vh, 540px)" }}>
        <LiveKitRoom
          token={livekitToken}
          serverUrl={livekitUrl}
          connect
          video
          audio
          data-lk-theme="default"
          style={{ height: "100%" }}
        >
          <BroadcasterStage />
          <RoomAudioRenderer />
          <ControlBar variation="minimal" />
        </LiveKitRoom>
      </div>
    </div>
  );
}

function BroadcasterStage() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );
  return (
    <GridLayout tracks={tracks} style={{ height: "calc(100% - 48px)" }}>
      <ParticipantTile />
    </GridLayout>
  );
}
