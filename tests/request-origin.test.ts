import { describe, expect, it } from "vitest";
import { deriveRequestOrigin, inferProtoFromHost } from "@/lib/utils/request-origin";

describe("inferProtoFromHost", () => {
  it("uses http for localhost and private network hosts", () => {
    expect(inferProtoFromHost("localhost:3000")).toBe("http");
    expect(inferProtoFromHost("127.0.0.1:3000")).toBe("http");
    expect(inferProtoFromHost("192.168.1.11:3000")).toBe("http");
    expect(inferProtoFromHost("10.0.0.5:3000")).toBe("http");
    expect(inferProtoFromHost("172.27.96.1:3000")).toBe("http");
  });

  it("uses https for public hosts", () => {
    expect(inferProtoFromHost("axely.app")).toBe("https");
    expect(inferProtoFromHost("example.com:443")).toBe("https");
  });
});

describe("deriveRequestOrigin", () => {
  it("prefers valid origin header", () => {
    const result = deriveRequestOrigin({
      originHeader: "http://192.168.1.11:3000",
      forwardedProtoHeader: null,
      forwardedHostHeader: "axely.app",
      hostHeader: "axely.app",
    });
    expect(result).toBe("http://192.168.1.11:3000");
  });

  it("falls back to host with inferred http for LAN", () => {
    const result = deriveRequestOrigin({
      originHeader: null,
      forwardedProtoHeader: null,
      forwardedHostHeader: "192.168.1.11:3000",
      hostHeader: null,
    });
    expect(result).toBe("http://192.168.1.11:3000");
  });
});

