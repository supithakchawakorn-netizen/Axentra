import "server-only";
import {
  AccessToken,
  EgressClient,
  EncodedFileOutput,
  RoomServiceClient,
  S3Upload,
  WebhookReceiver,
} from "livekit-server-sdk";

/**
 * Typed LiveKit server wrapper.
 *
 * AGENTS.md §3: LiveKit is a server-only integration. The wrapper exposes
 * only:
 *   - viewer subscribe-only token
 *   - publisher token (creator + invited co-host)
 *   - egress start (room recording)
 *   - room delete
 *   - webhook signature verification
 */

function readEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}.`);
  return v;
}

function apiKey(): string {
  return readEnv("LIVEKIT_API_KEY");
}
function apiSecret(): string {
  return readEnv("LIVEKIT_API_SECRET");
}
function livekitUrl(): string {
  return readEnv("LIVEKIT_URL");
}

function roomService(): RoomServiceClient {
  return new RoomServiceClient(livekitUrl(), apiKey(), apiSecret());
}

function egress(): EgressClient {
  return new EgressClient(livekitUrl(), apiKey(), apiSecret());
}

export interface MintedToken {
  token: string;
  url: string;
}

/**
 * Create an anonymous, subscribe-only token. Cannot publish, cannot send
 * data messages, cannot send chat. The viewer's identity is a random string.
 */
export async function mintViewerToken(params: {
  roomName: string;
}): Promise<MintedToken> {
  const at = new AccessToken(apiKey(), apiSecret(), {
    // Anonymous viewers; non-meaningful identity.
    identity: `viewer-${crypto.randomUUID()}`,
    ttl: 60 * 60, // 1h
  });
  at.addGrant({
    roomJoin: true,
    room: params.roomName,
    canSubscribe: true,
    canPublish: false,
    canPublishData: false,
  });
  return {
    token: await at.toJwt(),
    url: livekitUrl(),
  };
}

/**
 * Create a publisher token for a creator (canPublish + canPublishData).
 * Identity is the creator's user id so chat messages can be attributed.
 */
export async function mintCreatorToken(params: {
  roomName: string;
  userId: string;
  displayName: string;
}): Promise<MintedToken> {
  const at = new AccessToken(apiKey(), apiSecret(), {
    identity: params.userId,
    name: params.displayName,
    ttl: 60 * 60 * 4, // 4h
  });
  at.addGrant({
    roomJoin: true,
    room: params.roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    roomAdmin: true,
  });
  return {
    token: await at.toJwt(),
    url: livekitUrl(),
  };
}

/**
 * Co-host publisher token. Created server-side from a one-time invite link.
 * Distinct identity (not the user's id since co-hosts may not have a Varg Packs
 * account in V1).
 */
export async function mintCoHostToken(params: {
  roomName: string;
  inviteId: string;
  displayName: string;
}): Promise<MintedToken> {
  const at = new AccessToken(apiKey(), apiSecret(), {
    identity: `cohost-${params.inviteId}`,
    name: params.displayName,
    ttl: 60 * 60 * 4,
  });
  at.addGrant({
    roomJoin: true,
    room: params.roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });
  return {
    token: await at.toJwt(),
    url: livekitUrl(),
  };
}

/**
 * Start a room composite egress to the configured S3-compatible bucket.
 * The webhook handler picks up `egress_ended` and hands the recording to Mux.
 */
export async function startRoomEgress(params: {
  roomName: string;
}): Promise<{ egressId: string }> {
  const bucket = readEnv("LIVEKIT_EGRESS_BUCKET");
  const region = process.env.LIVEKIT_EGRESS_REGION ?? "";
  const accessKey = readEnv("LIVEKIT_EGRESS_ACCESS_KEY");
  const secretKey = readEnv("LIVEKIT_EGRESS_SECRET_KEY");
  const endpoint = process.env.LIVEKIT_EGRESS_ENDPOINT ?? "";

  const filepath = `${params.roomName}/${Date.now()}.mp4`;

  const fileOutput = new EncodedFileOutput({
    filepath,
    output: {
      case: "s3",
      value: new S3Upload({
        accessKey,
        secret: secretKey,
        bucket,
        region,
        endpoint,
      }),
    },
  });

  const info = await egress().startRoomCompositeEgress(
    params.roomName,
    { file: fileOutput },
    { layout: "speaker" },
  );
  return { egressId: info.egressId };
}

export async function deleteRoom(roomName: string): Promise<void> {
  await roomService().deleteRoom(roomName);
}

let _webhookReceiver: WebhookReceiver | null = null;

function webhookReceiver(): WebhookReceiver {
  if (_webhookReceiver) return _webhookReceiver;
  _webhookReceiver = new WebhookReceiver(apiKey(), apiSecret());
  return _webhookReceiver;
}

/**
 * Verify a LiveKit webhook signature against the raw request body.
 * Returns the parsed event (after signature check) or null on failure.
 */
export async function receiveWebhook(
  rawBody: string,
  authHeader: string | null,
): Promise<{ event: string; room?: { name?: string; sid?: string }; egressInfo?: unknown } | null> {
  if (!authHeader) return null;
  try {
    const event = await webhookReceiver().receive(rawBody, authHeader);
    return event as unknown as {
      event: string;
      room?: { name?: string; sid?: string };
      egressInfo?: unknown;
    };
  } catch {
    return null;
  }
}
