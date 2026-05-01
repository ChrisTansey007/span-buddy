# Verification Policy

Team 3 owns independent verification. No ticket is `verified` unless Team 3
produces verification evidence.

## Baseline commands

Use the project's package manager, currently pnpm:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

Capture command, exit code, timestamp, and relevant output in proof artifacts.
If dependencies are unavailable, record the blocker rather than skipping it.
