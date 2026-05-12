"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const ROUTES = [
  { href: "/studio", label: "Overview" },
  { href: "/studio/analytics", label: "Analytics" },
  { href: "/studio/upload", label: "Upload" },
  { href: "/studio/videos", label: "Manage Videos" },
  { href: "/studio/live", label: "Live" },
  { href: "/studio/settings", label: "Settings" },
] as const;

export function StudioRouteDock() {
  const pathname = usePathname();

  return (
    <nav aria-label="Studio sections" className="overflow-x-auto border-b">
      <ul className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2">
        {ROUTES.map((route) => {
          const active =
            route.href === "/studio"
              ? pathname === "/studio"
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
