import { cn } from "@/lib/utils/cn";

interface WolfpackLogoMarkProps {
  className?: string;
}

export function WolfpackLogoMark({ className }: WolfpackLogoMarkProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex overflow-hidden rounded-md border border-white/10 bg-[#0A0A0A] bg-[length:320%_320%] bg-[position:50%_23%]",
        className,
      )}
      style={{ backgroundImage: "url('/brand/vargpack-mockup-full.png')" }}
    />
  );
}
