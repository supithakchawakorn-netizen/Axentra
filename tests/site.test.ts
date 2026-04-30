import { afterEach, describe, expect, it } from "vitest";
import { siteUrl } from "@/lib/utils/site";

const ORIGINAL = process.env.NEXT_PUBLIC_SITE_URL;

afterEach(() => {
  process.env.NEXT_PUBLIC_SITE_URL = ORIGINAL;
});

describe("siteUrl", () => {
  it("falls back to localhost when unset", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(siteUrl()).toBe("http://localhost:3000");
  });

  it("strips a trailing slash", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://axentra.app/";
    expect(siteUrl()).toBe("https://axentra.app");
  });

  it("returns the configured URL otherwise", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
    expect(siteUrl()).toBe("https://example.com");
  });
});
