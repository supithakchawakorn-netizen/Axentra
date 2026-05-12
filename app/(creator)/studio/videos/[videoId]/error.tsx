"use client";

export default function ErrorStudioVideoDetail({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-destructive/30 p-4">
      <h2 className="text-sm font-semibold">Could not load video details</h2>
      <p className="text-muted-foreground text-sm">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="bg-secondary hover:bg-accent rounded-md px-3 py-1.5 text-sm"
      >
        Try again
      </button>
    </div>
  );
}
