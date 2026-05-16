"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toggleCommunityUpvote } from "@/app/(public)/community/_actions";
import type { CommunityFeedPost } from "@/lib/data/community";
import { isDemoCommunityPostId } from "@/types/community";

export function CommunityPostCard({
  post,
  savedMode = false,
  latestCommentPreview = null,
  onPostUpdated,
}: {
  post: CommunityFeedPost;
  savedMode?: boolean;
  latestCommentPreview?: string | null;
  onPostUpdated?: (patch: Partial<CommunityFeedPost>) => void;
}) {
  const [upvoted, setUpvoted] = useState(post.viewer.upvoted);
  const [upvotes, setUpvotes] = useState(post.upvote_count);
  const [now] = useState(() => Date.now());
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const interactive = !isDemoCommunityPostId(post.id);
  void savedMode;

  const timestamp = useMemo(() => {
    const delta = Math.max(1, Math.floor((now - new Date(post.created_at).getTime()) / 1000));
    if (delta < 60) return `${delta} seconds ago`;
    if (delta < 3600) return `${Math.floor(delta / 60)} minutes ago`;
    if (delta < 86400) return `${Math.floor(delta / 3600)} hours ago`;
    return `${Math.floor(delta / 86400)} days ago`;
  }, [now, post.created_at]);

  function onToggleUpvote() {
    setError(null);
    const nextUpvoted = !upvoted;
    const nextCount = Math.max(0, upvotes + (nextUpvoted ? 1 : -1));
    const previousUpvoted = upvoted;
    const previousCount = upvotes;
    setUpvoted(nextUpvoted);
    setUpvotes(nextCount);
    startTransition(async () => {
      const res = await toggleCommunityUpvote({ postId: post.id });
      if (!res.ok || !res.data) {
        setUpvoted(previousUpvoted);
        setUpvotes(previousCount);
        setError(res.error ?? "Could not update vote.");
        return;
      }
      setUpvoted(res.data.upvoted);
      setUpvotes(res.data.upvoteCount);
      onPostUpdated?.({ upvote_count: res.data.upvoteCount });
    });
  }

  function onShare() {
    const url = `${window.location.origin}/community/${post.id}`;
    navigator.clipboard.writeText(url).catch(() => null);
  }

  if (post.status !== "published") return null;

  return (
    <article className="bg-card space-y-3 rounded-xl border p-4">
      <header className="space-y-2">
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <div className="relative size-8 overflow-hidden rounded-full border bg-muted">
            {post.author?.avatar_url ? (
              <Image
                src={post.author.avatar_url}
                alt=""
                fill
                sizes="32px"
                className="object-cover"
                unoptimized
              />
            ) : null}
          </div>
          <p className="min-w-0 truncate font-medium">
            @{post.author?.handle ?? "member"}
          </p>
          <span className="text-muted-foreground border-border rounded-full border px-2 py-0.5 text-[10px] uppercase">
            {post.category}
          </span>
          <span className="text-muted-foreground ml-auto text-xs">· {timestamp}</span>
        </div>
        <Link href={`/community/${post.id}`} className="block">
          <h2 className="line-clamp-1 text-base font-semibold hover:underline">
            {post.title}
          </h2>
        </Link>
        <div className="relative">
          <p className="text-muted-foreground line-clamp-2 text-sm leading-6">{post.excerpt}</p>
          <div className="from-card pointer-events-none absolute right-0 bottom-0 h-6 w-20 bg-gradient-to-l to-transparent" />
        </div>
      </header>

      {post.cover_image_url ? (
        <div className="relative aspect-[16/7] w-full overflow-hidden rounded-lg border">
          <Image
            src={post.cover_image_url}
            alt=""
            fill
            loading="lazy"
            sizes="(max-width: 1024px) 100vw, 900px"
            className="object-cover"
            unoptimized
          />
        </div>
      ) : null}

      <footer className="space-y-2">
        <div className="text-muted-foreground flex items-center justify-between gap-2 text-xs">
          <p>
            <span className={upvotes > 0 ? "text-positive" : "text-muted-foreground"}>
              ↑ {upvotes}
            </span>{" "}
            · {post.comment_count} replies
          </p>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={upvoted ? "text-positive" : "text-muted-foreground"}
              disabled={isPending || !interactive}
              onClick={onToggleUpvote}
            >
              Upvote
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
              <Link href={`/community/${post.id}#comments`}>Replies</Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={onShare}
            >
              Share
            </Button>
          </div>
        </div>
        {!interactive ? (
          <p className="text-muted-foreground text-xs">Demo posts are read-only.</p>
        ) : null}
        {latestCommentPreview ? (
          <p className="text-muted-foreground line-clamp-1 text-xs">
            Latest reply: {latestCommentPreview}
          </p>
        ) : null}
        {error ? <p className="text-negative text-sm">{error}</p> : null}
      </footer>
    </article>
  );
}
