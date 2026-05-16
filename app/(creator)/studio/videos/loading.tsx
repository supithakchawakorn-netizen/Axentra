import { Skeleton } from "@/components/ui/skeleton";

export default function StudioVideosLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 space-y-4">
      <Skeleton className="h-10 w-64 rounded-md bg-muted/70" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-40 w-full rounded-xl bg-muted/70"
          />
        ))}
      </div>
    </main>
  );
}
