import { describe, expect, it } from "vitest";
import {
  AddCommunityCommentInputZ,
  ToggleCommentLikeInputZ,
  TogglePostReactionInputZ,
  isDemoCommunityCommentId,
  isDemoCommunityPostId,
  isUuidId,
} from "@/types/community";

describe("community id parsing helpers", () => {
  it("detects demo post ids", () => {
    expect(isDemoCommunityPostId("demo-community-post-1")).toBe(true);
    expect(isDemoCommunityPostId("demo-guest-post-abc")).toBe(true);
    expect(isDemoCommunityPostId(crypto.randomUUID())).toBe(false);
  });

  it("detects demo comment ids", () => {
    expect(isDemoCommunityCommentId("demo-comment-1")).toBe(true);
    expect(isDemoCommunityCommentId(crypto.randomUUID())).toBe(false);
  });

  it("validates uuid ids", () => {
    expect(isUuidId(crypto.randomUUID())).toBe(true);
    expect(isUuidId("not-a-uuid")).toBe(false);
  });
});

describe("community action payload schemas", () => {
  it("accepts demo and uuid post ids for reaction payloads", () => {
    expect(TogglePostReactionInputZ.safeParse({ postId: "demo-community-post-1" }).success).toBe(true);
    expect(TogglePostReactionInputZ.safeParse({ postId: crypto.randomUUID() }).success).toBe(true);
  });

  it("rejects empty ids for reaction payloads", () => {
    expect(TogglePostReactionInputZ.safeParse({ postId: " " }).success).toBe(false);
  });

  it("accepts generic ids for comment payloads", () => {
    expect(
      AddCommunityCommentInputZ.safeParse({
        postId: "demo-community-post-1",
        body: "Looks good",
      }).success,
    ).toBe(true);
    expect(
      AddCommunityCommentInputZ.safeParse({
        postId: crypto.randomUUID(),
        parentId: crypto.randomUUID(),
        body: "Reply",
      }).success,
    ).toBe(true);
  });

  it("validates comment like payload id presence", () => {
    expect(ToggleCommentLikeInputZ.safeParse({ commentId: "demo-comment-1" }).success).toBe(true);
    expect(ToggleCommentLikeInputZ.safeParse({ commentId: "" }).success).toBe(false);
  });
});
