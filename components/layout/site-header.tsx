import Link from "next/link";
import { APP_NAME } from "@/lib/utils/site";
import { Button } from "@/components/ui/button";
import { Bell, Menu, Search, Video } from "lucide-react";
import { DisplayDensityToggle } from "@/components/layout/display-density-toggle";
import { ViewModeToggle } from "@/components/layout/view-mode-toggle";

export function SiteHeader() {
  return (
    <header className="bg-background/90 premium-surface sticky top-0 z-40 w-full border-b backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center gap-3 px-3 sm:px-4">
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground hidden rounded-md p-1.5 transition-colors lg:inline-flex"
          aria-label="Open navigation"
        >
          <Menu className="size-5" />
        </button>
        <Link href="/" className="inline-flex items-center gap-2 font-semibold tracking-tight transition-opacity hover:opacity-90">
          <span className="bg-primary text-primary-foreground ambient-glow inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1 font-mono text-[10px] tracking-wider">
            AX
          </span>
          {APP_NAME}
        </Link>

        <form
          action="/explore"
          method="get"
          className="mx-auto hidden w-full max-w-xl items-center md:flex"
        >
          <label htmlFor="global-search" className="sr-only">
            Search videos and tickers
          </label>
          <div className="bg-muted/85 border-input premium-surface flex h-10 w-full items-center rounded-l-full border px-3">
            <Search className="text-muted-foreground mr-2 size-4" />
            <input
              id="global-search"
              name="q"
              placeholder="Search videos or ticker symbols"
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

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <ViewModeToggle />
          <DisplayDensityToggle />
          <Button asChild size="icon" variant="ghost" className="hidden sm:inline-flex">
            <Link href="/studio/live" aria-label="Go live">
              <Video className="size-4" />
            </Link>
          </Button>
          <Button asChild size="icon" variant="ghost" className="hidden sm:inline-flex">
            <Link href="/sign-in" aria-label="Notifications">
              <Bell className="size-4" />
            </Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/sign-in?next=/studio">Start creating</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
