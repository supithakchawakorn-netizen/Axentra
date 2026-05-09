"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";

export function RouteErrorState({
  error,
  reset,
  title,
}: {
  error?: Error;
  reset: () => void;
  title: string;
}) {
  useEffect(() => {
    if (error) {
      Sentry.captureException(error);
    }
  }, [error]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="glass-panel rounded-xl border p-4 space-y-3">
        <p className="text-sm font-semibold">Something went wrong</p>
        <p className="text-muted-foreground text-sm">{title}</p>
        <Button type="button" size="sm" onClick={() => reset()}>
          Try again
        </Button>
      </div>
    </main>
  );
}
