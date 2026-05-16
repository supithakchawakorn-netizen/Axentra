import "server-only";
import Mux from "@mux/mux-node";

/**
 * Typed Mux server wrapper.
 *
 * AGENTS.md §3: Mux is a server-only integration. Never import from a client
 * component. The wrapper exposes only:
 *   - direct upload creation
 *   - asset read
 *   - webhook signature verification
 *
 * No order-endpoint analogue exists for Mux, but the surface is intentionally
 * minimal so future imports can be reviewed in PR.
 */

let _client: Mux | null = null;

function client(): Mux {
  if (_client) return _client;
  const tokenId = process.env.MUX_TOKEN_ID;
  const tokenSecret = process.env.MUX_TOKEN_SECRET;
  if (!tokenId || !tokenSecret) {
    throw new Error(
      "Mux is not configured. Set MUX_TOKEN_ID and MUX_TOKEN_SECRET in .env.local.",
    );
  }
  _client = new Mux({ tokenId, tokenSecret });
  return _client;
}

export interface CreatedDirectUpload {
  uploadId: string;
  uploadUrl: string;
}

/**
 * Create a Mux Direct Upload. The browser PUTs the video file to `uploadUrl`;
 * Mux fires a webhook when the asset is ready.
 */
export async function createDirectUpload(params: {
  corsOrigin: string;
  visibility: "public" | "unlisted";
}): Promise<CreatedDirectUpload> {
  const upload = await client().video.uploads.create({
    cors_origin: params.corsOrigin,
    new_asset_settings: {
      // Test-launch default: keep playback public for both public and unlisted
      // rows so watch-page playback works without implementing signed URL flow.
      playback_policies: ["public"],
      max_resolution_tier: "1080p",
      video_quality: "basic",
    },
  });
  if (!upload.url) {
    throw new Error("Mux returned an upload without a URL.");
  }
  return {
    uploadId: upload.id,
    uploadUrl: upload.url,
  };
}

/** Read a Mux asset by ID. */
export async function getAsset(assetId: string) {
  return client().video.assets.retrieve(assetId);
}

/** Read an upload by ID (used to resolve `asset_id` after browser PUT). */
export async function getUpload(uploadId: string) {
  return client().video.uploads.retrieve(uploadId);
}

/**
 * Create a Mux asset from a remote URL. Used by the LiveKit Egress handover
 * (M2): when a recording finishes, LiveKit places the file in S3 and fires
 * `egress_ended`; we ingest the resulting URL here.
 */
export async function createAssetFromUrl(params: {
  url: string;
  visibility: "public" | "unlisted";
}) {
  return client().video.assets.create({
    inputs: [{ url: params.url }],
    playback_policies: params.visibility === "public" ? ["public"] : ["signed"],
  });
}

/**
 * Verify a Mux webhook signature against the raw request body.
 *
 * AGENTS.md §10: signature verify BEFORE parsing the body.
 *
 * Returns true on valid signature. Throws when the secret is missing.
 */
export async function verifyWebhook(
  rawBody: string,
  signatureHeader: string | null,
): Promise<boolean> {
  const secret = process.env.MUX_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("Missing MUX_WEBHOOK_SECRET.");
  }
  if (!signatureHeader) return false;
  try {
    await client().webhooks.verifySignature(
      rawBody,
      { "mux-signature": signatureHeader },
      secret,
    );
    return true;
  } catch {
    return false;
  }
}
