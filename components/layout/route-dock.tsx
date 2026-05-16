"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const ROUTES = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/subscriptions", label: "Subscriptions" },
  { href: "/playlists", label: "Playlists" },
  { href: "/feed/trending", label: "Trending" },
  { href: "/live", label: "Live" },
  { href: "/pricing", label: "Pricing" },
  { href: "/setup", label: "Setup" },
  { href: "/sign-in", label: "Sign in" },
  { href: "/studio", label: "Studio" },
] as const;

export function RouteDock() {
  const pathname = usePathname();
  if (pathname === "/community" || pathname.startsWith("/community/")) {
    return null;
  }

  return (
    <nav aria-label="Quick route dock" className="overflow-x-auto">
      <ul className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2">
        {ROUTES.map((route) => {
          const active =
            route.href === "/"
              ? pathname === "/"
              : pathname === route.href || pathname.startsWith(`${route.href}/`);
          return (
            <li key={route.href}>
              <Link
                href={route.href}
                className={cn(
                  "inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "glass-panel text-muted-foreground hover:text-foreground border-border",
                )}
              >
                {route.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
