# Branch and Worktree Plan

## Branch Naming
- Product manager docs: `hermes/product-manager`
- Team manager branches: `hermes/team-1-manager`, `hermes/team-2-manager`, `hermes/team-3-manager`, `hermes/team-4-manager`
- Developer ticket branches: `agent/team-<n>/<developer-id>/<ticket-id>`
- Research spikes: `research/team-4/<ticket-id>`

## Worktree Naming
Use sibling worktrees where practical:
- `/tmp/span-buddy-worktrees/team-1/<ticket-id>`
- `/tmp/span-buddy-worktrees/team-2/<ticket-id>`
- `/tmp/span-buddy-worktrees/team-3/<ticket-id>`
- `/tmp/span-buddy-worktrees/team-4/<ticket-id>`

## Rules
- No `git add .`; stage intended paths only.
- Managers review developer diffs before pushing team branches.
- Product Manager does not merge to main without Team 3 verification.
- If running under WSL with Windows GitHub auth, push explicit refs from the main repo path when needed.
