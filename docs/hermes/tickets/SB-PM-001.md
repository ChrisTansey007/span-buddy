
# Ticket: SB-PM-001 — Create and maintain durable ticket governance and backlog controls

## Ownership

- Lane: `product_manager`
- Owner: Product Manager
- Branch: `hermes/product/SB-PM-001-governance`
- Worktree: `.hermes/worktrees/SB-PM-001`

## Summary

Own the research-build process, promotion gates, status board, and kickoff sequence.

## Scope

Allowed files/directories depend on the active ticket packet and must be kept bounded. Do not edit secrets or credential files.

## Acceptance Criteria

- [ ] Work is scoped to the ticket and branch above.
- [ ] Required artifacts are updated.
- [ ] Guardrails from `docs/hermes/proof-and-gates.md` are preserved.
- [ ] Verification output is recorded.
- [ ] Commit/ref evidence exists before completion is claimed.

## Required Commands

```bash
pnpm hermes:validate
pnpm hermes:test
```

For code or user-visible behavior changes, also run:

```bash
pnpm lint
pnpm typecheck
pnpm test -- --run
pnpm build
```

Run `pnpm test:e2e` when UI/user flows changed.
