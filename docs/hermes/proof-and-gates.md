
# Proof and Gates

## Purpose

This document defines what counts as proof for Span Buddy multi-agent work and what must pass before work is integrated.

## Evidence hierarchy

Strong evidence:

1. Pushed branch ref verified by `git ls-remote` plus verification output.
2. Local commit plus verification output.
3. Worktree with diff plus verification output.
4. Control-plane state showing launched/running with recent run ID and process evidence.
5. Ticket ready state with branch/worktree scope.

Weak evidence that must not be reported as active delivery by itself:

- ticket existence
- planning docs
- persona docs
- kickoff prose
- cron job existence

## Required verification for code changes

```bash
pnpm lint
pnpm typecheck
pnpm test -- --run
pnpm build
```

Run `pnpm test:e2e` when UI/user flows changed.

## Safety gates

- Disclaimer text/semantics may not be weakened.
- No production code may claim the tool stamps, seals, certifies, or replaces a PE.
- Engine changes require citations, assumptions, warnings, and unsupported-case behavior.
- Table data requires citation metadata and human review where transcription is involved.
- Team 3 must verify code/release behavior before PM integration.

## PM integration gate

The Product Manager may mark a ticket `integration_ready` only after proof includes:

- owner branch and worktree
- changed files summary
- commit hash
- pushed ref if complete
- required command output
- Team 3 review/verification when code or release behavior changed

The Product Manager may mark `merged` only after merge/ref evidence exists.
