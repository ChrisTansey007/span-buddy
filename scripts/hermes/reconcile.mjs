import {
  appendEvent,
  buildLaneReconciliation,
  buildResumeBoard,
  loadControlPlane,
  repoRootFromCwd,
  runGit,
  validateControlPlaneShape,
  validateRequiredFiles,
  writeJson,
} from "./control-plane-lib.mjs";
import { writeFile } from "node:fs/promises";
import path from "node:path";

function parseReason(argv) {
  const index = argv.indexOf("--reason");
  if (index >= 0 && argv[index + 1]) {
    return argv[index + 1];
  }
  return "manual-reconcile";
}

async function main() {
  const root = repoRootFromCwd();
  const reason = parseReason(process.argv.slice(2));
  const errors = validateRequiredFiles(root);
  let controlPlane = null;

  if (errors.length === 0) {
    controlPlane = await loadControlPlane(root);
    errors.push(...validateControlPlaneShape(controlPlane));
  }

  if (errors.length > 0 || !controlPlane) {
    console.error("Cannot reconcile invalid Hermes control plane:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  const timestamp = new Date().toISOString();
  const gitStatus = runGit(root, ["status", "--short", "--branch"]);
  const gitBranches = runGit(root, ["branch", "-a"]);
  const gitWorktrees = runGit(root, ["worktree", "list", "--porcelain"]);
  const lanes = buildLaneReconciliation(controlPlane);

  const reconciliation = {
    schema_version: "1.0.0",
    timestamp,
    reason,
    git: {
      status_short: gitStatus.stdout,
      status_exit_code: gitStatus.status,
      branches: gitBranches.stdout,
      branches_exit_code: gitBranches.status,
      worktrees: gitWorktrees.stdout,
      worktrees_exit_code: gitWorktrees.status,
    },
    lanes,
    notes: [
      "Conservative reconciliation only; no agents were launched.",
      "A lane is not active unless process/run evidence is present.",
    ],
  };

  const nextCurrentState = {
    ...controlPlane.currentState,
    last_reconciliation_time: timestamp,
    next_safe_action: "Review resume board, then explicitly launch only eligible lanes with fresh locks and run evidence.",
  };

  await writeJson(root, ".hermes/last_reconciliation.json", reconciliation);
  await writeJson(root, ".hermes/current_state.json", nextCurrentState);
  await writeFile(
    path.join(root, ".hermes/resume-board.md"),
    buildResumeBoard({ reconciliation, currentState: nextCurrentState, git: reconciliation.git }),
  );
  await appendEvent(root, {
    timestamp,
    event: "control_plane_reconciled",
    reason,
    lanes: lanes.map((lane) => ({
      lane: lane.lane,
      ticket: lane.active_ticket,
      classification: lane.conservative_classification,
      evidence: lane.evidence,
    })),
  });

  console.log("Hermes reconciliation complete.");
  console.log(`Resume board: .hermes/resume-board.md`);
  console.log(`Lanes reconciled: ${lanes.length}`);
}

await main();
