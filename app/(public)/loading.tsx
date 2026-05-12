import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <main className="mx-auto w-full max-w-[1400px] space-y-4 px-3 py-6 sm:px-4">
      <Skeleton className="h-10 w-full rounded-lg bg-muted/70" />
      <div className="sm:hidden">
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton
              key={`mobile-${index}`}
              className="h-44 w-[84%] min-w-[84%] rounded-xl bg-muted/70"
            />
          ))}
        </div>
      </div>
      <div className="hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-44 w-full rounded-xl bg-muted/70"
          />
        ))}
      </div>
    </main>
  );
}
