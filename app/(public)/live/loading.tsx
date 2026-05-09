import { Skeleton } from "@/components/ui/skeleton";

export default function LiveLoading() {
  return (
    <main className="w-full space-y-4 px-2 py-6">
      <Skeleton className="h-8 w-36 rounded-md bg-muted/70" />
      <Skeleton className="h-10 w-full rounded-xl bg-muted/70" />
      <div className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-52 w-[88%] min-w-[88%] rounded-xl bg-muted/70 sm:h-48 sm:w-full sm:min-w-0"
          />
        ))}
      </div>
    </main>
  );
}
