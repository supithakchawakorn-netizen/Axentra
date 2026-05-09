import * as Sentry from "@sentry/nextjs";

function isSensitivePath(url: string | undefined): boolean {
  if (!url) return false;
  return (
    url.includes("/api/webhooks/") ||
    url.includes("/studio/broker") ||
    url.includes("/api/snaptrade/")
  );
}

function scrubSensitiveRequest(event: Sentry.ErrorEvent): Sentry.ErrorEvent {
  const request = event.request;
  if (!request || !isSensitivePath(request.url)) {
    return event;
  }

  event.request = {
    ...request,
    data: "[REDACTED]",
    headers: {
      ...request.headers,
      authorization: "[REDACTED]",
      cookie: "[REDACTED]",
    },
    cookies: undefined,
    query_string: "[REDACTED]",
  };

  return event;
}

function sentryBaseConfig(dsn: string): Sentry.NodeOptions {
  return {
    dsn,
    tracesSampleRate: 0.1,
    enabled: process.env.NODE_ENV === "production",
    beforeSend(event) {
      return scrubSensitiveRequest(event);
    },
  };
}

export async function register() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init(sentryBaseConfig(dsn));
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    Sentry.init(sentryBaseConfig(dsn));
  }
}

export const onRequestError = Sentry.captureRequestError;
