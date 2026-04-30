import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-4 px-6 py-16">
      <p className="text-muted-foreground text-sm uppercase tracking-widest">
        404
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">
        Page not found
      </h1>
      <p className="text-muted-foreground">
        That route doesn&apos;t exist (yet). It may land in a later milestone.
      </p>
      <Link
        href="/"
        className="text-primary hover:underline underline-offset-4 self-start text-sm"
      >
        Back home
      </Link>
    </main>
  );
}
