"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { communityDemoPostingEnabled } from "@/lib/env";
import { addDemoGuestCommunityPost } from "@/lib/data/community";
import type { Database } from "@/types/db";
import {
  AddCommunityCommentInputZ,
  CommunityCategoryZ,
  CreateCommunityPostInputZ,
  ModeratePostInputZ,
  ReportContentInputZ,
  ToggleCommentLikeInputZ,
  TogglePostReactionInputZ,
  UpdateCommunityPostInputZ,
  isDemoCommunityCommentId,
  isDemoCommunityPostId,
  isUuidId,
  type AddCommunityCommentInput,
  type CreateCommunityPostInput,
  type ModeratePostInput,
  type ReportContentInput,
  type ToggleCommentLikeInput,
  type TogglePostReactionInput,
  type UpdateCommunityPostInput,
} from "@/types/community";

interface ActionResult<T = undefined> {
  ok: boolean;
  error?: string;
  data?: T;
}

function extractPlainText(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as unknown;
    const parts: string[] = [];
    const walk = (value: unknown) => {
      if (!value || typeof value !== "object") return;
      if (Array.isArray(value)) {
        for (const item of value) walk(item);
        return;
      }
      const node = value as { text?: unknown; content?: unknown };
      if (typeof node.text === "string") parts.push(node.text);
      walk(node.content);
    };
    walk(parsed);
    return parts.join(" ").replace(/\s+/g, " ").trim();
  } catch {
    return raw.replace(/\s+/g, " ").trim();
  }
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

async function canModeratePost(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, postId: string) {
  const { data: post } = await supabase
    .from("community_posts")
    .select("author_id, community_id")
    .eq("id", postId)
    .maybeSingle();
  if (!post) return false;
  if (post.author_id === userId) return true;

  const [{ data: community }, { data: membership }] = await Promise.all([
    supabase
      .from("communities")
      .select("owner_id")
      .eq("id", post.community_id)
      .maybeSingle(),
    supabase
      .from("community_memberships")
      .select("role")
      .eq("community_id", post.community_id)
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  return (
    community?.owner_id === userId ||
    membership?.role === "owner" ||
    membership?.role === "moderator"
  );
}

export async function createCommunityPost(input: CreateCommunityPostInput): Promise<ActionResult<{ postId: string }>> {
  const { supabase, user } = await requireUser();
  const demoMode = communityDemoPostingEnabled();
  const rawCommunityId =
    typeof input.communityId === "string" ? input.communityId : "";
  const shouldUseDemoPath =
    demoMode &&
    !user &&
    (rawCommunityId.startsWith("demo-community-") || rawCommunityId.length === 0);

  if (shouldUseDemoPath) {
    const title = typeof input.title === "string" ? input.title.trim() : "";
    const body = typeof input.body === "string" ? input.body.trim() : "";
    const excerptRaw =
      typeof input.excerpt === "string" ? input.excerpt.trim() : "";
    const categoryParsed = CommunityCategoryZ.safeParse(input.category);
    if (title.length === 0 || body.length === 0) {
      return { ok: false, error: "Title and body are required." };
    }
    const excerpt = excerptRaw || body.slice(0, 280);
    const tags = Array.isArray(input.tags)
      ? input.tags
          .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
          .filter(Boolean)
          .slice(0, 8)
      : [];
    const coverImageUrl =
      typeof input.coverImageUrl === "string" && input.coverImageUrl.length > 0
        ? input.coverImageUrl
        : null;
    const demo = await addDemoGuestCommunityPost({
      communityId: rawCommunityId || "demo-community-1",
      title,
      body,
      excerpt,
      category: categoryParsed.success ? categoryParsed.data : "discussion",
      tags,
      coverImageUrl,
    });
    revalidatePath("/community");
    revalidatePath(`/community/${demo.postId}`);
    return { ok: true, data: { postId: demo.postId } };
  }

  const parsed = CreateCommunityPostInputZ.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  if (!user) return { ok: false, error: "Not signed in." };

  const excerpt = parsed.data.excerpt?.trim() || extractPlainText(parsed.data.body).slice(0, 280);
  const { data, error } = await supabase
    .from("community_posts")
    .insert({
      community_id: parsed.data.communityId,
      author_id: user.id,
      title: parsed.data.title,
      body: parsed.data.body,
      excerpt,
      category: parsed.data.category,
      tags: parsed.data.tags,
      cover_image_url: parsed.data.coverImageUrl ?? null,
      status: parsed.data.status,
      published_at: parsed.data.status === "published" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();
  if (error || !data) {
    return { ok: false, error: error?.message ?? "Could not create post." };
  }

  revalidatePath("/community");
  revalidatePath(`/community/${data.id}`);
  return { ok: true, data: { postId: data.id as string } };
}

export async function updateCommunityPost(input: UpdateCommunityPostInput): Promise<ActionResult> {
  const parsed = UpdateCommunityPostInputZ.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const update: Database["public"]["Tables"]["community_posts"]["Update"] = {};
  if (parsed.data.title !== undefined) update.title = parsed.data.title;
  if (parsed.data.body !== undefined) update.body = parsed.data.body;
  if (parsed.data.excerpt !== undefined) update.excerpt = parsed.data.excerpt;
  if (parsed.data.category !== undefined) update.category = parsed.data.category;
  if (parsed.data.tags !== undefined) update.tags = parsed.data.tags;
  if (parsed.data.coverImageUrl !== undefined) update.cover_image_url = parsed.data.coverImageUrl;
  if (parsed.data.status !== undefined) {
    update.status = parsed.data.status;
    update.published_at = parsed.data.status === "published" ? new Date().toISOString() : null;
  }
  update.updated_at = new Date().toISOString();

  const moderated = await canModeratePost(supabase, user.id, parsed.data.postId);
  if (!moderated) return { ok: false, error: "Not allowed to edit this post." };

  const { error } = await supabase.from("community_posts").update(update).eq("id", parsed.data.postId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/community");
  revalidatePath(`/community/${parsed.data.postId}`);
  return { ok: true };
}

export async function deleteCommunityPost(postId: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Not signed in." };
  const moderated = await canModeratePost(supabase, user.id, postId);
  if (!moderated) return { ok: false, error: "Not allowed to delete this post." };

  const { error } = await supabase.from("community_posts").delete().eq("id", postId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/community");
  return { ok: true };
}

export async function toggleCommunityUpvote(input: TogglePostReactionInput): Promise<ActionResult<{ upvoted: boolean; upvoteCount: number }>> {
  const parsed = TogglePostReactionInputZ.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  if (isDemoCommunityPostId(parsed.data.postId)) {
    return { ok: false, error: "Demo posts are read-only." };
  }
  if (!isUuidId(parsed.data.postId)) {
    return { ok: false, error: "Invalid post id." };
  }
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: existing } = await supabase
    .from("community_post_votes")
    .select("post_id")
    .eq("post_id", parsed.data.postId)
    .eq("user_id", user.id)
    .maybeSingle();
  const upvoted = !existing;
  if (existing) {
    const { error } = await supabase
      .from("community_post_votes")
      .delete()
      .eq("post_id", parsed.data.postId)
      .eq("user_id", user.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase
      .from("community_post_votes")
      .insert({ post_id: parsed.data.postId, user_id: user.id });
    if (error) return { ok: false, error: error.message };
  }

  const { data: post, error: postError } = await supabase
    .from("community_posts")
    .select("upvote_count")
    .eq("id", parsed.data.postId)
    .maybeSingle();
  if (postError || !post) {
    return { ok: false, error: postError?.message ?? "Could not refresh upvote count." };
  }
  const nextCount = Math.max(0, post.upvote_count ?? 0);

  revalidatePath("/community");
  revalidatePath(`/community/${parsed.data.postId}`);
  return { ok: true, data: { upvoted, upvoteCount: nextCount } };
}

export async function toggleCommunitySave(input: TogglePostReactionInput): Promise<ActionResult<{ saved: boolean; saveCount: number }>> {
  const parsed = TogglePostReactionInputZ.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  if (isDemoCommunityPostId(parsed.data.postId)) {
    return { ok: false, error: "Demo posts are read-only." };
  }
  if (!isUuidId(parsed.data.postId)) {
    return { ok: false, error: "Invalid post id." };
  }
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: existing } = await supabase
    .from("community_post_saves")
    .select("post_id")
    .eq("post_id", parsed.data.postId)
    .eq("user_id", user.id)
    .maybeSingle();
  const saved = !existing;
  if (existing) {
    const { error } = await supabase
      .from("community_post_saves")
      .delete()
      .eq("post_id", parsed.data.postId)
      .eq("user_id", user.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase
      .from("community_post_saves")
      .insert({ post_id: parsed.data.postId, user_id: user.id });
    if (error) return { ok: false, error: error.message };
  }

  const { data: post, error: postError } = await supabase
    .from("community_posts")
    .select("save_count")
    .eq("id", parsed.data.postId)
    .maybeSingle();
  if (postError || !post) {
    return { ok: false, error: postError?.message ?? "Could not refresh save count." };
  }
  const nextCount = Math.max(0, post.save_count ?? 0);

  revalidatePath("/community");
  revalidatePath(`/community/${parsed.data.postId}`);
  revalidatePath("/studio/community/saved");
  return { ok: true, data: { saved, saveCount: nextCount } };
}

export async function addCommunityComment(input: AddCommunityCommentInput): Promise<ActionResult<{ commentId: string }>> {
  const parsed = AddCommunityCommentInputZ.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  if (isDemoCommunityPostId(parsed.data.postId)) {
    return { ok: false, error: "Demo posts are read-only." };
  }
  if (!isUuidId(parsed.data.postId)) {
    return { ok: false, error: "Invalid post id." };
  }
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Not signed in." };

  if (parsed.data.parentId) {
    if (!isUuidId(parsed.data.parentId)) {
      return { ok: false, error: "Invalid parent comment id." };
    }
    const { data: parent } = await supabase
      .from("community_comments")
      .select("parent_id")
      .eq("id", parsed.data.parentId)
      .maybeSingle();
    if (!parent) return { ok: false, error: "Reply target not found." };
    if (parent.parent_id) return { ok: false, error: "Only one reply level is supported." };
  }

  const { data, error } = await supabase
    .from("community_comments")
    .insert({
      post_id: parsed.data.postId,
      author_id: user.id,
      body: parsed.data.body,
      parent_id: parsed.data.parentId ?? null,
    })
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? "Could not add comment." };

  revalidatePath(`/community/${parsed.data.postId}`);
  return { ok: true, data: { commentId: data.id as string } };
}

export async function toggleCommunityCommentLike(input: ToggleCommentLikeInput): Promise<ActionResult<{ liked: boolean; likeCount: number }>> {
  const parsed = ToggleCommentLikeInputZ.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  if (isDemoCommunityCommentId(parsed.data.commentId)) {
    return { ok: false, error: "Demo comments are read-only." };
  }
  if (!isUuidId(parsed.data.commentId)) {
    return { ok: false, error: "Invalid comment id." };
  }
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: existing } = await supabase
    .from("community_comment_likes")
    .select("comment_id")
    .eq("comment_id", parsed.data.commentId)
    .eq("user_id", user.id)
    .maybeSingle();
  const liked = !existing;
  if (existing) {
    const { error } = await supabase
      .from("community_comment_likes")
      .delete()
      .eq("comment_id", parsed.data.commentId)
      .eq("user_id", user.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase
      .from("community_comment_likes")
      .insert({ comment_id: parsed.data.commentId, user_id: user.id });
    if (error) return { ok: false, error: error.message };
  }

  const { data: comment, error: commentError } = await supabase
    .from("community_comments")
    .select("like_count, post_id")
    .eq("id", parsed.data.commentId)
    .maybeSingle();
  if (commentError || !comment) {
    return { ok: false, error: commentError?.message ?? "Could not refresh like count." };
  }
  const nextCount = Math.max(0, comment.like_count ?? 0);
  if (comment?.post_id) revalidatePath(`/community/${comment.post_id}`);
  return { ok: true, data: { liked, likeCount: nextCount } };
}

export async function moderateCommunityPost(input: ModeratePostInput): Promise<ActionResult> {
  const parsed = ModeratePostInputZ.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const allowed = await canModeratePost(supabase, user.id, parsed.data.postId);
  if (!allowed) return { ok: false, error: "Not allowed to moderate this post." };

  if (parsed.data.action === "delete") {
    const { error } = await supabase.from("community_posts").delete().eq("id", parsed.data.postId);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/community");
    return { ok: true };
  }

  const patch: Database["public"]["Tables"]["community_posts"]["Update"] = {};
  if (parsed.data.action === "pin") patch.is_pinned = true;
  if (parsed.data.action === "unpin") patch.is_pinned = false;
  if (parsed.data.action === "announce") patch.is_announcement = true;
  if (parsed.data.action === "unannounce") patch.is_announcement = false;

  const { error } = await supabase.from("community_posts").update(patch).eq("id", parsed.data.postId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/community");
  revalidatePath(`/community/${parsed.data.postId}`);
  return { ok: true };
}

export async function reportCommunityContent(input: ReportContentInput): Promise<ActionResult> {
  const parsed = ReportContentInputZ.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  if ((parsed.data.postId && isDemoCommunityPostId(parsed.data.postId)) || (parsed.data.commentId && isDemoCommunityCommentId(parsed.data.commentId))) {
    return { ok: false, error: "Demo content cannot be reported." };
  }
  if ((parsed.data.postId && !isUuidId(parsed.data.postId)) || (parsed.data.commentId && !isUuidId(parsed.data.commentId))) {
    return { ok: false, error: "Invalid content id." };
  }
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase.from("community_reports").insert({
    post_id: parsed.data.postId ?? null,
    comment_id: parsed.data.commentId ?? null,
    reporter_id: user.id,
    reason: parsed.data.reason,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
