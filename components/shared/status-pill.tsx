import { cn } from "@/lib/utils/cn";

type Tone = "neutral" | "success" | "warning" | "danger" | "live";

function toneClass(tone: Tone) {
  switch (tone) {
    case "success":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
    case "warning":
      return "bg-amber-500/15 text-amber-400 border-amber-500/20";
    case "danger":
      return "bg-destructive/15 text-destructive border-destructive/30";
    case "live":
      return "bg-destructive text-white border-transparent shadow-[0_0_18px_rgba(255,74,74,0.45)]";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function StatusPill({
  label,
  tone = "neutral",
  className,
}: {
  label: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium transition-all",
        toneClass(tone),
        className,
      )}
    >
      {label}
    </span>
  );
}
