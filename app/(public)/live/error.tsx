"use client";

export default function LiveError() {
  return (
    <main className="w-full px-2 py-6">
      <p className="text-destructive text-sm">
        Live directory failed to load. Please refresh and try again.
      </p>
    </main>
  );
}
