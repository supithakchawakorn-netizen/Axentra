import Link from "next/link";
import { Search, User, Video } from "lucide-react";
import { ViewModeToggle } from "@/components/layout/view-mode-toggle";
import { DisplayDensityToggle } from "@/components/layout/display-density-toggle";
import { WolfpackLogoMark } from "@/components/layout/wolfpack-logo-mark";

export function SiteHeaderMobile({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <div className="flex h-14 w-full items-center gap-2 px-3 sm:hidden">
      <Link href="/" aria-label="Home" className="inline-flex">
        <WolfpackLogoMark className="size-8 rounded-lg" />
      </Link>
      <form action="/search" method="get" className="flex w-full items-center">
        <label htmlFor="mobile-search" className="sr-only">
          Search communities and videos
        </label>
        <div className="bg-muted/85 border-input premium-surface flex h-9 w-full items-center rounded-full border px-3">
          <Search className="text-muted-foreground mr-2 size-4" />
          <input
            id="mobile-search"
            name="q"
            placeholder="Search"
            className="placeholder:text-muted-foreground w-full bg-transparent text-sm outline-none"
          />
        </div>
      </form>
      <ViewModeToggle />
      <DisplayDensityToggle />
      <Link
        href="/studio/live"
        aria-label="Go live"
        className="inline-flex size-9 items-center justify-center rounded-md hover:bg-muted/50"
      >
        <Video className="size-4" />
      </Link>
      {isSignedIn ? (
        <Link
          href="/studio/settings"
          aria-label="Account settings"
          className="inline-flex size-9 items-center justify-center rounded-md hover:bg-muted/50"
        >
          <User className="size-4" />
        </Link>
      ) : (
        <Link
          href="/sign-in"
          aria-label="Sign in"
          className="inline-flex size-9 items-center justify-center rounded-md hover:bg-muted/50"
        >
          <User className="size-4" />
        </Link>
      )}
    </div>
  );
}

