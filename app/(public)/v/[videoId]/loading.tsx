import { Skeleton } from "@/components/ui/skeleton";

export default function VideoLoading() {
  return (
    <main className="mx-auto max-w-[1400px] space-y-4 px-4 py-6">
      <Skeleton className="h-8 w-44 rounded-md bg-muted/70" />
      <Skeleton className="h-[220px] w-full rounded-xl bg-muted/70 sm:h-[380px]" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Skeleton className="h-32 w-full rounded-xl bg-muted/70 sm:h-40" />
        <Skeleton className="h-32 w-full rounded-xl bg-muted/70 sm:h-40" />
      </div>
    </main>
  );
}
