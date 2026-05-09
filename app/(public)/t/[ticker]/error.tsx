"use client";

import { RouteErrorState } from "@/components/shared/route-error-state";

export default function TickerError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <RouteErrorState
      error={error}
      reset={reset}
      title="Ticker page failed to load."
    />
  );
}
