import { cn } from "@/lib/utils/cn";

interface WolfpackHeroStripProps {
  className?: string;
  caption: string;
}

export function WolfpackHeroStrip({ className, caption }: WolfpackHeroStripProps) {
  return (
    <section
      className={cn(
        "premium-surface relative overflow-hidden rounded-xl border p-4",
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[length:130%_auto] bg-[position:50%_20%] opacity-30"
        style={{ backgroundImage: "url('/brand/vargpack-mockup-full.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-black/65" />
      <p className="relative text-xs uppercase tracking-[0.22em] text-white/90">
        {caption}
      </p>
    </section>
  );
}
