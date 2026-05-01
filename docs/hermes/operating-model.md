<<<<<<< HEAD
# Span Buddy Agent Operating Model

Created: 2026-05-01T04:47:20Z

## Organization

```text
Hermes / Product Owner Supervisor
└── Product Manager
    ├── Team 1 Manager — Core Architecture / Backend
    │   ├── T1 Dev A — Engine Specialist
    │   ├── T1 Dev B — IRC Data & Citations Specialist
    │   └── T1 Dev C — Validation & Contracts Specialist
    ├── Team 2 Manager — Product / UI / UX
    │   ├── T2 Dev A — Calculator Workspace UI Specialist
    │   ├── T2 Dev B — Result Explanation & Disclaimer UX Specialist
    │   └── T2 Dev C — Accessibility / Mobile Polish Specialist
    ├── Team 3 Manager — Verification / Testing / Security
    │   ├── T3 Dev A — Test Automation Specialist
    │   ├── T3 Dev B — Security / Secrets / Dependency Reviewer
    │   └── T3 Dev C — Manual QA / Release Readiness Specialist
    └── Team 4 Manager — Research & Development
        ├── T4 Dev A — Structural Research Specialist
        ├── T4 Dev B — Feature Prototype Specialist
        └── T4 Dev C — Research Evaluation & Integration Specialist
```

## Core Rule
Do not confuse setup with delivery. Cron jobs, planning docs, profiles, and prompts are activation evidence only. Delivery evidence requires signed artifacts plus git/verification proof.

## Lifecycle
1. Product Manager writes or approves bounded ticket packet.
2. Team Manager assigns a developer persona and branch/worktree.
3. Developer produces code/docs/research plus `agent-results/<ticket>/<agent>.json`.
4. Team Manager reviews and writes `manager-reviews/<ticket>/<manager>.json`.
5. Team 3 verifies and writes `verification/<ticket>/<verifier>.json`.
6. Product Manager decides integrate / reject / defer.
7. Hermes integrates only approved, verified work.

## Repository Guardrails
- Preserve the liability disclaimer and its protected semantic claims.
- Keep `strict`, `noUncheckedIndexedAccess`, and `exactOptionalPropertyTypes` enabled.
- Keep `engine/` free of Next/React/browser imports.
- Keep IRC span numbers in `data/irc-2021/` JSON with citation metadata, not scattered through source.
- Use Conventional Commits.
- Run verification gate before merge: `pnpm lint`, `pnpm typecheck`, `pnpm test -- --run`, `pnpm test:e2e`, `pnpm build`.
=======
# Hermes Operating Model — Span Buddy

Span Buddy uses a durable, repository-backed multi-agent operating system. The
repository is the control plane. Hermes profiles, managers, and developer agents
are workers that read committed state, perform bounded work, and produce
evidence.

## Goal

Build a restartable Product, Engineering, UI, Verification, and R&D organization
that can resume from committed state without depending on chat memory.

## Source of truth order

1. Git history and remote refs
2. `.hermes/current_state.json`
3. `.hermes/tickets.yaml`
4. `.hermes/lanes.yaml`
5. `.hermes/events.jsonl`
6. `docs/hermes/*` doctrine and runbooks
7. Run logs under `.hermes/runs/`
8. Hermes profile/session memory as forensic context only

## Lanes

- Product Manager: roadmap, backlog, priorities, ticket promotion, final scope.
- Team 1 — Core / Engine: calculation logic, deterministic behavior, schema,
  result contracts, engine correctness.
- Team 2 — Product / UI: user flow, forms, display, mobile usability,
  accessibility, safe wording.
- Team 3 — Verification / Safety: tests, lint, build, security, liability
  wording, baseline checks, independent verification.
- Team 4 — R&D: research spikes, source mapping, feasibility notes, candidate
  ticket creation. R&D does not directly mutate production scope until Product
  Manager promotion.

## Restart rule

On reboot, reconcile written state against disk and git evidence before running
or claiming anything. Launch only eligible lanes and never duplicate an active
lock or run.
>>>>>>> origin/hermes-control-plane-foundation
