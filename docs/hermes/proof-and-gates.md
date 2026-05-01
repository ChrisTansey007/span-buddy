# Proof and Gates

## Evidence levels

- `profile_exists`: Hermes profile exists.
- `ticket_exists`: ticket packet exists in `.hermes/tickets.yaml` or docs.
- `branch_exists`: local git branch exists.
- `worktree_exists`: worktree exists and points at the expected branch.
- `run_started`: run registry or lock records a run id.
- `agent_output_exists`: run log or artifact exists.
- `diff_exists`: git diff or uncommitted artifact exists.
- `commit_exists`: local commit exists for the lane branch.
- `pushed_exists`: remote ref proves branch was pushed.
- `pr_exists`: GitHub pull request exists.
- `tests_passed`: verification commands passed with captured output.
- `manager_reviewed`: manager review artifact exists.
- `verifier_approved`: Team 3 approval artifact exists.
- `merged_to_main`: merge commit or main branch evidence exists.

## State transitions

- `planned` → `ready`: ticket exists.
- `ready` → `assigned`: owner/lane assigned.
- `assigned` → `launched`: branch, worktree, and run id are created.
- `launched` → `running`: active run log or recent process evidence exists.
- `running` → `produced_artifact`: diff, file, research log, commit, or other
  artifact exists.
- `produced_artifact` → `needs_review`: manager review exists.
- `needs_review` → `verified`: Team 3 verification exists.
- `verified` → `integration_ready`: tests/checks pass.
- `integration_ready` → `merged`: merge evidence exists.
- `merged` → `closed`: final state updated and event logged.

## Non-inflation rules

A profile existing is not a running team. A kickoff report is not delivered work.
A local diff is not pushed work. A commit is not verified work. A verified branch
is not merged work.
