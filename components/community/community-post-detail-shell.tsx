"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PostEditor } from "@/components/community/post-editor";
import { CommunityCommentsSection } from "@/components/community/community-comments-section";
import type { CommunityCommentNode, CommunityFeedPost } from "@/lib/data/community";
import { toggleCommunitySave, toggleCommunityUpvote } from "@/app/(public)/community/_actions";
import { isDemoCommunityPostId } from "@/types/community";

export function CommunityPostDetailShell({
  initialPost,
  comments,
  commentsHasMore,
  commentsNextHref,
}: {
  initialPost: CommunityFeedPost;
  comments: CommunityCommentNode[];
  commentsHasMore: boolean;
  commentsNextHref?: string;
}) {
  const [post, setPost] = useState(initialPost);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const interactive = !isDemoCommunityPostId(post.id);

  function onToggleUpvote() {
    if (!interactive) return;
    const next = !post.viewer.upvoted;
    const nextCount = Math.max(0, post.upvote_count + (next ? 1 : -1));
    setPost((prev) => ({ ...prev, viewer: { ...prev.viewer, upvoted: next }, upvote_count: nextCount }));
    startTransition(async () => {
      const res = await toggleCommunityUpvote({ postId: post.id });
      if (!res.ok || !res.data) {
        setPost((prev) => ({
          ...prev,
          viewer: { ...prev.viewer, upvoted: !next },
          upvote_count: Math.max(0, nextCount + (next ? -1 : 1)),
        }));
        setError(res.error ?? "Could not update upvote.");
        return;
      }
      setPost((prev) => ({
        ...prev,
        viewer: { ...prev.viewer, upvoted: res.data!.upvoted },
        upvote_count: res.data!.upvoteCount,
      }));
    });
  }

  function onToggleSave() {
    if (!interactive) return;
    const next = !post.viewer.saved;
    setPost((prev) => ({ ...prev, viewer: { ...prev.viewer, saved: next } }));
    startTransition(async () => {
      const res = await toggleCommunitySave({ postId: post.id });
      if (!res.ok || !res.data) {
        setPost((prev) => ({ ...prev, viewer: { ...prev.viewer, saved: !next } }));
        setError(res.error ?? "Could not update save.");
      }
    });
  }

  return (
    <div className="space-y-8">
      <header className="space-y-4 rounded-xl border bg-white p-6">
        <h1 className="text-4xl font-bold leading-tight">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <p className="font-semibold">{post.author?.display_name ?? `@${post.author?.handle ?? "member"}`}</p>
          <span className="rounded-full border px-3 py-1">Creator</span>
        </div>
      </header>

      {post.cover_image_url ? (
        <div className="relative aspect-[16/7] overflow-hidden rounded-xl border">
          <Image src={post.cover_image_url} alt="" fill className="object-cover" unoptimized />
        </div>
      ) : null}

      <div className="flex justify-center">
        <Button type="button" className="h-12 min-w-64 text-base" onClick={onToggleUpvote} disabled={isPending || !interactive}>
          ▲ Upvote this post ({post.upvote_count})
        </Button>
      </div>

      <article className="rounded-xl border bg-white p-6">
        <PostEditor value={post.body} readOnly />
      </article>

      <div className="space-y-3 rounded-xl border bg-white p-6">
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <a key={tag} href={`/community?q=${encodeURIComponent(tag)}`} className="rounded-full border px-3 py-2 text-sm">
              #{tag}
            </a>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="h-11" onClick={() => navigator.clipboard.writeText(window.location.href)}>
            Copy Link
          </Button>
          <Button type="button" variant={post.viewer.saved ? "secondary" : "outline"} className="h-11" onClick={onToggleSave} disabled={!interactive}>
            Save Post
          </Button>
        </div>
        {!interactive ? <p className="text-muted-foreground text-sm">Demo posts are read-only.</p> : null}
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
      </div>

      <CommunityCommentsSection
        postId={post.id}
        initialComments={comments}
        hasMore={commentsHasMore}
        nextPageHref={commentsNextHref}
      />
    </div>
  );
}
