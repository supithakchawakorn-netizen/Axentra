"use client";

import { useState } from "react";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";
import { Events } from "@/lib/posthog/events";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "pricing" }),
      });
      if (!res.ok) {
        setStatus("error");
        return;
      }
      if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
        posthog.capture(Events.WaitlistSubmit, { source: "pricing" });
      }
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <label htmlFor="waitlist-email" className="sr-only">
        Email address
      </label>
      <input
        id="waitlist-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
        inputMode="email"
        aria-describedby="waitlist-help"
        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
      />
      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Submitting…" : "Join waitlist"}
      </Button>
      <p id="waitlist-help" className="text-muted-foreground text-xs">
        We only use this to notify you about Premium availability.
      </p>
      {status === "done" ? (
        <p className="text-muted-foreground text-xs">You are on the list.</p>
      ) : null}
      {status === "error" ? (
        <p className="text-destructive text-xs">Could not submit right now.</p>
      ) : null}
    </form>
  );
}
