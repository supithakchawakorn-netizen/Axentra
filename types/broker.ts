import { z } from "zod";

export const BrokerVisibilityInputZ = z.object({
  showPositions: z.boolean(),
  showBalances: z.boolean(),
  showActivity: z.boolean(),
  showBrokerName: z.boolean(),
});
export type BrokerVisibilityInput = z.infer<typeof BrokerVisibilityInputZ>;

export const RefreshBrokerInputZ = z.object({
  connectionId: z.string().uuid(),
});
export type RefreshBrokerInput = z.infer<typeof RefreshBrokerInputZ>;

export const DisconnectBrokerInputZ = z.object({
  connectionId: z.string().uuid(),
});
export type DisconnectBrokerInput = z.infer<typeof DisconnectBrokerInputZ>;
