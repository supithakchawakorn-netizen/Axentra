import { Skeleton } from "@/components/ui/skeleton";

export default function ExploreLoading() {
  return (
    <main className="w-full space-y-4 px-2 py-6">
      <Skeleton className="h-8 w-44 rounded-md bg-muted/70" />
      <div className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-44 w-[88%] min-w-[88%] rounded-xl bg-muted/70 sm:h-40 sm:w-full sm:min-w-0"
          />
        ))}
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton
            key={`video-${index}`}
            className="h-52 w-[85%] min-w-[85%] rounded-xl bg-muted/70 sm:h-48 sm:w-full sm:min-w-0"
          />
        ))}
      </div>
    </main>
  );
}
