import { Skeleton } from "@/components/ui/skeleton";

export default function StudioLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-4 px-3 py-8 sm:px-4">
      <Skeleton className="h-10 w-56 rounded-md bg-muted/70" />
      <div className="grid grid-cols-3 gap-2 sm:hidden">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={`mobile-${index}`} className="h-20 w-full rounded-xl bg-muted/70" />
        ))}
      </div>
      <div className="hidden gap-4 md:grid md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-32 w-full rounded-xl bg-muted/70"
          />
        ))}
      </div>
    </main>
  );
}
