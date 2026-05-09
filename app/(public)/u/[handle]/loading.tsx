import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-4">
      <Skeleton className="h-28 w-full rounded-xl bg-muted/70" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-48 w-full rounded-xl bg-muted/70" />
        <Skeleton className="h-48 w-full rounded-xl bg-muted/70" />
      </div>
    </main>
  );
}
