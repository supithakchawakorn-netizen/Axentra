import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const baseArgs = ["gen", "types", "typescript"];
const localFirst = spawnSync("supabase", [...baseArgs, "--local"], {
  encoding: "utf8",
  shell: process.platform === "win32",
});
const generated =
  localFirst.status === 0
    ? localFirst
    : spawnSync("supabase", [...baseArgs, "--linked"], {
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
