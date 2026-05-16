"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MessageSquare, Search, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommunityPostCard } from "@/components/community/community-post-card";
import type { CommunityFeedPost } from "@/lib/data/community";
import { LiveRoomCard } from "@/components/live/live-room-card";
import type { PublicLiveRoom } from "@/lib/data/live-rooms";
import type { CommunitySort } from "@/types/community";

const sorts: Array<{ value: CommunitySort; label: string }> = [
  { value: "trending", label: "Trending" },
  { value: "new", label: "New" },
  { value: "top", label: "Top" },
];

export function CommunityFeedShell({
  initialPosts,
  hasMore,
  page,
  selectedSort,
  query,
  stats,
  activeTab,
  communityName,
  liveNowCount,
  liveRooms,
  viewer,
  latestCommentByPostId,
  allowGuestDemoPosting = false,
}: {
  initialPosts: CommunityFeedPost[];
  hasMore: boolean;
  page: number;
  selectedSort: CommunitySort;
  query: string;
  stats: { members: number; postsThisWeek: number };
  activeTab: "discussion" | "live" | "library";
  communityName: string;
  liveNowCount: number;
  liveRooms: PublicLiveRoom[];
  viewer: {
    isSignedIn: boolean;
    name: string | null;
    avatarUrl: string | null;
  };
  latestCommentByPostId: Record<string, string | null>;
  allowGuestDemoPosting?: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [postPatches, setPostPatches] = useState<Record<string, Partial<CommunityFeedPost>>>({});
  const [search, setSearch] = useState(query);
  const [showSearch, setShowSearch] = useState(Boolean(query));
  const [joined, setJoined] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeText, setComposeText] = useState("");
  const posts = useMemo(
    () =>
      initialPosts.map((post) => ({
        ...post,
        ...(postPatches[post.id] ?? {}),
      })),
    [initialPosts, postPatches],
  );


  useEffect(() => {
    const handle = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search.trim()) params.set("q", search.trim());
      else params.delete("q");
      params.set("page", "1");
      router.replace(`${pathname}?${params.toString()}`);
    }, 350);
    return () => clearTimeout(handle);
  }, [pathname, router, search, searchParams]);

  const nextPageHref = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page + 1));
    return `${pathname}?${params.toString()}`;
  }, [page, pathname, searchParams]);
  const libraryPosts = useMemo(
    () =>
      posts.filter(
        (post) =>
          post.category === "tutorial" ||
          post.category === "announcement" ||
          Boolean(post.cover_image_url),
      ),
    [posts],
  );

  function replaceParam(name: string, value?: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(name, value);
    else params.delete(name);
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  }

  function onTabChange(nextTab: string) {
    if (nextTab !== "discussion" && nextTab !== "live" && nextTab !== "library") return;
    replaceParam("tab", nextTab === "discussion" ? undefined : nextTab);
  }

  function onShareCommunity() {
    const url = `${window.location.origin}${pathname}`;
    navigator.clipboard.writeText(url).catch(() => null);
  }

  const topLiveRoom = liveRooms[0] ?? null;

  return (
    <div className="space-y-4">
      <section className="bg-background/90 sticky top-14 z-20 border-b backdrop-blur">
        <div className="flex h-14 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="bg-card flex size-9 items-center justify-center rounded-full border text-sm font-semibold">
              {communityName.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{communityName}</p>
              <p className="text-muted-foreground text-xs">
                {stats.members.toLocaleString()} members
                {liveNowCount > 0 ? (
                  <span className="text-live ml-2 inline-flex items-center gap-1">
                    <span className="bg-live inline-block size-1.5 rounded-full animate-pulse" />
                    {liveNowCount} live now
                  </span>
                ) : null}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              className="h-8"
              variant={joined ? "outline" : "default"}
              onClick={() => setJoined((prev) => !prev)}
            >
              {joined ? "Joined" : "Join"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={onShareCommunity}
              aria-label="Share community"
            >
              <Share2 className="size-4" />
            </Button>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={onTabChange} className="gap-0">
          <TabsList className="bg-transparent h-10 w-full justify-start gap-5 overflow-x-auto rounded-none px-0 py-0">
            <TabsTrigger
              value="discussion"
              className="data-[state=active]:text-foreground data-[state=active]:border-primary h-10 rounded-none border-x-0 border-t-0 border-b-2 border-transparent px-0 text-sm shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Discussion
            </TabsTrigger>
            <TabsTrigger
              value="live"
              className="data-[state=active]:text-foreground data-[state=active]:border-primary h-10 rounded-none border-x-0 border-t-0 border-b-2 border-transparent px-0 text-sm shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Live
            </TabsTrigger>
            <TabsTrigger
              value="library"
              className="data-[state=active]:text-foreground data-[state=active]:border-primary h-10 rounded-none border-x-0 border-t-0 border-b-2 border-transparent px-0 text-sm shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Library
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </section>

      {activeTab === "discussion" ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-4">
            <div className="bg-card space-y-3 rounded-xl border p-3">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground size-8"
                  onClick={() => setShowSearch((prev) => !prev)}
                  aria-label="Toggle search"
                >
                  <Search className="size-4" />
                </Button>
                {showSearch ? (
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search posts"
                    className="h-9"
                  />
                ) : (
                  <p className="text-muted-foreground text-sm">Search discussions</p>
                )}
              </div>
              <div className="bg-background flex items-start gap-3 rounded-lg border p-3">
                <div className="bg-muted relative mt-0.5 size-9 shrink-0 overflow-hidden rounded-full border">
                  {viewer.avatarUrl ? (
                    <Image
                      src={viewer.avatarUrl}
                      alt={viewer.name ?? "Viewer avatar"}
                      fill
                      sizes="36px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : null}
                </div>
                {viewer.isSignedIn ? (
                  <div className="w-full space-y-2">
                    {!composeOpen ? (
                      <button
                        type="button"
                        className="border-input text-muted-foreground hover:text-foreground h-10 w-full rounded-md border px-3 text-left text-sm"
                        onClick={() => setComposeOpen(true)}
                      >
                        Share with the community...
                      </button>
                    ) : (
                      <>
                        <textarea
                          rows={4}
                          value={composeText}
                          onChange={(event) => setComposeText(event.target.value)}
                          placeholder="Share context, what changed, and what feedback you want."
                          className="border-input w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setComposeOpen(false);
                              setComposeText("");
                            }}
                          >
                            Cancel
                          </Button>
                          <Button asChild size="sm" className="h-8">
                            <Link href="/community/new">Post</Link>
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {allowGuestDemoPosting ? (
                      <Button asChild size="sm" className="h-8">
                        <Link href="/community/new">Post as guest (demo)</Link>
                      </Button>
                    ) : (
                      <Button asChild size="sm" className="h-8">
                        <Link href={`/sign-in?next=${encodeURIComponent(`${pathname}?${searchParams.toString()}`)}`}>
                          Sign in to post
                        </Link>
                      </Button>
                    )}
                    {allowGuestDemoPosting ? (
                      <p className="text-muted-foreground text-xs">
                        Local/dev demo mode only. Production still requires sign-in.
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 text-sm">
              {sorts.map((sort) => (
                <button
                  key={sort.value}
                  type="button"
                  onClick={() => replaceParam("sort", sort.value)}
                  className={
                    selectedSort === sort.value
                      ? "decoration-primary text-foreground underline underline-offset-4"
                      : "text-muted-foreground hover:text-foreground"
                  }
                >
                  {sort.label}
                </button>
              ))}
            </div>

            {posts.length === 0 ? (
              <div className="bg-card rounded-xl border p-8 text-center">
                <p className="text-lg font-semibold">No posts yet</p>
                <p className="text-muted-foreground mt-2 text-sm">
                  Start the conversation with the first post.
                </p>
                <Button asChild className="mt-4 h-9">
                  <Link href="/community/new">Write the first post</Link>
                </Button>
              </div>
            ) : (
              posts.map((post) => (
                <CommunityPostCard
                  key={post.id}
                  post={post}
                  latestCommentPreview={latestCommentByPostId[post.id] ?? null}
                  onPostUpdated={(patch) => {
                    setPostPatches((prev) => ({
                      ...prev,
                      [post.id]: { ...(prev[post.id] ?? {}), ...patch },
                    }));
                  }}
                />
              ))
            )}

            {hasMore ? (
              <Button asChild variant="outline" className="h-9 w-full">
                <Link href={nextPageHref}>Load more posts</Link>
              </Button>
            ) : null}

            <div className="space-y-3 lg:hidden">
              <details className="bg-card rounded-xl border p-4">
                <summary className="cursor-pointer text-sm font-semibold">
                  About this community
                </summary>
                <p className="text-muted-foreground mt-3 text-sm">
                  A shared space for creators to post playbooks, ask for feedback, and keep a
                  high-signal conversation moving.
                </p>
                <ul className="text-muted-foreground mt-3 space-y-2 text-sm">
                  <li>Lead with context before opinions.</li>
                  <li>Keep replies actionable and specific.</li>
                  <li>Credit source material when quoting ideas.</li>
                  <li>Be direct, respectful, and constructive.</li>
                </ul>
              </details>
              <details className="bg-card rounded-xl border p-4">
                <summary className="cursor-pointer text-sm font-semibold">
                  Live now in this pack
                </summary>
                {topLiveRoom ? (
                  <div className="mt-3">
                    <LiveRoomCard room={topLiveRoom} prefetch={false} />
                  </div>
                ) : (
                  <p className="text-muted-foreground mt-3 text-sm">No live session right now.</p>
                )}
              </details>
            </div>
          </div>

          <aside className="hidden space-y-4 lg:block">
            <div className="bg-card rounded-xl border p-5">
              <p className="text-sm font-semibold">About this community</p>
              <p className="text-muted-foreground mt-2 text-sm">
                A shared space for creators to post playbooks, ask for feedback, and keep a
                high-signal conversation moving.
              </p>
              <ul className="text-muted-foreground mt-3 space-y-2 text-sm">
                <li>Lead with context before opinions.</li>
                <li>Keep replies actionable and specific.</li>
                <li>Credit source material when quoting ideas.</li>
                <li>Be direct, respectful, and constructive.</li>
              </ul>
            </div>
            {topLiveRoom ? (
              <div className="bg-card rounded-xl border p-5">
                <p className="text-sm font-semibold">Live now in this pack</p>
                <div className="mt-3">
                  <LiveRoomCard room={topLiveRoom} prefetch={false} />
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      ) : null}

      {activeTab === "live" ? (
        <section className="space-y-3">
          {liveRooms.length === 0 ? (
            <div className="bg-card rounded-xl border p-8 text-center">
              <p className="font-semibold">No live sessions right now</p>
              <p className="text-muted-foreground mt-2 text-sm">
                Live sessions from packs appear here when creators go live.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {liveRooms.map((room) => (
                <LiveRoomCard key={room.id} room={room} prefetch={false} />
              ))}
            </div>
          )}
        </section>
      ) : null}

      {activeTab === "library" ? (
        <section className="space-y-3">
          {libraryPosts.length === 0 ? (
            <div className="bg-card rounded-xl border p-8 text-center">
              <p className="font-semibold">No library posts yet</p>
              <p className="text-muted-foreground mt-2 text-sm">
                Tutorial and reference posts appear here.
              </p>
            </div>
          ) : (
            libraryPosts.map((post) => (
              <article key={post.id} className="bg-card rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">
                      {post.category}
                    </p>
                    <Link href={`/community/${post.id}`} className="line-clamp-2 text-sm font-semibold hover:underline">
                      {post.title}
                    </Link>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-1 text-xs">
                    <MessageSquare className="size-3.5" />
                    {post.comment_count}
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      ) : null}
    </div>
  );
}
