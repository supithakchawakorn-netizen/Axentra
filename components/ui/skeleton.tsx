import { cn } from "@/lib/utils/cn";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent/70 rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
