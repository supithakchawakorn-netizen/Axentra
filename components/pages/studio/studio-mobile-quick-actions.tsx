import Link from "next/link";
import { BarChart3, Clapperboard, Radio, Settings, Upload } from "lucide-react";

const ACTIONS = [
  { href: "/studio/upload", label: "Upload", icon: Upload },
  { href: "/studio/live", label: "Go live", icon: Radio },
  { href: "/studio/videos", label: "Videos", icon: Clapperboard },
  { href: "/studio/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/studio/settings", label: "Settings", icon: Settings },
] as const;

export function StudioMobileQuickActions() {
  return (
    <section className="sm:hidden space-y-3">
      <h2 className="text-base font-semibold tracking-tight">Quick actions</h2>
      <div className="grid grid-cols-3 gap-2">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="glass-panel flex min-h-20 flex-col items-center justify-center gap-1 rounded-xl border p-2 text-center active:scale-[0.98]"
            >
              <Icon className="size-4" />
              <span className="text-xs font-medium">{action.label}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

