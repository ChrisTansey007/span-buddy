# Resume Runbook

`pnpm hermes:resume` is the safe control-plane resume entrypoint.

It performs a conservative reconciliation, writes `.hermes/last_reconciliation.json`,
updates `.hermes/current_state.json` with the reconciliation timestamp, appends a
`control_plane_reconciled` event, writes `.hermes/resume-board.md`, and prints the
board.

It does **not** launch agents. Agent launch requires an explicit follow-up command,
fresh lock checks, and run/process evidence.

## Commands

```bash
pnpm hermes:validate   # validate required files and lane/ticket consistency
pnpm hermes:reconcile  # reconcile git/worktree/lane evidence and write resume board
pnpm hermes:resume     # reconcile, then print the resume board
pnpm hermes:test       # run control-plane script tests
```

## Manual resume checklist

Use this checklist when diagnosing script output or when scripts fail:

1. Read `.hermes/current_state.json`.
2. Read `.hermes/tickets.yaml`.
3. Read `.hermes/lanes.yaml`.
4. Inspect `.hermes/events.jsonl`.
5. Run `git status --short --branch`.
6. Run `git branch -a`.
7. Run `git worktree list --porcelain`.
8. Check remote refs when credentials/network allow.
9. Inspect `.hermes/runs/` and `.hermes/locks/`.
10. Classify each lane as planned, ready, assigned, launched, running, stale,
    blocked, produced_artifact, needs_review, verified, integration_ready,
    merged, closed, or failed.
11. Update `.hermes/last_reconciliation.json`.
12. Launch only explicitly requested eligible lanes.

## Safe default

If evidence is missing or ambiguous, classify conservatively and recommend an
inspection step rather than launching or claiming progress.
