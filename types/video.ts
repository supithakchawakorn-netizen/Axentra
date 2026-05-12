import { z } from "zod";

export const VideoVisibilityZ = z.enum(["public", "unlisted"]);
export type VideoVisibility = z.infer<typeof VideoVisibilityZ>;

export const VideoStatusZ = z.enum(["pending", "processing", "ready", "errored"]);
export type VideoStatus = z.infer<typeof VideoStatusZ>;

export const TickerIdsZ = z
  .array(z.string().uuid())
  .max(8, "Up to 8 tickers per video.")
  .default([]);

export const CreateUploadInputZ = z.object({
  title: z.string().trim().min(1, "Title is required").max(140),
  description: z.string().trim().max(2000).default(""),
  visibility: VideoVisibilityZ.default("public"),
  tickerIds: TickerIdsZ,
});
export type CreateUploadInput = z.infer<typeof CreateUploadInputZ>;

export const EditVideoInputZ = z.object({
  videoId: z.string().uuid(),
  title: z.string().trim().min(1).max(140).optional(),
  description: z.string().trim().max(2000).optional(),
  visibility: VideoVisibilityZ.optional(),
  tickerIds: TickerIdsZ.optional(),
}).refine(
  (value) =>
    value.title !== undefined ||
    value.description !== undefined ||
    value.visibility !== undefined ||
    value.tickerIds !== undefined,
  { message: "At least one field must be updated." },
);
export type EditVideoInput = z.infer<typeof EditVideoInputZ>;

export const SetVisibilityInputZ = z.object({
  videoId: z.string().uuid(),
  visibility: VideoVisibilityZ,
});
export type SetVisibilityInput = z.infer<typeof SetVisibilityInputZ>;

export const DeleteVideoInputZ = z.object({
  videoId: z.string().uuid(),
});
export type DeleteVideoInput = z.infer<typeof DeleteVideoInputZ>;
