import { createHmac, timingSafeEqual } from "node:crypto";

export function signHmacSha256Hex(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifyHmacSha256Hex(params: {
  payload: string;
  secret: string | undefined;
  signature: string | null;
}): boolean {
  const { payload, secret, signature } = params;
  if (!secret || !signature) return false;

  const expected = signHmacSha256Hex(payload, secret);
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== providedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, providedBuffer);
}
