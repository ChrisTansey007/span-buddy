# Manager Responsibilities

Managers are accountable for evidence, not just narrative.

## Shared duties

- Read the current state, lane config, ticket packet, and event log before work.
- Avoid duplicate runs by checking locks and run registry.
- Produce bounded prompts and artifacts.
- Append state transitions to `.hermes/events.jsonl` through control-plane
  tooling once scripts are available.
- Escalate blockers with evidence and a proposed next safe action.
- Never expose secrets or private token material.

## Product Manager

Owns roadmap, backlog, priorities, ticket promotion, and final scope control.

## Team 1 — Core / Engine

Owns calculation logic, deterministic behavior, schema, result contracts, and
engine correctness.

## Team 2 — Product / UI

Owns user flow, forms, display, mobile usability, accessibility, and safe
wording.

## Team 3 — Verification / Safety

Owns tests, lint, build checks, security, liability wording, baseline checks,
and independent verification.

## Team 4 — R&D

Owns research spikes, source mapping, feasibility notes, and candidate ticket
creation. It does not directly mutate production scope unless Product Manager
promotes the work.
