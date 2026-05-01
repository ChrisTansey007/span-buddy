# Hermes Runs

This directory stores durable run artifacts for manager and developer lanes.
Each run should get a unique run id, a log, and any proof artifacts needed to
reconcile state after a reboot.

Expected future layout:

```text
.hermes/runs/<run_id>/
  run.json
  prompt.md
  output.log
  proof.json
```

Run artifacts are evidence only when they can be tied to a lane, ticket, branch,
worktree, and state transition in `.hermes/events.jsonl`.
