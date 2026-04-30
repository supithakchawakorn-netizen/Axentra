import { z } from "zod";

export const RoomStatusZ = z.enum(["scheduled", "live", "ended"]);
export type RoomStatus = z.infer<typeof RoomStatusZ>;

export const RoomTickerIdsZ = z
  .array(z.string().uuid())
  .max(8, "Up to 8 tickers per room.")
  .default([]);

export const CreateLiveRoomInputZ = z.object({
  title: z.string().trim().min(1).max(140),
  description: z.string().trim().max(2000).default(""),
  scheduledAt: z.string().datetime().optional(),
  tickerIds: RoomTickerIdsZ,
});
export type CreateLiveRoomInput = z.infer<typeof CreateLiveRoomInputZ>;

export const EndLiveRoomInputZ = z.object({
  roomId: z.string().uuid(),
});
export type EndLiveRoomInput = z.infer<typeof EndLiveRoomInputZ>;

export const InviteCoHostInputZ = z.object({
  roomId: z.string().uuid(),
  displayName: z.string().trim().min(1).max(64),
});
export type InviteCoHostInput = z.infer<typeof InviteCoHostInputZ>;

export const ViewerTokenRequestZ = z.object({
  roomId: z.string().uuid(),
});
export type ViewerTokenRequest = z.infer<typeof ViewerTokenRequestZ>;
