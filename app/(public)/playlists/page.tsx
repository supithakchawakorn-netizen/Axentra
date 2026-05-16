import Link from "next/link";

export const metadata = {
  title: "Playlists",
  description: "Access your playlists including liked videos and watch history.",
};

const PLAYLISTS = [
  {
    href: "/playlists/liked",
    title: "Liked videos",
    description: "Videos you liked while watching.",
  },
  {
    href: "/playlists/history",
    title: "Watch history",
    description: "Resume from your recent watch sessions.",
  },
  {
    href: "/playlists/watch-later",
    title: "Watch later",
    description: "Saved videos to revisit when ready.",
  },
] as const;

export default function PlaylistsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-2 py-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Playlists</h1>
        <p className="text-muted-foreground text-sm">Your personal video library and queues.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PLAYLISTS.map((playlist) => (
          <Link
            key={playlist.href}
            href={playlist.href}
            className="glass-panel rounded-xl border p-4 transition-colors hover:bg-muted/40"
          >
            <h2 className="font-semibold">{playlist.title}</h2>
            <p className="text-muted-foreground mt-1 text-sm">{playlist.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
