import { appendFile, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

export const REQUIRED_JSON_FILES = [
  ".hermes/current_state.json",
  ".hermes/run_registry.json",
  ".hermes/model_budget.json",
  ".hermes/last_reconciliation.json",
];

export const REQUIRED_TEXT_FILES = [
  ".hermes/tickets.yaml",
  ".hermes/lanes.yaml",
  ".hermes/events.jsonl",
  "docs/hermes/resume-runbook.md",
  "docs/hermes/proof-and-gates.md",
  "docs/hermes/operating-model.md",
];

export const ALL_REQUIRED_FILES = [...REQUIRED_JSON_FILES, ...REQUIRED_TEXT_FILES];

export function repoRootFromCwd() {
  return process.cwd();
}

export function resolveRepo(root, relativePath) {
  return path.join(root, relativePath);
}

export async function readJson(root, relativePath) {
  return JSON.parse(await readFile(resolveRepo(root, relativePath), "utf8"));
}

export async function writeJson(root, relativePath, value) {
  await writeFile(resolveRepo(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

export async function readText(root, relativePath) {
  return readFile(resolveRepo(root, relativePath), "utf8");
}

export function runGit(root, args) {
  const result = spawnSync("git", args, {
    cwd: root,
    encoding: "utf8",
  });
  return {
    args,
    status: result.status,
    stdout: result.stdout.trimEnd(),
    stderr: result.stderr.trimEnd(),
  };
}

export function parseSimpleYamlMap(yamlText, topKey) {
  const lines = yamlText.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `${topKey}:`);
  if (start === -1) {
    return {};
  }

  const entries = {};
  let currentKey = null;
  let currentIndent = null;
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim() || line.trim().startsWith("#")) {
      continue;
    }
    const indent = line.match(/^\s*/)?.[0].length ?? 0;
    if (indent === 0) {
      break;
    }
    const keyMatch = line.match(/^\s{2}([A-Za-z0-9_-]+):\s*$/);
    if (keyMatch) {
      currentKey = keyMatch[1];
      currentIndent = indent;
      entries[currentKey] = {};
      continue;
    }
    if (!currentKey || currentIndent === null || indent <= currentIndent) {
      continue;
    }
    const propertyMatch = line.match(/^\s{4}([A-Za-z0-9_-]+):\s*(.*)$/);
    if (propertyMatch) {
      const [, property, rawValue] = propertyMatch;
      entries[currentKey][property] = parseYamlScalar(rawValue);
    }
  }
  return entries;
}

function parseYamlScalar(rawValue) {
  const value = rawValue.trim();
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }
  if (value.startsWith("[") && value.endsWith("]")) {
    const inner = value.slice(1, -1).trim();
    return inner ? inner.split(",").map((item) => item.trim()) : [];
  }
  if (value === "null") {
    return null;
  }
  return value;
}

export async function loadControlPlane(root) {
  const currentState = await readJson(root, ".hermes/current_state.json");
  const ticketsText = await readText(root, ".hermes/tickets.yaml");
  const lanesText = await readText(root, ".hermes/lanes.yaml");
  return {
    currentState,
    tickets: parseSimpleYamlMap(ticketsText, "tickets"),
    lanes: parseSimpleYamlMap(lanesText, "lanes"),
    ticketsText,
    lanesText,
  };
}

export function validateControlPlaneShape(controlPlane) {
  const errors = [];
  const { currentState, tickets, lanes } = controlPlane;
  if (currentState.project !== "Span Buddy") {
    errors.push(".hermes/current_state.json project must be Span Buddy");
  }
  if (!currentState.current_wave) {
    errors.push(".hermes/current_state.json current_wave is required");
  }
  if (!currentState.lanes || typeof currentState.lanes !== "object") {
    errors.push(".hermes/current_state.json lanes map is required");
    return errors;
  }

  for (const [laneId, laneState] of Object.entries(currentState.lanes)) {
    if (!lanes[laneId]) {
      errors.push(`lane ${laneId} missing from .hermes/lanes.yaml`);
    }
    if (!laneState.active_ticket) {
      errors.push(`lane ${laneId} missing active_ticket`);
      continue;
    }
    const ticket = tickets[laneState.active_ticket];
    if (!ticket) {
      errors.push(`ticket ${laneState.active_ticket} missing from .hermes/tickets.yaml`);
      continue;
    }
    if (ticket.lane !== laneId) {
      errors.push(`ticket ${laneState.active_ticket} lane ${ticket.lane} does not match ${laneId}`);
    }
    if (!Array.isArray(laneState.evidence) || laneState.evidence.length === 0) {
      errors.push(`lane ${laneId} must have evidence array`);
    }
  }
  return errors;
}

export function validateRequiredFiles(root) {
  const errors = [];
  for (const relativePath of ALL_REQUIRED_FILES) {
    if (!existsSync(resolveRepo(root, relativePath))) {
      errors.push(`missing required file: ${relativePath}`);
    }
  }
  return errors;
}

export function buildLaneReconciliation(controlPlane) {
  const { currentState, tickets, lanes } = controlPlane;
  return Object.entries(currentState.lanes).map(([laneId, laneState]) => {
    const ticket = tickets[laneState.active_ticket] ?? {};
    const lane = lanes[laneId] ?? {};
    return {
      lane: laneId,
      display_name: lane.display_name ?? laneId,
      status: laneState.status,
      active_ticket: laneState.active_ticket,
      ticket_state: ticket.state ?? "unknown",
      branch: laneState.branch ?? ticket.branch ?? lane.default_branch ?? null,
      worktree: laneState.worktree ?? ticket.worktree ?? lane.default_worktree ?? null,
      run_id: laneState.run_id ?? null,
      evidence: laneState.evidence ?? [],
      verification_status: laneState.verification_status ?? "unknown",
      conservative_classification: classifyLane(laneState),
    };
  });
}

function classifyLane(laneState) {
  if (laneState.blocked_reason) {
    return "blocked";
  }
  if (laneState.run_id && laneState.evidence?.includes("process_running")) {
    return "running";
  }
  if (laneState.evidence?.includes("verified_tests")) {
    return "verified";
  }
  if (laneState.evidence?.includes("local_diff") || laneState.evidence?.includes("commit_exists")) {
    return "needs_review";
  }
  return laneState.status ?? "planned";
}

export function buildResumeBoard({ reconciliation, currentState, git }) {
  const lines = [
    "# Hermes Resume Board",
    "",
    `Generated: ${reconciliation.timestamp}`,
    `Reason: ${reconciliation.reason}`,
    `Wave: ${currentState.current_wave}`,
    `Phase: ${currentState.current_phase}`,
    "",
    "## Git evidence",
    "",
    "```text",
    git.status_short || "(no git status output)",
    "```",
    "",
    "## Lane status",
    "",
    "| Lane | Ticket | Status | Conservative classification | Evidence | Verification | Branch | Worktree |",
    "|---|---|---|---|---|---|---|---|",
  ];

  for (const lane of reconciliation.lanes) {
    lines.push(
      `| ${lane.lane} | ${lane.active_ticket} | ${lane.status} | ${lane.conservative_classification} | ${lane.evidence.join(", ")} | ${lane.verification_status} | ${lane.branch ?? ""} | ${lane.worktree ?? ""} |`,
    );
  }

  lines.push(
    "",
    "## Safe next action",
    "",
    currentState.next_safe_action,
    "",
    "No agents are launched by this board. Launch requires an explicit follow-up command and fresh evidence checks.",
    "",
  );
  return lines.join("\n");
}

export async function appendEvent(root, event) {
  await appendFile(resolveRepo(root, ".hermes/events.jsonl"), `${JSON.stringify(event)}\n`);
}
