import { Skeleton } from "@/components/ui/skeleton";

export default function StudioLiveRoomLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 space-y-4">
      <Skeleton className="h-9 w-72 rounded-md bg-muted/70" />
      <Skeleton className="h-[420px] w-full rounded-xl bg-muted/70" />
      <Skeleton className="h-40 w-full rounded-xl bg-muted/70" />
    </main>
  );
}
