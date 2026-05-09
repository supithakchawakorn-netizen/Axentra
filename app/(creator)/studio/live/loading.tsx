import { Skeleton } from "@/components/ui/skeleton";

export default function StudioLiveLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 space-y-4">
      <Skeleton className="h-10 w-64 rounded-md bg-muted/70" />
      <Skeleton className="h-40 w-full rounded-xl bg-muted/70" />
      <Skeleton className="h-64 w-full rounded-xl bg-muted/70" />
    </main>
  );
}
