
# Ticket Generation Policy

Generated: 2026-05-05
Owner: Product Manager

## Purpose

This policy makes the Product Manager, not the director/orchestrator, accountable for turning research into buildable work. Team 4 may discover and recommend; the Product Manager decides whether a finding becomes a build ticket.

## Product Manager Duties

On every PM loop:

1. Read the current board:
   - `.hermes/current_state.json`
   - `.hermes/tickets.yaml`
   - `.hermes/lanes.yaml`
   - `docs/hermes/status-board.md`
   - `docs/hermes/problem-register.md`
2. Review research intake:
   - `docs/hermes/rd-research-log.md`
   - `docs/hermes/research/source-map-irc-2021.md` when present
   - candidate tickets under `docs/hermes/tickets/SB-RD-CAND-*.md`
3. Decide for each candidate: `promote`, `hold`, or `reject`.
4. Promote only bounded, safe, verifiable work to `ready`.
5. Keep `docs/hermes/ticket-backlog.md` ordered into Now / Next / Later / Candidate.
6. Keep `docs/hermes/status-board.md` current with evidence, not optimism.
7. Require Team 3 verification before integration of code or user-visible behavior.
8. Never allow code changes without a ticket packet and sign-off path.

## Team 4 R&D Duties

Every R&D result must include a section titled `Candidate Tickets`.

Candidate tickets must include:

- product value
- source/evidence
- implementation scope
- risk/liability implications
- suggested owner team
- dependencies
- required verification
- recommendation: `promote`, `hold`, or `reject`

R&D may prototype in isolated branches only. Product Manager approval is required before production integration.

## Promotion Rules

A candidate becomes `ready` only when:

1. It has a bounded scope and allowed file list.
2. It preserves PE-review and disclaimer constraints.
3. It identifies required tests/verification.
4. It names manager/profile ownership.
5. It names branch and worktree.
6. It has no unresolved P0 blocker.
7. It does not require agents to invent or silently transcribe IRC span values.

## Completion Rules

A ticket is complete only with:

1. developer result artifact or equivalent diff summary,
2. manager review artifact,
3. Team 3 verification when code or release behavior changed,
4. local commit hash,
5. pushed remote ref verified by `git ls-remote`, and
6. status-board / event-log update.

Planning docs, profile existence, and cron jobs are not delivery evidence.
