"use client";

import { RouteErrorState } from "@/components/shared/route-error-state";

export default function BrokerError({
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
      title="Broker settings failed to load."
    />
  );
}
