"use client";

import "@livekit/components-styles";
import { useEffect, useState } from "react";
import {
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { usePostHog } from "posthog-js/react";
import { Events } from "@/lib/posthog/events";

interface Props {
  roomId: string;
  title: string;
}

type State =
  | { tag: "loading" }
  | { tag: "ready"; token: string; url: string }
  | { tag: "error"; message: string };

export function LiveViewerShell({ roomId, title }: Props) {
  const [state, setState] = useState<State>({ tag: "loading" });
  const posthog = usePostHog();

  useEffect(() => {
    posthog?.capture(Events.LiveView, { room_id: roomId, title });

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/livekit/viewer-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId }),
        });
        const json = (await res.json()) as
          | { token: string; url: string }
          | { error: string };
        if (cancelled) return;
        if (!res.ok) {
          setState({
            tag: "error",
            message: ("error" in json && json.error) || `Status ${res.status}`,
          });
          return;
        }
        setState({
          tag: "ready",
          token: ("token" in json && json.token) || "",
          url: ("url" in json && json.url) || "",
        });
      } catch (e) {
        if (cancelled) return;
        setState({
          tag: "error",
          message: e instanceof Error ? e.message : "Failed to connect.",
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [roomId, title, posthog]);

  if (state.tag === "loading") {
    return (
      <div className="bg-muted text-muted-foreground flex aspect-video items-center justify-center rounded-lg border text-sm">
        Connecting…
      </div>
    );
  }

  if (state.tag === "error") {
    return (
      <div className="border-destructive/30 bg-destructive/10 text-destructive flex aspect-video items-center justify-center rounded-lg border text-sm">
        {state.message}
      </div>
    );
  }

  return (
    <div className="border-border overflow-hidden rounded-lg border bg-black" style={{ height: "min(70vh, 540px)" }}>
      <LiveKitRoom
        token={state.token}
        serverUrl={state.url}
        connect
        video={false}
        audio={false}
        data-lk-theme="default"
        style={{ height: "100%" }}
        onConnected={() => posthog?.capture(Events.LiveJoin, { room_id: roomId })}
      >
        <ViewerStage />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}

function ViewerStage() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: true },
  );
  return (
    <GridLayout tracks={tracks} style={{ height: "100%" }}>
      <ParticipantTile />
    </GridLayout>
  );
}
