import { Skeleton } from "@/components/ui/skeleton";

export default function StudioSettingsLoading() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 space-y-4">
      <Skeleton className="h-10 w-64 rounded-md bg-muted/70" />
      <Skeleton className="h-[420px] w-full rounded-xl bg-muted/70" />
    </main>
  );
}
