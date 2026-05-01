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
