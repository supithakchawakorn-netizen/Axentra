import { describe, expect, it } from "vitest";
import {
  CreateUploadInputZ,
  EditVideoInputZ,
  SetVisibilityInputZ,
  DeleteVideoInputZ,
} from "@/types/video";
import { UpdateProfileInputZ, HandleZ } from "@/types/profile";

describe("CreateUploadInputZ", () => {
  it("requires a non-empty title", () => {
    const r = CreateUploadInputZ.safeParse({ title: "" });
    expect(r.success).toBe(false);
  });

  it("defaults visibility to public and description to empty", () => {
    const r = CreateUploadInputZ.parse({ title: "Hello" });
    expect(r.visibility).toBe("public");
    expect(r.description).toBe("");
    expect(r.tickerIds).toEqual([]);
  });

  it("rejects visibility values outside the enum", () => {
    const r = CreateUploadInputZ.safeParse({ title: "ok", visibility: "private" });
    expect(r.success).toBe(false);
  });

  it("trims title and description", () => {
    const r = CreateUploadInputZ.parse({ title: "  ok  ", description: " hi " });
    expect(r.title).toBe("ok");
    expect(r.description).toBe("hi");
  });

  it("caps tickerIds at 8", () => {
    const ids = Array.from({ length: 9 }, () => crypto.randomUUID());
    const r = CreateUploadInputZ.safeParse({ title: "ok", tickerIds: ids });
    expect(r.success).toBe(false);
  });

  it("rejects non-uuid tickerIds", () => {
    const r = CreateUploadInputZ.safeParse({
      title: "ok",
      tickerIds: ["not-a-uuid"],
    });
    expect(r.success).toBe(false);
  });
});

const SAMPLE_UUID = crypto.randomUUID();

describe("EditVideoInputZ", () => {
  it("requires a uuid videoId", () => {
    const r = EditVideoInputZ.safeParse({
      videoId: "not-a-uuid",
      title: "ok",
      description: "",
    });
    expect(r.success).toBe(false);
  });

  it("accepts a valid uuid with no tickers", () => {
    const r = EditVideoInputZ.safeParse({
      videoId: SAMPLE_UUID,
      title: "ok",
      description: "",
      tickerIds: [],
    });
    expect(r.success).toBe(true);
  });

  it("accepts a valid uuid with up to 8 tickers", () => {
    const ids = Array.from({ length: 8 }, () => crypto.randomUUID());
    const r = EditVideoInputZ.safeParse({
      videoId: SAMPLE_UUID,
      title: "ok",
      description: "",
      tickerIds: ids,
    });
    expect(r.success).toBe(true);
  });
});

describe("SetVisibilityInputZ", () => {
  it("only accepts public/unlisted", () => {
    const ok = SetVisibilityInputZ.safeParse({
      videoId: SAMPLE_UUID,
      visibility: "unlisted",
    });
    expect(ok.success).toBe(true);
    const bad = SetVisibilityInputZ.safeParse({
      videoId: SAMPLE_UUID,
      visibility: "private",
    });
    expect(bad.success).toBe(false);
  });
});

describe("DeleteVideoInputZ", () => {
  it("requires uuid", () => {
    const r = DeleteVideoInputZ.safeParse({ videoId: "abc" });
    expect(r.success).toBe(false);
  });
});

describe("HandleZ + UpdateProfileInputZ", () => {
  it("rejects handles with bad characters", () => {
    expect(HandleZ.safeParse("ABC!").success).toBe(false);
    expect(HandleZ.safeParse("ab").success).toBe(false);
    expect(HandleZ.safeParse("a".repeat(33)).success).toBe(false);
  });

  it("lowercases handles", () => {
    expect(HandleZ.parse("Grace_42")).toBe("grace_42");
  });

  it("requires display_name", () => {
    const r = UpdateProfileInputZ.safeParse({
      handle: "grace",
      displayName: "",
      bio: "",
    });
    expect(r.success).toBe(false);
  });

  it("accepts an empty avatarUrl literal", () => {
    const r = UpdateProfileInputZ.parse({
      handle: "grace",
      displayName: "Grace",
      bio: "",
      avatarUrl: "",
    });
    expect(r.avatarUrl).toBe("");
  });
});
