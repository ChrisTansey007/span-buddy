import { readFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { repoRootFromCwd } from "./control-plane-lib.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const root = repoRootFromCwd();
  const reconcile = spawnSync(process.execPath, [path.join(scriptDir, "reconcile.mjs"), "--reason", "resume"], {
    cwd: root,
    encoding: "utf8",
  });

  if (reconcile.status !== 0) {
    process.stderr.write(reconcile.stderr);
    process.stdout.write(reconcile.stdout);
    process.exitCode = reconcile.status ?? 1;
    return;
  }

  const board = await readFile(path.join(root, ".hermes/resume-board.md"), "utf8");
  console.log(board);
}

await main();
