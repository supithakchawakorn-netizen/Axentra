"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleDollarSign,
  Compass,
  Home,
  Radio,
  TrendingUp,
  TvMinimalPlay,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/live", label: "Live", icon: Radio },
  { href: "/setup", label: "Setup", icon: Wrench },
  { href: "/pricing", label: "Pricing", icon: CircleDollarSign },
  { href: "/sign-in?next=/studio", label: "Create", icon: TvMinimalPlay },
] as const;

const TICKERS = ["SPY", "QQQ", "NVDA", "AAPL", "MSFT", "TSLA"] as const;

export function PublicSidebar() {
  const pathname = usePathname();

  return (
    <div className="soft-enter space-y-6 py-4">
      <nav>
        <ul className="space-y-1.5">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "premium-lift flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-secondary premium-surface text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="space-y-2 border-t pt-4">
        <p className="text-muted-foreground flex items-center gap-2 px-3 text-xs uppercase tracking-wider">
          <TrendingUp className="size-3.5" />
          Tickers
        </p>
        <ul className="flex flex-wrap gap-1 px-3">
          {TICKERS.map((ticker) => (
            <li key={ticker}>
              <Link
                href={`/explore?ticker=${ticker}`}
                className="bg-muted premium-lift hover:bg-accent inline-flex rounded-full px-2 py-1 font-mono text-[11px]"
              >
                ${ticker}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
