import Link from "next/link";
import { APP_NAME } from "@/lib/utils/site";

export function SiteFooter() {
  return (
    <footer className="border-t py-6">
      <div className="mx-auto grid w-full max-w-[1400px] gap-3 px-4 text-xs sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="text-muted-foreground space-y-2">
          <p>
            © {new Date().getFullYear()} {APP_NAME}. Market video and live
            commentary. Not investment advice.
          </p>
          <p>
            Brokerage links are read-only. We don&apos;t execute trades, manage
            money, or run a copy-trading product.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/" className="glass-panel rounded-full border px-3 py-1">
            Home
          </Link>
          <Link href="/explore" className="glass-panel rounded-full border px-3 py-1">
            Explore
          </Link>
          <Link href="/live" className="glass-panel rounded-full border px-3 py-1">
            Live
          </Link>
          <Link href="/privacy" className="glass-panel rounded-full border px-3 py-1">
            Privacy
          </Link>
          <Link href="/terms" className="glass-panel rounded-full border px-3 py-1">
            Terms
          </Link>
          <Link href="/risk-disclaimer" className="glass-panel rounded-full border px-3 py-1">
            Risk
          </Link>
        </div>
      </div>
    </footer>
  );
}
