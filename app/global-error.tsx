"use client";

import { RouteErrorState } from "@/components/shared/route-error-state";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <RouteErrorState
          error={error}
          reset={reset}
          title="A global application error occurred."
        />
      </body>
    </html>
  );
}
