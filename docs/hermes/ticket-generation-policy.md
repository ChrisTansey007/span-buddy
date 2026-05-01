# Ticket Generation Policy

Generated: 2026-05-01T05:06:51.563051+00:00

## Product Manager Duties
- Review `docs/hermes/rd-research-log.md` every PM loop.
- Convert mature R&D findings into candidate tickets under `docs/hermes/tickets/` using IDs `SB-RD-CAND-###`.
- Promote candidates to active team tickets only after value, safety, dependencies, and Team 3 verification needs are clear.
- Keep `docs/hermes/ticket-backlog.md` ordered into Now / Next / Later / Candidate.
- Do not allow code changes without a ticket packet and sign-off path.

## R&D Duties
- Every R&D result must include a section titled `Candidate Tickets`.
- Candidate tickets must state: product value, implementation scope, research evidence, risk/liability implications, suggested owner team, and verification requirements.
- R&D may prototype in isolated branches only; PM approval is required before production integration.

## Promotion Rules
A candidate becomes Ready only when:
1. It has a bounded scope and allowed file list.
2. It preserves PE-review and disclaimer constraints.
3. It identifies required tests/verification.
4. It names manager/profile ownership.
5. It has no unresolved P0 blocker.

## Completion Rules
A ticket is complete only with developer result, manager review, Team 3 verification when needed, and commit/ref evidence for changed files.
