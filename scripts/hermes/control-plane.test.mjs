import assert from "node:assert/strict";
import { mkdtemp, cp, readFile, rm, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const scriptRoot = path.join(repoRoot, "scripts", "hermes");

async function copyFixture() {
  const tmp = await mkdtemp(path.join(os.tmpdir(), "span-buddy-hermes-"));
  for (const relativePath of [
    ".hermes/current_state.json",
    ".hermes/tickets.yaml",
    ".hermes/lanes.yaml",
    ".hermes/events.jsonl",
    ".hermes/run_registry.json",
    ".hermes/model_budget.json",
    ".hermes/last_reconciliation.json",
    "docs/hermes/resume-runbook.md",
    "docs/hermes/proof-and-gates.md",
    "docs/hermes/operating-model.md",
    "package.json",
  ]) {
    await cp(path.join(repoRoot, relativePath), path.join(tmp, relativePath), {
      recursive: true,
    });
  }
  return tmp;
}

function runScript(name, cwd, args = []) {
  return spawnSync(process.execPath, [path.join(scriptRoot, name), ...args], {
    cwd,
    encoding: "utf8",
  });
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

test("validate-control-plane rejects a missing required control-plane file", async () => {
  const fixture = await copyFixture();
  try {
    await rm(path.join(fixture, ".hermes/tickets.yaml"));
    const result = runScript("validate-control-plane.mjs", fixture);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr + result.stdout, /tickets\.yaml/);
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});

test("validate-control-plane accepts the seeded baseline state", async () => {
  const fixture = await copyFixture();
  try {
    const result = runScript("validate-control-plane.mjs", fixture);

    assert.equal(result.status, 0, result.stderr + result.stdout);
    assert.match(result.stdout, /control plane valid/i);
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});

test("reconcile writes durable status, event, and resume board artifacts", async () => {
  const fixture = await copyFixture();
  try {
    const result = runScript("reconcile.mjs", fixture, ["--reason", "test-run"]);

    assert.equal(result.status, 0, result.stderr + result.stdout);
    assert.match(result.stdout, /reconciliation complete/i);

    const reconciliation = await readJson(
      path.join(fixture, ".hermes/last_reconciliation.json"),
    );
    assert.equal(reconciliation.reason, "test-run");
    assert.equal(reconciliation.lanes.length, 5);
    assert.equal(typeof reconciliation.git.status_short, "string");
    assert.equal(typeof reconciliation.git.status_exit_code, "number");

    const currentState = await readJson(path.join(fixture, ".hermes/current_state.json"));
    assert.equal(currentState.last_reconciliation_time, reconciliation.timestamp);
    assert.match(currentState.next_safe_action, /review resume board/i);

    const events = await readFile(path.join(fixture, ".hermes/events.jsonl"), "utf8");
    assert.match(events, /control_plane_reconciled/);

    const board = await readFile(path.join(fixture, ".hermes/resume-board.md"), "utf8");
    assert.match(board, /# Hermes Resume Board/);
    assert.match(board, /SB-T1-001/);
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});

test("resume prints conservative lane evidence without launching agents", async () => {
  const fixture = await copyFixture();
  try {
    const result = runScript("resume.mjs", fixture);

    assert.equal(result.status, 0, result.stderr + result.stdout);
    assert.match(result.stdout, /Hermes Resume Board/);
    assert.match(result.stdout, /product_manager/);
    assert.match(result.stdout, /ticket_exists/);
    assert.doesNotMatch(result.stdout, /launched agent/i);
    assert.ok(existsSync(path.join(fixture, ".hermes/resume-board.md")));
    await stat(path.join(fixture, ".hermes/last_reconciliation.json"));
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});
