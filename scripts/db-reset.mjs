import { spawnSync } from "node:child_process";

const reset = spawnSync("supabase", ["db", "reset", "--local", "--yes"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (reset.status !== 0) {
  console.error("\n[db:reset] Local reset failed.");
  console.error("Make sure Docker is running and Supabase CLI is installed.");
  console.error("Then run: supabase start");
  process.exit(reset.status ?? 1);
}

const types = spawnSync("corepack", ["pnpm", "db:types"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (types.status !== 0) {
  process.exit(types.status ?? 1);
}

console.log("\n[db:reset] Local database reset and type generation completed.");
