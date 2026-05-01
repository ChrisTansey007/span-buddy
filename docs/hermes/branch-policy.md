# Branch and Worktree Policy

Every active ticket should have a predictable branch and preferably an isolated
worktree.

## Initial branch names

- `hermes/product/SB-PM-001-governance`
- `hermes/team1/SB-T1-001-engine-contracts`
- `hermes/team2/SB-T2-001-ui-flow`
- `hermes/team3/SB-T3-001-verification`
- `hermes/team4/SB-T4-001-rd-map`

## Worktree root

Use `.hermes/worktrees/` or an explicitly configured external worktree root.
Do not mark a ticket `running` unless branch, worktree, and run evidence exist.
Do not mark a ticket `verified` unless Team 3 produced verification evidence.
Do not mark a ticket `merged` unless merge/main evidence exists.
