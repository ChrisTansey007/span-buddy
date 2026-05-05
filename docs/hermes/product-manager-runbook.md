
# Product Manager Runbook — Research → Build Ownership

Owner profile: `span-buddy-product-manager`

This runbook is the Product Manager's operating loop. The PM owns roadmap, backlog, ticket promotion, sequencing, and integration decisions. The director/orchestrator may inspect and verify, but should not be required to manage day-to-day flow.

## Core principle

Research does not become build work automatically.

```text
Research finding → candidate ticket → PM promote/hold/reject → build ticket → Team 3 verification → integration
```

## PM startup checklist

Run from repo root:

```bash
cd /home/theca/work/span-buddy
git fetch origin
git status --short --branch
pnpm hermes:resume
pnpm hermes:validate
pnpm hermes:test
grep -RIn '<<<<<<<\|=======\|>>>>>>>' -- docs .hermes || true
```

If conflict markers exist, do not launch feature work. Create or keep a stabilization ticket active first.

## Every-loop PM checklist

1. Read:
   - `.hermes/current_state.json`
   - `.hermes/tickets.yaml`
   - `.hermes/lanes.yaml`
   - `docs/hermes/status-board.md`
   - `docs/hermes/problem-register.md`
   - `docs/hermes/ticket-backlog.md`
   - `docs/hermes/ticket-generation-policy.md`
   - `docs/hermes/action-plan-research-build.md`
2. Check active/pending lane evidence using `pnpm hermes:resume`.
3. Review Team 4 research artifacts and candidate tickets.
4. Promote only the next safe bounded ticket to `ready`.
5. Ensure every ready ticket has:
   - owner lane and manager profile
   - branch
   - worktree
   - allowed files/directories
   - acceptance criteria
   - required commands
   - Team 3 verification need
6. Keep Team 2 blocked/planned until Team 1 has verified engine contracts or Team 2 work is explicitly UI-only.
7. Require Team 3 to verify before integration.
8. Update status-board and event log.
9. Commit/push PM governance changes and verify the remote ref.

## Current startup sequence

Until `main` is stable, PM should run this order:

1. `SB-PM-001` — activate governance and own the process.
2. `SB-T3-001` — baseline verification and conflict-marker cleanup.
3. `SB-T4-001` — source-map research and candidate-ticket feed.
4. `SB-T1-001` — engine result contracts.
5. `SB-T2-001` — UI shell only after Team 1 contracts are available or scope is explicitly independent.

## Promotion decision template

When evaluating a candidate, write one of:

```text
PROMOTE: <ticket-id>
Reason:
Owner lane:
Allowed files:
Required verification:
Dependencies:
Risk controls:
```

```text
HOLD: <candidate-id>
Reason:
Missing evidence:
Next research action:
```

```text
REJECT: <candidate-id>
Reason:
Safety/liability/product rationale:
```

## Integration gate

Before PM marks a ticket `integration_ready` or `merged`, require:

```bash
pnpm lint
pnpm typecheck
pnpm test -- --run
pnpm build
```

Run `pnpm test:e2e` when UI/user flows changed. If Playwright infrastructure is unavailable, record that as a blocker or limitation rather than calling the ticket fully verified.

## Evidence rules

Acceptable evidence:

- process ID for a currently running manager/agent
- branch/worktree evidence
- diff or commit hash
- pushed ref verified via `git ls-remote`
- command output from required verification
- signed result/review/verification JSON when available

Do not count these as delivery evidence by themselves:

- planned tickets
- role/persona docs
- cron schedule existence
- kickoff prose
- unverifiable summaries

## GitHub push rule

Use existing WSL `gh` authentication. Do not copy tokens into repo files or profile `.env` files. After every push, verify:

```bash
git ls-remote origin refs/heads/<branch>
```
