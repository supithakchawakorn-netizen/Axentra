import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const generated = spawnSync("supabase", ["gen", "types", "typescript", "--linked"], {
  encoding: "utf8",
  shell: process.platform === "win32",
});

if (generated.status !== 0) {
  if (generated.stdout) process.stdout.write(generated.stdout);
  if (generated.stderr) process.stderr.write(generated.stderr);
  process.exit(generated.status ?? 1);
}

const target = resolve(process.cwd(), "types", "db.ts");
writeFileSync(target, generated.stdout ?? "", "utf8");
console.log(`[db:types] Wrote ${target}`);
