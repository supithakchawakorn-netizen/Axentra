import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin Turbopack's workspace root to this directory. Without this Next infers
  // a parent that contains another lockfile (the user's home folder).
  turbopack: {
    root: path.join(process.cwd()),
  },
  async rewrites() {
    return [
      // Public-facing creator profile URLs use @handle. Internally they map
      // to /u/[handle]; the leading @ cannot be a folder name in App Router.
      { source: "/@:handle", destination: "/u/:handle" },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "accelerometer=(), autoplay=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.mux.com" },
      { protocol: "https", hostname: "stream.mux.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "livekit.io" },
    ],
  },
};

export default nextConfig;
