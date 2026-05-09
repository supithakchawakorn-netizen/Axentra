"use client";

import { RouteErrorState } from "@/components/shared/route-error-state";

export default function StudioAnalyticsError({
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
      title="Studio analytics failed to load."
    />
  );
}
