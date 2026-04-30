import { z } from "zod";

const HANDLE_RE = /^[a-z0-9_]{3,32}$/;

export const HandleZ = z
  .string()
  .trim()
  .toLowerCase()
  .regex(HANDLE_RE, "Handle must be 3-32 chars, lowercase letters, digits, or underscores.");

export const UpdateProfileInputZ = z.object({
  handle: HandleZ,
  displayName: z.string().trim().min(1).max(64),
  bio: z.string().trim().max(500).default(""),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});
export type UpdateProfileInput = z.infer<typeof UpdateProfileInputZ>;
