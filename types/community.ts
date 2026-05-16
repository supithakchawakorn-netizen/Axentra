import { z } from "zod";

export const CommunityCategoryZ = z.enum([
  "discussion",
  "tutorial",
  "question",
  "announcement",
  "other",
]);
export type CommunityCategory = z.infer<typeof CommunityCategoryZ>;

export const CommunitySortZ = z.enum(["trending", "new", "top"]);
export type CommunitySort = z.infer<typeof CommunitySortZ>;

export const CommunityFeedQueryZ = z.object({
  q: z.string().trim().max(80).optional(),
  category: CommunityCategoryZ.optional(),
  sort: CommunitySortZ.default("trending"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(20).default(10),
});
export type CommunityFeedQuery = z.infer<typeof CommunityFeedQueryZ>;

const AnyCommunityIdZ = z.string().trim().min(1).max(128);
const UuidIdZ = z.string().uuid();

export function isUuidId(value: string): boolean {
  return UuidIdZ.safeParse(value).success;
}

export function isDemoCommunityPostId(value: string): boolean {
  return value.startsWith("demo-community-post-") || value.startsWith("demo-guest-post-");
}

export function isDemoCommunityCommentId(value: string): boolean {
  return value.startsWith("demo-comment-");
}

export const CreateCommunityPostInputZ = z.object({
  communityId: z.string().uuid(),
  title: z.string().trim().min(5).max(180),
  body: z.string().trim().min(10).max(40000),
  excerpt: z.string().trim().max(300).optional(),
  category: CommunityCategoryZ,
  tags: z.array(z.string().trim().min(1).max(32)).max(8).default([]),
  coverImageUrl: z.string().url().optional(),
  status: z.enum(["draft", "published"]).default("published"),
});
export type CreateCommunityPostInput = z.infer<typeof CreateCommunityPostInputZ>;

export const UpdateCommunityPostInputZ = z.object({
  postId: z.string().uuid(),
  title: z.string().trim().min(5).max(180).optional(),
  body: z.string().trim().min(10).max(40000).optional(),
  excerpt: z.string().trim().max(300).optional(),
  category: CommunityCategoryZ.optional(),
  tags: z.array(z.string().trim().min(1).max(32)).max(8).optional(),
  coverImageUrl: z.string().url().nullable().optional(),
  status: z.enum(["draft", "published"]).optional(),
});
export type UpdateCommunityPostInput = z.infer<typeof UpdateCommunityPostInputZ>;

export const TogglePostReactionInputZ = z.object({
  postId: AnyCommunityIdZ,
});
export type TogglePostReactionInput = z.infer<typeof TogglePostReactionInputZ>;

export const AddCommunityCommentInputZ = z.object({
  postId: AnyCommunityIdZ,
  body: z.string().trim().min(1).max(4000),
  parentId: AnyCommunityIdZ.optional(),
});
export type AddCommunityCommentInput = z.infer<typeof AddCommunityCommentInputZ>;

export const ToggleCommentLikeInputZ = z.object({
  commentId: AnyCommunityIdZ,
});
export type ToggleCommentLikeInput = z.infer<typeof ToggleCommentLikeInputZ>;

export const ModeratePostInputZ = z.object({
  postId: z.string().uuid(),
  action: z.enum(["pin", "unpin", "announce", "unannounce", "delete"]),
});
export type ModeratePostInput = z.infer<typeof ModeratePostInputZ>;

export const ReportContentInputZ = z
  .object({
    postId: AnyCommunityIdZ.optional(),
    commentId: AnyCommunityIdZ.optional(),
    reason: z.string().trim().min(3).max(300),
  })
  .refine((v) => Boolean(v.postId || v.commentId), {
    message: "Either postId or commentId is required.",
  });
export type ReportContentInput = z.infer<typeof ReportContentInputZ>;
