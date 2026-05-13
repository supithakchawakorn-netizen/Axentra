import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@/lib/supabase/server";
import { communityDemoPostingEnabled, supabaseConfigured } from "@/lib/env";
import type { CommunityCategory, CommunitySort } from "@/types/community";

export interface CommunityFeedPost {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  category: CommunityCategory;
  tags: string[];
  cover_image_url: string | null;
  created_at: string;
  upvote_count: number;
  comment_count: number;
  save_count: number;
  status: string;
  author: {
    id: string;
    handle: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  community: {
    id: string;
    name: string;
    slug: string;
  } | null;
  viewer: {
    upvoted: boolean;
    saved: boolean;
    canModerate: boolean;
  };
}

export interface CommunityCommentNode {
  id: string;
  post_id: string;
  parent_id: string | null;
  body: string;
  created_at: string;
  like_count: number;
  reply_count: number;
  author: {
    id: string;
    handle: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  viewer: {
    liked: boolean;
  };
  replies: CommunityCommentNode[];
}

const DEMO_POSTS: CommunityFeedPost[] = [
  {
    id: "demo-community-post-1",
    title: "How I structure a 20-minute market recap so people actually finish it",
    excerpt:
      "A practical outline for opening hook, section pacing, and recap prompts that increased completion and discussion quality in our community.",
    body: JSON.stringify({
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "I used to publish dense recaps that people skimmed. This structure improved retention and comments." }] },
        { type: "bulletList", content: [
          { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "2-minute context opener: what changed and why it matters" }] }] },
          { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "3 focused sections with one decision each" }] }] },
          { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "1-minute summary + discussion prompt at the end" }] }] }
        ]},
      ],
    }),
    category: "tutorial",
    tags: ["creator-flow", "storytelling", "retention"],
    cover_image_url:
      "https://images.unsplash.com/photo-1559526324-593bc073d938?q=80&w=1600&auto=format&fit=crop",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    upvote_count: 132,
    comment_count: 18,
    save_count: 44,
    status: "published",
    author: {
      id: "demo-author-1",
      handle: "marketmentor",
      display_name: "Market Mentor",
      avatar_url:
        "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=200&auto=format&fit=crop",
    },
    community: { id: "demo-community-1", name: "Creator Lab", slug: "creator-lab" },
    viewer: { upvoted: true, saved: false, canModerate: true },
  },
  {
    id: "demo-community-post-2",
    title: "Question: should we split live sessions into strategy and Q&A tracks?",
    excerpt:
      "Trying to reduce drop-off in long sessions. Would separate tracks improve focus or fragment the discussion too much?",
    body: JSON.stringify({
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "Our 90-minute sessions get strong starts but weaker second-half retention." }] },
        { type: "paragraph", content: [{ type: "text", text: "Would love concrete formats from communities that solved this." }] },
      ],
    }),
    category: "question",
    tags: ["live-ux", "community", "discussion"],
    cover_image_url: null,
    created_at: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    upvote_count: 57,
    comment_count: 29,
    save_count: 16,
    status: "published",
    author: {
      id: "demo-author-2",
      handle: "flowbuilder",
      display_name: "Flow Builder",
      avatar_url:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
    },
    community: { id: "demo-community-2", name: "Live Practitioners", slug: "live-practitioners" },
    viewer: { upvoted: false, saved: true, canModerate: false },
  },
  {
    id: "demo-community-post-3",
    title: "Announcement: weekly office hours and open feedback thread",
    excerpt:
      "Starting this Friday: office hours for creator workflows, upload issues, analytics interpretation, and post quality feedback.",
    body: JSON.stringify({
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "We'll host weekly office hours and keep one pinned thread for onboarding questions." }] },
      ],
    }),
    category: "announcement",
    tags: ["announcement", "office-hours"],
    cover_image_url:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1600&auto=format&fit=crop",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    upvote_count: 88,
    comment_count: 11,
    save_count: 23,
    status: "published",
    author: {
      id: "demo-author-3",
      handle: "communityops",
      display_name: "Community Ops",
      avatar_url:
        "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=200&auto=format&fit=crop",
    },
    community: { id: "demo-community-1", name: "Creator Lab", slug: "creator-lab" },
    viewer: { upvoted: false, saved: false, canModerate: true },
  },
];

const DEMO_COMMENTS: Record<string, CommunityCommentNode[]> = {
  "demo-community-post-1": [
    {
      id: "demo-comment-1",
      post_id: "demo-community-post-1",
      parent_id: null,
      body: "This format is excellent. We copied the 2-minute opener and saw higher retention immediately.",
      created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      like_count: 14,
      reply_count: 1,
      author: {
        id: "demo-member-1",
        handle: "northstar",
        display_name: "North Star",
        avatar_url: null,
      },
      viewer: { liked: true },
      replies: [
        {
          id: "demo-comment-1-reply-1",
          post_id: "demo-community-post-1",
          parent_id: "demo-comment-1",
          body: "Same here. The decision framing made it easier for people to comment.",
          created_at: new Date(Date.now() - 70 * 60 * 1000).toISOString(),
          like_count: 4,
          reply_count: 0,
          author: {
            id: "demo-member-2",
            handle: "alphajournal",
            display_name: "Alpha Journal",
            avatar_url: null,
          },
          viewer: { liked: false },
          replies: [],
        },
      ],
    },
    {
      id: "demo-comment-2",
      post_id: "demo-community-post-1",
      parent_id: null,
      body: "Could you share a sample script for the opener?",
      created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      like_count: 6,
      reply_count: 0,
      author: {
        id: "demo-member-3",
        handle: "minutebrief",
        display_name: "Minute Brief",
        avatar_url: null,
      },
      viewer: { liked: false },
      replies: [],
    },
  ],
};

interface DemoGuestPostInput {
  communityId: string;
  title: string;
  body: string;
  excerpt: string;
  category: CommunityCategory;
  tags: string[];
  coverImageUrl: string | null;
}

const DEMO_GUEST_POST_PREFIX = "demo-guest-post-";
const DEMO_GUEST_POSTS_FILE = path.join(
  process.cwd(),
  ".tmp",
  "community-demo-posts.json",
);

function isDemoGuestPostId(postId: string): boolean {
  return postId.startsWith(DEMO_GUEST_POST_PREFIX);
}

function getDemoCommunityMeta(communityId: string) {
  if (communityId === "demo-community-2") {
    return { id: "demo-community-2", name: "Live Practitioners", slug: "live-practitioners" };
  }
  return { id: "demo-community-1", name: "Creator Lab", slug: "creator-lab" };
}

async function readDemoGuestPosts(): Promise<CommunityFeedPost[]> {
  try {
    const raw = await readFile(DEMO_GUEST_POSTS_FILE, "utf8");
    const parsed = JSON.parse(raw) as CommunityFeedPost[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeDemoGuestPosts(posts: CommunityFeedPost[]) {
  await mkdir(path.dirname(DEMO_GUEST_POSTS_FILE), { recursive: true });
  await writeFile(DEMO_GUEST_POSTS_FILE, JSON.stringify(posts), "utf8");
}

export async function addDemoGuestCommunityPost(input: DemoGuestPostInput): Promise<{ postId: string }> {
  const id = `${DEMO_GUEST_POST_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const post: CommunityFeedPost = {
    id,
    title: input.title,
    excerpt: input.excerpt,
    body: input.body,
    category: input.category,
    tags: input.tags,
    cover_image_url: input.coverImageUrl,
    created_at: new Date().toISOString(),
    upvote_count: 0,
    comment_count: 0,
    save_count: 0,
    status: "published",
    author: {
      id: "demo-guest-author",
      handle: "guest",
      display_name: "Guest (Demo)",
      avatar_url: null,
    },
    community: getDemoCommunityMeta(input.communityId),
    viewer: {
      upvoted: false,
      saved: false,
      canModerate: true,
    },
  };
  const store = await readDemoGuestPosts();
  store.unshift(post);
  if (store.length > 60) store.length = 60;
  await writeDemoGuestPosts(store);
  return { postId: id };
}

async function demoFeed(params: {
  q?: string;
  category?: CommunityCategory;
  sort: CommunitySort;
  page: number;
  pageSize: number;
}): Promise<{ posts: CommunityFeedPost[]; hasMore: boolean }> {
  const guestPosts = communityDemoPostingEnabled() ? await readDemoGuestPosts() : [];
  let rows = [...guestPosts, ...DEMO_POSTS];
  if (params.category) rows = rows.filter((row) => row.category === params.category);
  if (params.q) {
    const q = params.q.toLowerCase();
    rows = rows.filter((row) =>
      [row.title, row.excerpt, row.author?.display_name ?? "", row.author?.handle ?? "", row.tags.join(" ")].join(" ").toLowerCase().includes(q),
    );
  }
  if (params.sort === "top") {
    rows.sort((a, b) => b.upvote_count - a.upvote_count);
  } else if (params.sort === "new") {
    rows.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  } else {
    rows.sort((a, b) => b.upvote_count + b.comment_count - (a.upvote_count + a.comment_count));
  }

  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize;
  const slice = rows.slice(from, to + 1);
  return { posts: slice.slice(0, params.pageSize), hasMore: slice.length > params.pageSize };
}

function normalizeSearchQuery(value: string): string {
  return value.replace(/[,%]/g, " ").replace(/\s+/g, " ").trim();
}

export async function listCommunityFeed(params: {
  q?: string;
  category?: CommunityCategory;
  sort: CommunitySort;
  page: number;
  pageSize: number;
}): Promise<{ posts: CommunityFeedPost[]; hasMore: boolean }> {
  if (!supabaseConfigured()) return demoFeed(params);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("community_posts")
    .select(
      "id,title,excerpt,body,category,tags,cover_image_url,created_at,upvote_count,comment_count,save_count,status,author:profiles!community_posts_author_id_fkey(id,handle,display_name,avatar_url),community:communities!community_posts_community_id_fkey(id,name,slug)",
    )
    .eq("status", "published");

  if (params.category) {
    query = query.eq("category", params.category);
  }
  if (params.q) {
    const normalizedQ = normalizeSearchQuery(params.q);
    if (normalizedQ.length > 0) {
      query = query.or(
        `title.ilike.%${normalizedQ}%,excerpt.ilike.%${normalizedQ}%,body.ilike.%${normalizedQ}%`,
      );
    }
  }

  if (params.sort === "top") {
    query = query.order("upvote_count", { ascending: false }).order("created_at", { ascending: false });
  } else if (params.sort === "new") {
    query = query.order("created_at", { ascending: false });
  } else {
    query = query
      .order("is_pinned", { ascending: false })
      .order("upvote_count", { ascending: false })
      .order("comment_count", { ascending: false })
      .order("created_at", { ascending: false });
  }

  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize;
  const { data, error } = await query.range(from, to);
  if (error) {
    console.error("[listCommunityFeed]", error.message);
    return { posts: [], hasMore: false };
  }

  const rows = (data ?? []) as unknown as Array<{
    id: string;
    title: string;
    excerpt: string;
    body: string;
    category: CommunityCategory;
    tags: string[];
    cover_image_url: string | null;
    created_at: string;
    upvote_count: number;
    comment_count: number;
    save_count: number;
    status: string;
    author: CommunityFeedPost["author"];
    community: CommunityFeedPost["community"];
  }>;

  const ids = rows.map((row) => row.id);
  let upvoted = new Set<string>();
  let saved = new Set<string>();
  let canModerate = new Set<string>();

  if (user && ids.length > 0) {
    const [{ data: votes }, { data: saves }, { data: memberships }] = await Promise.all([
      supabase.from("community_post_votes").select("post_id").eq("user_id", user.id).in("post_id", ids),
      supabase.from("community_post_saves").select("post_id").eq("user_id", user.id).in("post_id", ids),
      supabase
        .from("community_memberships")
        .select("community_id, role")
        .eq("user_id", user.id)
        .in("community_id", rows.map((row) => row.community?.id).filter(Boolean) as string[]),
    ]);
    upvoted = new Set((votes ?? []).map((row) => row.post_id as string));
    saved = new Set((saves ?? []).map((row) => row.post_id as string));
    const rolesByCommunity = new Map<string, string>(
      (memberships ?? []).map((row) => [row.community_id as string, row.role as string]),
    );
    for (const row of rows) {
      if (!row.community?.id) continue;
      const role = rolesByCommunity.get(row.community.id);
      if (role === "owner" || role === "moderator") {
        canModerate.add(row.id);
      }
    }
  }

  let posts = rows.slice(0, params.pageSize).map((row) => ({
      ...row,
      viewer: {
        upvoted: upvoted.has(row.id),
        saved: saved.has(row.id),
        canModerate: canModerate.has(row.id),
      },
    }));
  let hasMore = rows.length > params.pageSize;
  if (communityDemoPostingEnabled() && params.page === 1) {
    const q = params.q?.toLowerCase().trim();
    const allDemoGuestPosts = await readDemoGuestPosts();
    const demoGuestPosts = allDemoGuestPosts.filter((post) => {
      if (params.category && post.category !== params.category) return false;
      if (!q) return true;
      const haystack = [post.title, post.excerpt, post.body, post.tags.join(" ")]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
    if (demoGuestPosts.length > 0) {
      hasMore = demoGuestPosts.length + rows.length > params.pageSize;
      posts = [...demoGuestPosts, ...posts].slice(0, params.pageSize);
    }
  }
  return { posts, hasMore };
}

export async function getCommunityPostDetail(postId: string): Promise<CommunityFeedPost | null> {
  if (communityDemoPostingEnabled() && isDemoGuestPostId(postId)) {
    const guestPosts = await readDemoGuestPosts();
    return guestPosts.find((post) => post.id === postId) ?? null;
  }
  if (!supabaseConfigured()) return DEMO_POSTS.find((post) => post.id === postId) ?? null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("community_posts")
    .select(
      "id,title,excerpt,body,category,tags,cover_image_url,created_at,upvote_count,comment_count,save_count,status,author_id,author:profiles!community_posts_author_id_fkey(id,handle,display_name,avatar_url),community:communities!community_posts_community_id_fkey(id,name,slug)",
    )
    .eq("id", postId)
    .eq("status", "published")
    .maybeSingle();
  if (error || !data) {
    if (error) console.error("[getCommunityPostDetail]", error.message);
    return null;
  }
  const row = data as unknown as CommunityFeedPost & { author_id: string };

  let upvoted = false;
  let saved = false;
  let canModerate = false;
  if (user) {
    const [{ data: voteRow }, { data: saveRow }, { data: membership }] = await Promise.all([
      supabase
        .from("community_post_votes")
        .select("post_id")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("community_post_saves")
        .select("post_id")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .maybeSingle(),
      row.community?.id
        ? supabase
            .from("community_memberships")
            .select("role")
            .eq("community_id", row.community.id)
            .eq("user_id", user.id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);
    upvoted = Boolean(voteRow);
    saved = Boolean(saveRow);
    canModerate = row.author_id === user.id || membership?.role === "owner" || membership?.role === "moderator";
  }

  return {
    ...row,
    viewer: { upvoted, saved, canModerate },
  };
}

export async function listCommunityComments(params: {
  postId: string;
  page: number;
  pageSize: number;
}): Promise<{ comments: CommunityCommentNode[]; hasMore: boolean }> {
  if (communityDemoPostingEnabled() && isDemoGuestPostId(params.postId)) {
    return { comments: [], hasMore: false };
  }
  if (!supabaseConfigured()) {
    const comments = DEMO_COMMENTS[params.postId] ?? [];
    return { comments, hasMore: false };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize;
  const { data, error } = await supabase
    .from("community_comments")
    .select(
      "id,post_id,parent_id,body,created_at,like_count,reply_count,author:profiles!community_comments_author_id_fkey(id,handle,display_name,avatar_url)",
    )
    .eq("post_id", params.postId)
    .is("parent_id", null)
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) {
    console.error("[listCommunityComments]", error.message);
    return { comments: [], hasMore: false };
  }
  const topRows = (data ?? []) as unknown as Omit<CommunityCommentNode, "viewer" | "replies">[];

  const topIds = topRows.map((row) => row.id);
  const { data: replies } = topIds.length
    ? await supabase
        .from("community_comments")
        .select(
          "id,post_id,parent_id,body,created_at,like_count,reply_count,author:profiles!community_comments_author_id_fkey(id,handle,display_name,avatar_url)",
        )
        .in("parent_id", topIds)
        .order("created_at", { ascending: true })
    : { data: [] as unknown[] };

  const likeTargets = [...topIds, ...((replies ?? []) as Array<{ id: string }>).map((r) => r.id)];
  const likedSet = new Set<string>();
  if (user && likeTargets.length > 0) {
    const { data: likes } = await supabase
      .from("community_comment_likes")
      .select("comment_id")
      .eq("user_id", user.id)
      .in("comment_id", likeTargets);
    for (const like of likes ?? []) likedSet.add(like.comment_id as string);
  }

  const repliesByParent = new Map<string, CommunityCommentNode[]>();
  for (const row of (replies ?? []) as unknown as Omit<CommunityCommentNode, "viewer" | "replies">[]) {
    const arr = repliesByParent.get(row.parent_id ?? "") ?? [];
    arr.push({
      ...row,
      viewer: { liked: likedSet.has(row.id) },
      replies: [],
    });
    if (row.parent_id) repliesByParent.set(row.parent_id, arr);
  }

  const comments = topRows.slice(0, params.pageSize).map((row) => ({
      ...row,
      viewer: { liked: likedSet.has(row.id) },
      replies: repliesByParent.get(row.id) ?? [],
    }));
  return {
    comments,
    hasMore: topRows.length > params.pageSize,
  };
}

export async function listSavedCommunityPosts(params: {
  page: number;
  pageSize: number;
}): Promise<{ posts: CommunityFeedPost[]; hasMore: boolean }> {
  if (!supabaseConfigured()) return { posts: DEMO_POSTS.slice(0, 2).map((post) => ({ ...post, viewer: { ...post.viewer, saved: true } })), hasMore: false };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { posts: DEMO_POSTS.slice(0, 2).map((post) => ({ ...post, viewer: { ...post.viewer, saved: true } })), hasMore: false };
  }

  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize;
  const { data, error } = await supabase
    .from("community_post_saves")
    .select(
      "post_id, post:community_posts!community_post_saves_post_id_fkey(id,title,excerpt,body,category,tags,cover_image_url,created_at,upvote_count,comment_count,save_count,status,author:profiles!community_posts_author_id_fkey(id,handle,display_name,avatar_url),community:communities!community_posts_community_id_fkey(id,name,slug))",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) {
    console.error("[listSavedCommunityPosts]", error.message);
    return { posts: DEMO_POSTS.slice(0, 2).map((post) => ({ ...post, viewer: { ...post.viewer, saved: true } })), hasMore: false };
  }

  const rows = (data ?? []) as unknown as Array<{ post: Omit<CommunityFeedPost, "viewer"> | null }>;
  const posts = rows
      .slice(0, params.pageSize)
      .map((row) => row.post)
      .filter((post): post is Omit<CommunityFeedPost, "viewer"> => Boolean(post))
      .map((post) => ({
        ...post,
        viewer: { upvoted: false, saved: true, canModerate: false },
      }));
  if (posts.length === 0) {
    return { posts: DEMO_POSTS.slice(0, 2).map((post) => ({ ...post, viewer: { ...post.viewer, saved: true } })), hasMore: false };
  }
  return { posts, hasMore: rows.length > params.pageSize };
}

export async function getCommunityStats(): Promise<{ members: number; postsThisWeek: number }> {
  if (!supabaseConfigured()) return { members: 1240, postsThisWeek: 37 };
  const supabase = await createClient();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const [{ count: memberCount }, { count: postCount }] = await Promise.all([
    supabase.from("community_memberships").select("community_id", { count: "exact", head: true }),
    supabase
      .from("community_posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .gte("created_at", weekAgo),
  ]);
  const stats = {
    members: memberCount ?? 0,
    postsThisWeek: postCount ?? 0,
  };
  if (stats.members === 0 && stats.postsThisWeek === 0) {
    return { members: 1240, postsThisWeek: 37 };
  }
  return stats;
}

export async function listCommunitiesForPicker(): Promise<Array<{ id: string; name: string; slug: string }>> {
  if (!supabaseConfigured()) {
    return [
      { id: "demo-community-1", name: "Creator Lab", slug: "creator-lab" },
      { id: "demo-community-2", name: "Live Practitioners", slug: "live-practitioners" },
    ];
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("communities")
    .select("id,name,slug")
    .order("name", { ascending: true })
    .limit(30);
  if (error) {
    console.error("[listCommunitiesForPicker]", error.message);
    return [];
  }
  const rows = (data ?? []) as Array<{ id: string; name: string; slug: string }>;
  return rows;
}

export async function getCommunityPostForEdit(postId: string): Promise<{
  id: string;
  community_id: string;
  title: string;
  body: string;
  category: CommunityCategory;
  tags: string[];
  cover_image_url: string | null;
  status: "draft" | "published";
} | null> {
  if (!supabaseConfigured()) {
    const demoPost =
      DEMO_POSTS.find((post) => post.id === postId) ??
      (communityDemoPostingEnabled()
        ? (await readDemoGuestPosts()).find((post) => post.id === postId)
        : null);
    if (!demoPost) return null;
    return {
      id: demoPost.id,
      community_id: demoPost.community?.id ?? "demo-community-1",
      title: demoPost.title,
      body: demoPost.body,
      category: demoPost.category,
      tags: demoPost.tags,
      cover_image_url: demoPost.cover_image_url,
      status: "published",
    };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("community_posts")
    .select("id,community_id,title,body,category,tags,cover_image_url,status,author_id")
    .eq("id", postId)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as {
    id: string;
    community_id: string;
    title: string;
    body: string;
    category: CommunityCategory;
    tags: string[];
    cover_image_url: string | null;
    status: "draft" | "published";
    author_id: string;
  };
  if (row.author_id !== user.id) return null;
  return {
    id: row.id,
    community_id: row.community_id,
    title: row.title,
    body: row.body,
    category: row.category,
    tags: row.tags ?? [],
    cover_image_url: row.cover_image_url,
    status: row.status,
  };
}
