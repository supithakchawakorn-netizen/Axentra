"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { endLiveRoom } from "@/app/(creator)/studio/live/_actions";

export function LiveRoomCardActions({
  roomId,
  roomTitle,
}: {
  roomId: string;
  roomTitle: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onEndNow() {
    if (!confirm(`End "${roomTitle}" now?`)) return;
    setError(null);
    startTransition(async () => {
      const res = await endLiveRoom({ roomId });
      if (!res.ok) {
        setError(res.error ?? "Could not end room.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild size="sm">
          <Link href={`/studio/live/${roomId}`}>Studio controls</Link>
        </Button>
        <Button asChild size="sm" variant="secondary">
          <Link href={`/room/${roomId}`}>Open viewer room</Link>
        </Button>
        <Button type="button" size="sm" variant="destructive" onClick={onEndNow} disabled={isPending}>
          {isPending ? "Ending…" : "End now"}
        </Button>
      </div>
      {error ? (
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-2 py-1 text-xs">
          {error}
        </div>
      ) : null}
    </div>
  );
}
