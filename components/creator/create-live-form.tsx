"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createLiveRoom } from "@/app/(creator)/studio/live/_actions";
import { TickerPicker } from "@/components/creator/ticker-picker";
import type { TickerRow } from "@/lib/data/tickers";
import { createClient } from "@/lib/supabase/client";
import { studioGuestModeEnabled } from "@/lib/env";

export function CreateLiveForm() {
  const router = useRouter();
  const supabase = createClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tickers, setTickers] = useState<TickerRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function ensureStudioGuestUser() {
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser();
    if (user && !getUserError) return user;
    if (!studioGuestModeEnabled()) return null;

    const displayName = `Guest ${Math.random().toString(36).slice(2, 8)}`;
    const { data, error: signInError } = await supabase.auth.signInAnonymously({
      options: {
        data: { full_name: displayName },
      },
    });
    if (signInError) {
      console.error("[create-live-form] guest anonymous sign-in failed", signInError);
      return null;
    }
    return data.user;
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const user = await ensureStudioGuestUser();
      if (!user) {
        setError("Unable to start guest session. Check Supabase anonymous auth settings.");
        return;
      }
      const res = await createLiveRoom({
        title,
        description,
        tickerIds: tickers.map((t) => t.id),
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push(`/studio/live/${res.roomId}`);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <section className="glass-panel rounded-lg border p-4 space-y-1.5">
        <p className="text-sm font-medium">Time-to-go-live guide</p>
        <ul className="text-muted-foreground space-y-1 text-xs">
          <li>1) Use a specific title for your community session.</li>
          <li>2) Tag relevant topics so your room appears in discovery.</li>
          <li>3) Start stream only when your mic/camera setup is ready.</li>
        </ul>
      </section>
      <div className="space-y-1.5 rounded-lg border p-4">
        <Label htmlFor="title">Stream title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={140}
          placeholder="Live: market open commentary"
          disabled={isPending}
        />
      </div>

      <div className="space-y-1.5 rounded-lg border p-4">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={2000}
          disabled={isPending}
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 placeholder:text-muted-foreground w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:opacity-50"
          placeholder="Optional. What you're covering."
        />
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <p className="text-sm font-medium">Related topics</p>
        <TickerPicker value={tickers} onChange={setTickers} disabled={isPending} />
      </div>

      {error ? (
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Starting…" : "Start streaming"}
        </Button>
        <p className="text-muted-foreground text-xs">
          You can end the room anytime from the broadcaster screen and keep a clean recording handoff.
        </p>
      </div>
    </form>
  );
}
