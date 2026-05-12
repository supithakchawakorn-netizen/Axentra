"use client";

import { RouteErrorState } from "@/components/shared/route-error-state";

export default function ExploreError({
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
      title="Explore feed failed to load."
    />
  );
}
