import Link from "next/link";
import { Search, Video } from "lucide-react";
import { APP_NAME } from "@/lib/utils/site";
import { Button } from "@/components/ui/button";
import { DisplayDensityToggle } from "@/components/layout/display-density-toggle";
import { ViewModeToggle } from "@/components/layout/view-mode-toggle";
import { WolfpackLogoMark } from "@/components/layout/wolfpack-logo-mark";

export function SiteHeaderDesktop({
  isSignedIn,
  accountLabel,
}: {
  isSignedIn: boolean;
  accountLabel: string | null;
}) {
  return (
    <div className="mx-auto hidden h-14 w-full max-w-[1400px] items-center gap-3 px-4 sm:flex">
      <Link
        href="/"
        className="inline-flex items-center gap-2 font-semibold tracking-tight transition-opacity hover:opacity-90"
      >
        <WolfpackLogoMark className="ambient-glow h-6 min-w-6" />
        {APP_NAME}
      </Link>

      <form
        action="/search"
        method="get"
        className="mx-auto hidden w-full max-w-xl items-center md:flex"
      >
        <label htmlFor="global-search" className="sr-only">
          Search communities and videos
        </label>
        <div className="bg-muted/85 border-input premium-surface flex h-10 w-full items-center rounded-l-full border px-3">
          <Search className="text-muted-foreground mr-2 size-4" />
          <input
            id="global-search"
            name="q"
            placeholder="Search communities or creators"
            className="placeholder:text-muted-foreground w-full bg-transparent text-sm outline-none"
          />
        </div>
        <button
          type="submit"
          className="bg-secondary hover:bg-accent premium-lift inline-flex h-10 items-center rounded-r-full border border-l-0 px-4 text-sm"
          aria-label="Search"
        >
          <Search className="size-4" />
        </button>
      </form>

      <div className="ml-auto flex items-center gap-2">
        <Button asChild size="sm" variant="ghost">
          <Link href="/explore">Explore</Link>
        </Button>
        <Button asChild size="sm" variant="ghost">
          <Link href="/subscriptions">Subscriptions</Link>
        </Button>
        <Button asChild size="sm" variant="ghost">
          <Link href="/live">Live</Link>
        </Button>
        <ViewModeToggle />
        <DisplayDensityToggle />
        <Button asChild size="icon" variant="ghost">
          <Link href="/studio/live" aria-label="Go live">
            <Video className="size-4" />
          </Link>
        </Button>
        {isSignedIn ? (
          <Button asChild size="sm" variant="ghost">
            <Link href="/studio/settings" className="max-w-[180px] truncate">
              {accountLabel ?? "Account"}
            </Link>
          </Button>
        ) : (
          <>
            <Button asChild size="sm" variant="ghost">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/sign-in?next=/studio">Start creating</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

