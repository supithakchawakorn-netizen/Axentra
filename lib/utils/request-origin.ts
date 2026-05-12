import { siteUrl } from "@/lib/utils/site";

function isPrivateOrLocalHost(hostname: string): boolean {
  return (
    hostname === "0.0.0.0" ||
    hostname === "::" ||
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  );
}

function normalizeHost(host: string): string {
  const trimmed = host.trim();
  if (trimmed.startsWith("0.0.0.0:")) {
    return `localhost:${trimmed.split(":")[1]}`;
  }
  if (trimmed === "0.0.0.0") {
    return "localhost";
  }
  if (trimmed === "[::]" || trimmed === "::") {
    return "localhost";
  }
  return trimmed;
}

export function inferProtoFromHost(host: string): "http" | "https" {
  const hostname = host.split(":")[0]?.toLowerCase() ?? host.toLowerCase();
  if (isPrivateOrLocalHost(hostname)) {
    return "http";
  }
  return "https";
}

export function deriveRequestOrigin(params: {
  originHeader: string | null;
  forwardedProtoHeader: string | null;
  forwardedHostHeader: string | null;
  hostHeader: string | null;
}): string {
  const { originHeader, forwardedProtoHeader, forwardedHostHeader, hostHeader } = params;
  if (originHeader) {
    try {
      return new URL(originHeader).origin;
    } catch {
      // Ignore malformed origin and continue with header-based inference.
    }
  }

  const host = forwardedHostHeader ?? hostHeader;
  if (host) {
    const normalizedHost = normalizeHost(host);
    const proto = forwardedProtoHeader ?? inferProtoFromHost(normalizedHost);
    return `${proto}://${normalizedHost}`;
  }

  return siteUrl();
}

