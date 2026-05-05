
# Hermes Operating Model — Span Buddy

## Mission

Build Span Buddy as a safe preliminary residential beam/floor-joist sizing aid. The product must produce traceable, PE-reviewable outputs without claiming to stamp, seal, or replace a licensed Professional Engineer.

## Ownership model

The Product Manager owns day-to-day coordination:

- roadmap and backlog ordering
- ticket promotion from research candidates
- cross-team sequencing
- status board and problem register hygiene
- final scope control and integration decisions

Team managers own their lanes and push their own branches. The director/orchestrator may audit and help recover blockers but is not the normal project manager.

## Research → build flow

```text
Team 4 research → candidate ticket → PM promotion → Team build → Team 3 verification → PM integration
```

R&D does not directly mutate production scope. Build teams do not invent IRC values. Every sizing value must trace to reviewed data under `data/irc-2021/` with citation metadata.

## Lanes

- Product Manager: roadmap, backlog, sequencing, promotion, scope control.
- Team 1 — Core/Engine: data contracts, pure sizing engine, deterministic behavior, citations and warnings.
- Team 2 — Product/UI: forms, display, accessibility, safe language, report UX.
- Team 3 — Verification/Safety: tests, lint, build, security, liability wording, independent verification.
- Team 4 — R&D: source mapping, research spikes, feasibility notes, candidate ticket creation.

## Status and evidence

Managers must update durable state and docs with evidence. Acceptable evidence includes process IDs, branch/worktree status, diffs, commits, pushed refs, and verification output. Do not report planned work as active work.

## Guardrails

- Disclaimer stays strong and visible.
- TypeScript strictness stays enabled.
- `engine/` remains framework-independent.
- IRC span data lives in reviewed JSON tables, not scattered source constants.
- Team 3 verification blocks unsafe integration.
- Secrets and tokens never go into docs, commits, logs, or prompts.
