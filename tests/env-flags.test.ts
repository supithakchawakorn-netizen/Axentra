import { afterEach, describe, expect, it, vi } from "vitest";

async function loadEnvModule() {
  vi.resetModules();
  return import("@/lib/env");
}

afterEach(() => {
  const env = process.env as Record<string, string | undefined>;
  env.STUDIO_GUEST_MODE = undefined;
  env.LIVE_BUILD_PAUSED = undefined;
  env.NODE_ENV = undefined;
});

describe("server-only feature flags", () => {
  it("keeps studio guest mode off by default", async () => {
    const envVars = process.env as Record<string, string | undefined>;
    envVars.NODE_ENV = "development";
    const env = await loadEnvModule();
    expect(env.studioGuestModeEnabled()).toBe(false);
  });

  it("forces studio guest mode off in production", async () => {
    const envVars = process.env as Record<string, string | undefined>;
    envVars.NODE_ENV = "production";
    envVars.STUDIO_GUEST_MODE = "1";
    const env = await loadEnvModule();
    expect(env.studioGuestModeEnabled()).toBe(false);
  });

  it("reads live pause toggle from server env and defaults off", async () => {
    const envVars = process.env as Record<string, string | undefined>;
    envVars.NODE_ENV = "development";
    let env = await loadEnvModule();
    expect(env.liveBuildingPaused()).toBe(false);

    envVars.LIVE_BUILD_PAUSED = "1";
    env = await loadEnvModule();
    expect(env.liveBuildingPaused()).toBe(true);
  });
});
