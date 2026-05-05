
# Status Board

## Current State

- Setup status: PM-owned research → build governance branch prepared.
- Delivery status: code delivery is not complete until branch/ref and verification evidence exists.
- Current priority: stabilize control-plane docs, launch PM governance, then launch Team 3 baseline and Team 4 research-map work.

## PM-Owned Startup Sequence

| Order | Ticket | Lane | Desired State | Why |
|---:|---|---|---|---|
| 1 | SB-PM-001 | Product Manager | ready | PM owns backlog, promotion, kickoff, and status evidence. |
| 2 | SB-T3-001 | Team 3 Verification/Safety | ready | Baseline verification and conflict-marker cleanup unblock safe work. |
| 3 | SB-T4-001 | Team 4 R&D | ready | Source-map research feeds candidate tickets. |
| 4 | SB-T1-001 | Team 1 Core/Engine | planned | Starts after PM/Team 3/Team 4 setup or explicit PM promotion. |
| 5 | SB-T2-001 | Team 2 Product/UI | planned | UI work waits for verified engine contracts unless PM scopes UI-only work. |

## Manager Cadence

| Role | Profile | Cadence | Status Evidence |
|---|---|---:|---|
| Product Manager | span-buddy-product-manager | every 3m when scheduled | requires process/run/ref evidence |
| Team 1 Manager | span-buddy-team1-manager | on PM promotion | planned |
| Team 2 Manager | span-buddy-team2-manager | on PM promotion | planned |
| Team 3 Manager | span-buddy-team3-manager | kickoff after PM | ready |
| Team 4 Manager | span-buddy-team4-manager | kickoff after PM | ready |

## Active Tickets

| Ticket | Team | Owner | Branch | Status | Evidence |
|---|---|---|---|---|---|
| SB-PM-001 | Product Manager | Product Manager | hermes/product/SB-PM-001-governance | ready | ticket_exists, governance_docs |
| SB-T3-001 | Team 3 | Team 3 Manager | hermes/team3/SB-T3-001-verification | ready | ticket_exists, needed_for_baseline |
| SB-T4-001 | Team 4 | Team 4 R&D Manager | hermes/team4/SB-T4-001-rd-map | ready | ticket_exists, needed_for_research_intake |
| SB-T1-001 | Team 1 | Team 1 Manager | hermes/team1/SB-T1-001-engine-contracts | planned | waits_for_pm_sequence |
| SB-T2-001 | Team 2 | Team 2 Manager | hermes/team2/SB-T2-001-ui-flow | planned | waits_for_engine_contract_or_pm_ui_scope |

## Blockers

See `docs/hermes/problem-register.md`.

Known current blockers before product feature work:

- `main` has missing engine imports in `app/calculator/page.tsx` until engine/data branch is reconciled.
- Full app typecheck/build are not expected to pass until engine modules are restored or UI is decoupled.

## Last Product Manager Summary

PM kickoff pending. PM must update this section after first run with concrete evidence.
