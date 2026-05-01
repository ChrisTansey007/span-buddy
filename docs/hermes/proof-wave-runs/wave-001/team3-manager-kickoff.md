# Team 3 Manager Kickoff — Proof Wave 001

Source: `hermes --profile span-buddy-team3-manager chat --toolsets file` session `20260501_011813_f114ae`.

## Selected Ticket
SB-T3-001 — Baseline verification.

## Branch / Worktree
- Branch: `hermes/team3/baseline-verification`
- Worktree: `/tmp/span-buddy-worktrees/sb-t3-001`

## Commands to Run
- `pnpm install --frozen-lockfile`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test -- --run`
- `pnpm test:e2e`
- `pnpm build`

## Blocker Policy
Any non-zero command exit is a blocker to log in `problem-register.md` with command, exit code, owner, severity, and key error output. Do not advance dependent tickets until baseline is understood.

## Next Actions
Create branch/worktree, run baseline checks, update `test-results.md`, produce developer result JSON and manager review JSON, and verify no secrets are exposed.
