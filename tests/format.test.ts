import { describe, expect, it } from "vitest";
import { formatDuration, formatDate } from "@/lib/utils/format";

describe("formatDuration", () => {
  it("formats minutes:seconds for sub-hour", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(5)).toBe("0:05");
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(3599)).toBe("59:59");
  });

  it("formats hours:minutes:seconds at 1h+", () => {
    expect(formatDuration(3600)).toBe("1:00:00");
    expect(formatDuration(3661)).toBe("1:01:01");
  });

  it("clamps negatives to 0", () => {
    expect(formatDuration(-5)).toBe("0:00");
  });
});

describe("formatDate", () => {
  it("renders a short absolute date", () => {
    const out = formatDate("2026-04-29T12:00:00Z");
    expect(out).toMatch(/2026/);
  });
});
