"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { addCommunityComment, reportCommunityContent, toggleCommunityCommentLike } from "@/app/(public)/community/_actions";
import type { CommunityCommentNode } from "@/lib/data/community";
import { isDemoCommunityPostId } from "@/types/community";

export function CommunityCommentsSection({
  postId,
  initialComments,
  hasMore,
  nextPageHref,
}: {
  postId: string;
  initialComments: CommunityCommentNode[];
  hasMore: boolean;
  nextPageHref?: string;
}) {
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState("");
  const [replyBody, setReplyBody] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const readOnly = isDemoCommunityPostId(postId);

  function formatTimestamp(value: string): string {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  }

  function pushComment(comment: CommunityCommentNode) {
    setComments((prev) => [comment, ...prev]);
  }

  function pushReply(parentId: string, reply: CommunityCommentNode) {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === parentId
          ? { ...comment, reply_count: comment.reply_count + 1, replies: [...comment.replies, reply] }
          : comment,
      ),
    );
  }

  function onPostComment() {
    if (readOnly) return;
    if (!body.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await addCommunityComment({ postId, body: body.trim() });
      if (!res.ok || !res.data) {
        setError(res.error ?? "Could not post comment.");
        return;
      }
      pushComment({
        id: res.data.commentId,
        post_id: postId,
        parent_id: null,
        body: body.trim(),
        created_at: new Date().toISOString(),
        like_count: 0,
        reply_count: 0,
        author: { id: "self", handle: "you", display_name: "You", avatar_url: null },
        viewer: { liked: false },
        replies: [],
      });
      setBody("");
    });
  }

  function onReply(parentId: string) {
    if (readOnly) return;
    const value = replyBody[parentId]?.trim();
    if (!value) return;
    setError(null);
    startTransition(async () => {
      const res = await addCommunityComment({ postId, parentId, body: value });
      if (!res.ok || !res.data) {
        setError(res.error ?? "Could not post reply.");
        return;
      }
      pushReply(parentId, {
        id: res.data.commentId,
        post_id: postId,
        parent_id: parentId,
        body: value,
        created_at: new Date().toISOString(),
        like_count: 0,
        reply_count: 0,
        author: { id: "self", handle: "you", display_name: "You", avatar_url: null },
        viewer: { liked: false },
        replies: [],
      });
      setReplyBody((prev) => ({ ...prev, [parentId]: "" }));
    });
  }

  function onToggleLike(commentId: string, parentId?: string) {
    if (readOnly) return;
    const updateLocal = (liked: boolean, count: number) => {
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === commentId) {
            return { ...comment, viewer: { liked }, like_count: count };
          }
          if (parentId && comment.id === parentId) {
            return {
              ...comment,
              replies: comment.replies.map((reply) =>
                reply.id === commentId
                  ? { ...reply, viewer: { liked }, like_count: count }
                  : reply,
              ),
            };
          }
          return comment;
        }),
      );
    };

    const target = comments
      .flatMap((comment) => [comment, ...comment.replies])
      .find((comment) => comment.id === commentId);
    if (!target) return;

    const nextLiked = !target.viewer.liked;
    const nextCount = Math.max(0, target.like_count + (nextLiked ? 1 : -1));
    updateLocal(nextLiked, nextCount);
    startTransition(async () => {
      const res = await toggleCommunityCommentLike({ commentId });
      if (!res.ok || !res.data) {
        updateLocal(target.viewer.liked, target.like_count);
        setError(res.error ?? "Could not update like.");
      }
    });
  }

  function onReport(commentId: string) {
    if (readOnly) return;
    startTransition(async () => {
      const res = await reportCommunityContent({
        commentId,
        reason: "Reported from comment thread.",
      });
      if (!res.ok) setError(res.error ?? "Could not report comment.");
    });
  }

  return (
    <section id="comments" className="space-y-4">
      <h2 className="text-2xl font-bold">Comments</h2>
      <div className="space-y-3 rounded-xl border bg-white p-5">
        {readOnly ? (
          <p className="text-muted-foreground text-sm">Demo comments are read-only.</p>
        ) : null}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your thoughts..."
          rows={4}
          className="border-input h-28 w-full rounded-md border px-3 py-2 text-base"
          disabled={readOnly}
        />
        <Button type="button" className="h-11" onClick={onPostComment} disabled={isPending || readOnly}>
          {isPending ? "Posting…" : "Post Comment"}
        </Button>
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
      </div>

      {comments.map((comment) => (
        <article key={comment.id} className="space-y-3 rounded-xl border bg-white p-5">
          <header className="flex items-center justify-between">
            <p className="text-sm font-semibold">{comment.author?.display_name ?? `@${comment.author?.handle ?? "member"}`}</p>
            <time className="text-muted-foreground text-xs" suppressHydrationWarning>
              {formatTimestamp(comment.created_at)}
            </time>
          </header>
          <p className="text-base leading-7">{comment.body}</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant={comment.viewer.liked ? "secondary" : "outline"} className="h-11" onClick={() => onToggleLike(comment.id)} disabled={readOnly}>
              👍 Like ({comment.like_count})
            </Button>
            <Button type="button" variant="outline" className="h-11" onClick={() => onReply(comment.id)} disabled={readOnly}>
              💬 Reply
            </Button>
            <Button type="button" variant="outline" className="h-11" onClick={() => onReport(comment.id)} disabled={readOnly}>
              🚩 Report
            </Button>
          </div>
          <div className="space-y-2">
            <textarea
              value={replyBody[comment.id] ?? ""}
              onChange={(e) => setReplyBody((prev) => ({ ...prev, [comment.id]: e.target.value }))}
              placeholder="Write a reply"
              rows={3}
              className="border-input w-full rounded-md border px-3 py-2 text-base"
              disabled={readOnly}
            />
            <Button type="button" variant="outline" className="h-11" onClick={() => onReply(comment.id)} disabled={readOnly}>
              Post Reply
            </Button>
          </div>
          {comment.replies.length > 0 ? (
            <div className="space-y-3 border-l-2 pl-4">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="space-y-2 rounded-lg border p-4">
                  <header className="flex items-center justify-between">
                    <p className="text-sm font-semibold">
                      {reply.author?.display_name ?? `@${reply.author?.handle ?? "member"}`}
                    </p>
                    <time className="text-muted-foreground text-xs" suppressHydrationWarning>
                      {formatTimestamp(reply.created_at)}
                    </time>
                  </header>
                  <p className="text-base leading-7">{reply.body}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant={reply.viewer.liked ? "secondary" : "outline"}
                      className="h-11"
                      onClick={() => onToggleLike(reply.id, comment.id)}
                      disabled={readOnly}
                    >
                      👍 Like ({reply.like_count})
                    </Button>
                    <Button type="button" variant="outline" className="h-11" onClick={() => onReport(reply.id)} disabled={readOnly}>
                      🚩 Report
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </article>
      ))}

      {hasMore && nextPageHref ? (
        <Button asChild variant="outline" className="h-11 w-full">
          <a href={nextPageHref}>Load more comments</a>
        </Button>
      ) : null}
    </section>
  );
}
