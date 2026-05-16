import { notFound, redirect } from "next/navigation";

interface PlaylistIdPageProps {
  params: Promise<{ playlistId: string }>;
}

export default async function PlaylistIdPage({ params }: PlaylistIdPageProps) {
  const { playlistId } = await params;
  if (playlistId === "liked") redirect("/playlists/liked");
  if (playlistId === "history") redirect("/playlists/history");
  if (playlistId === "watch-later") redirect("/playlists/watch-later");
  notFound();
}
