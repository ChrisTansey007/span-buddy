
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

Updated: 2026-05-05T21:47:23Z
Profile evidence: `span-buddy-product-manager` returned `PM_KICKOFF_DECISION_CONFIRMED` in session `20260505_174642_2f8a9b`.

### PM kickoff decision

- PM owns the research → build process and promotion gates.
- Team 3 Verification/Safety baseline is the next lane to launch.
- Team 4 R&D IRC source-map research is the next lane to launch after/alongside baseline setup.
- Team 1 Core/Engine remains planned until baseline/research dependencies are clear.
- Team 2 Product/UI remains planned until the engine contract exists or PM explicitly scopes UI-only work.

### Startup checks recorded on governance branch

- `pnpm hermes:validate`: passed.
- `pnpm hermes:test`: passed, 4/4 node test subtests.
- line-start conflict-marker scan: no actual `<<<<<<<`, `=======`, or `>>>>>>>` marker lines remain in `docs` or `.hermes`.
- `pnpm hermes:resume`: lane board shows PM, Team 3, and Team 4 ready; Team 1 planned; Team 2 planned/blocked on dependency.

### Next PM-managed actions

1. Launch `SB-T3-001` on `hermes/team3/SB-T3-001-verification` for baseline verification and remaining app-check failures.
2. Launch `SB-T4-001` on `hermes/team4/SB-T4-001-rd-map` for IRC 2021 source map and candidate-ticket feed.
3. Keep Team 1 and Team 2 out of active implementation until PM promotes bounded tickets with Team 3 verification criteria.

## PM Launch Evidence — 2026-05-05T21:54:17Z

Following the PM kickoff decision, the next lanes were launched with process evidence:

| Lane | Ticket | Profile | Branch | Worktree | Process evidence |
|---|---|---|---|---|---|
| Team 3 Verification/Safety | SB-T3-001 | span-buddy-team3-manager | hermes/team3/SB-T3-001-verification | .hermes/worktrees/SB-T3-001 | proc_05a52f52f1d0 / PID 23992 |
| Team 4 R&D | SB-T4-001 | span-buddy-team4-manager | hermes/team4/SB-T4-001-rd-map | .hermes/worktrees/SB-T4-001 | proc_5a22af7fa99a / PID 24148 |

These are active only while the listed processes are running. Completion still requires commits, pushed refs, and verification output.

## PM Relaunch Evidence — 2026-05-05T21:56:57Z

Initial Team 3/Team 4 process attempts exited with NVIDIA HTTP 404 because their profiles used the OpenRouter-style `:free` model suffix under provider `nvidia`. The profiles were corrected to `nvidia/nemotron-3-super-120b-a12b` and relaunched.

| Lane | Ticket | Profile | Branch | Worktree | Process evidence |
|---|---|---|---|---|---|
| Team 3 Verification/Safety | SB-T3-001 | span-buddy-team3-manager | hermes/team3/SB-T3-001-verification | .hermes/worktrees/SB-T3-001 | proc_b10511fc1bbd / PID 24483 |
| Team 4 R&D | SB-T4-001 | span-buddy-team4-manager | hermes/team4/SB-T4-001-rd-map | .hermes/worktrees/SB-T4-001 | proc_a896c00032b3 / PID 24638 |

These are active only while the listed processes are running. Completion still requires commits, pushed refs, and verification output.

## PM Active Launch Evidence — 2026-05-05T21:58:40Z

A second relaunch failed because Team 3/4 profiles did not have NVIDIA credentials in their isolated profile envs. To avoid copying secrets into additional profile files, the PM launch used the default Hermes runtime environment for these process launches only.

| Lane | Ticket | Profile | Branch | Worktree | Process evidence |
|---|---|---|---|---|---|
| Team 3 Verification/Safety | SB-T3-001 | span-buddy-team3-manager | hermes/team3/SB-T3-001-verification | .hermes/worktrees/SB-T3-001 | proc_e34fc1f06d8b / PID 24931 |
| Team 4 R&D | SB-T4-001 | span-buddy-team4-manager | hermes/team4/SB-T4-001-rd-map | .hermes/worktrees/SB-T4-001 | proc_1cce5877d576 / PID 25086 |

Both processes were still running after initial 20-second waits. Completion still requires commits, pushed refs, and verification output.
