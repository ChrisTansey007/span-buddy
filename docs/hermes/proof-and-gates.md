# Proof and Integration Gates

## Activation Evidence
A manager/developer is active only when at least one of these exists:
- scheduled cron job with job_id and next_run_at
- running process/PID and log file
- assigned branch/worktree
- ticket packet
- signed result/review/verification artifact

## Delivery Evidence
Work is delivered only when all applicable items exist:
- developer result JSON in `docs/hermes/agent-results/<ticket-id>/`
- manager review JSON in `docs/hermes/manager-reviews/<ticket-id>/`
- Team 3 verification JSON in `docs/hermes/verification/<ticket-id>/`
- commit hash and pushed ref evidence, if code changed
- verification command output in `docs/hermes/test-results.md`

## Integration Gates
1. Scope gate: ticket touched only allowed files/directories.
2. Guardrail gate: disclaimer, strict TS, engine isolation, IRC data policy intact.
3. Test gate: required commands pass or blocker documented.
4. Security gate: no secrets; dependency risk checked if deps changed.
5. Product gate: Product Manager approves user value and roadmap fit.
6. Verification gate: Team 3 accepts or explicitly risk-flags.

## Reporting Standard
Reports must separate:
- setup evidence
- active execution evidence
- delivered work evidence
- blockers
- next actions
