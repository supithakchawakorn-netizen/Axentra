import { z } from "zod";

export const SnapTradeWebhookEventZ = z.object({
  type: z.string().min(1),
  userId: z.string().optional(),
  connectionId: z.string().optional(),
  status: z.string().optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export type SnapTradeWebhookEvent = z.infer<typeof SnapTradeWebhookEventZ>;
