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
};

export default nextConfig;
