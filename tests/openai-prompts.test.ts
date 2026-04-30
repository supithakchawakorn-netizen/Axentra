import { describe, expect, it } from "vitest";
import {
  TICKER_PROMPT_VERSION,
  TickerSummaryOutputZ,
  buildTickerPrompt,
} from "@/lib/openai/prompts/ticker";
import {
  NEWS_PROMPT_VERSION,
  NewsSummaryOutputZ,
  buildNewsPrompt,
} from "@/lib/openai/prompts/news";

describe("ticker prompt", () => {
  it("includes the symbol and name in the user message", () => {
    const p = buildTickerPrompt({ symbol: "AAPL", name: "Apple Inc." });
    expect(p.user).toContain("AAPL");
    expect(p.user).toContain("Apple Inc.");
    expect(p.system).toContain("Plain prose");
  });

  it("rejects too-short summaries", () => {
    const r = TickerSummaryOutputZ.safeParse({ body: "too short" });
    expect(r.success).toBe(false);
  });

  it("accepts a normal summary", () => {
    const body = "Apple designs consumer electronics, software, and services. ".repeat(
      4,
    );
    const r = TickerSummaryOutputZ.safeParse({ body });
    expect(r.success).toBe(true);
  });

  it("exposes a positive prompt version", () => {
    expect(TICKER_PROMPT_VERSION).toBeGreaterThan(0);
  });
});

describe("news prompt", () => {
  it("renders headlines as numbered lines", () => {
    const p = buildNewsPrompt({
      symbol: "TSLA",
      name: "Tesla, Inc.",
      headlines: [
        { title: "First", source: "Wire", publishedAt: "2026-04-29" },
        { title: "Second", source: "Wire", publishedAt: "2026-04-29" },
      ],
    });
    expect(p.user).toContain("TSLA");
    expect(p.user).toMatch(/1\. First/);
    expect(p.user).toMatch(/2\. Second/);
  });

  it("rejects too-short news", () => {
    const r = NewsSummaryOutputZ.safeParse({ body: "x" });
    expect(r.success).toBe(false);
  });

  it("exposes a positive prompt version", () => {
    expect(NEWS_PROMPT_VERSION).toBeGreaterThan(0);
  });
});
