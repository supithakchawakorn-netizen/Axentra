import Link from "next/link";

const DESTINATIONS = [
  {
    href: "/explore",
    title: "Explore Feed",
    blurb: "Scan recent market commentary by creators.",
  },
  {
    href: "/live",
    title: "Live Rooms",
    blurb: "Join active sessions as they happen.",
  },
  {
    href: "/pricing",
    title: "Pricing",
    blurb: "See V1 plans and join the waitlist.",
  },
  {
    href: "/sign-in?next=/studio",
    title: "Creator Studio",
    blurb: "Upload videos, go live, and manage profile.",
  },
] as const;

export function ExperienceLinks() {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
        Explore the experience
      </h2>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {DESTINATIONS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="glass-panel hover:bg-accent/70 block rounded-xl border p-4 transition-colors"
            >
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="text-muted-foreground mt-1 text-xs">{item.blurb}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
