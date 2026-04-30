import { Beaker } from "lucide-react";
import { supabaseConfigured } from "@/lib/env";
import Link from "next/link";

export function DemoModeBanner() {
  if (supabaseConfigured()) return null;

  return (
    <div className="border-b border-amber-500/30 bg-amber-500/10">
      <div className="mx-auto flex w-full max-w-[1400px] items-center gap-2 px-3 py-2 text-xs text-amber-200 sm:px-4">
        <Beaker className="size-3.5 shrink-0" />
        <span className="font-semibold uppercase tracking-wider">Demo mode</span>
        <span className="text-amber-100/80">
          Showing sample videos and live rooms. Connect Supabase/Mux/LiveKit for real data.
        </span>
        <Link
          href="/setup"
          className="ml-auto rounded-full border border-amber-300/40 bg-amber-400/15 px-3 py-1 font-medium text-amber-100 hover:bg-amber-400/25"
        >
          Open setup assistant
        </Link>
      </div>
    </div>
  );
}
