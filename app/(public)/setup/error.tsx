"use client";

import { RouteErrorState } from "@/components/shared/route-error-state";

export default function SetupError({
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
      title="Setup assistant failed to load."
    />
  );
}
