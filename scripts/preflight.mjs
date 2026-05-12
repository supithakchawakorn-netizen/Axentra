import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

function checkCommand(label, command, args) {
  const result = spawnSync(command, args, { encoding: "utf8", shell: process.platform === "win32" });
  if (result.status === 0) {
    const line = (result.stdout || "").trim().split("\n")[0] || "ok";
    console.log(`✓ ${label}: ${line}`);
    return true;
  }
  console.log(`✗ ${label}: unavailable`);
  return false;
}

console.log("[preflight] Checking local development prerequisites...\n");

checkCommand("Node", "node", ["--version"]);
checkCommand("Corepack", "corepack", ["--version"]);
checkCommand("Supabase CLI", "supabase", ["--version"]);

const linkedProject = resolve(process.cwd(), "supabase", ".temp", "project-ref");
if (existsSync(linkedProject)) {
  console.log("✓ Supabase project link: found");
} else {
  console.log("✗ Supabase project link: missing (run `supabase link --project-ref <your-ref>`)");
}

const tokenPaths = [
  join(homedir(), ".supabase", "access-token"),
  join(homedir(), ".supabase", "access-token.json"),
];
const hasToken = Boolean(process.env.SUPABASE_ACCESS_TOKEN) || tokenPaths.some((path) => existsSync(path));
if (hasToken) {
  console.log("✓ Supabase auth token: found");
} else {
  console.log("✗ Supabase auth token: missing (run `supabase login`)");
}

console.log("\n[preflight] Done.");
