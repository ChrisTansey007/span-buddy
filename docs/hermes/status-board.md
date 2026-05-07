
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
| SB-PM-001 | Product Manager | Product Manager | hermes/product/SB-PM-001-governance | produced_artifact | ticket_exists, governance_docs, pm_cron_monitor_2026-05-07T08:35:33Z |
| SB-T3-001 | Team 3 | Team 3 Manager | hermes/team3/SB-T3-001-verification | blocked | process_not_running_pid_44778, process_session_not_found_proc_ad352a7110eb, no_new_branch_local_commit_2026-05-07T08:35:33Z, remote_ref_6af8948 |
| SB-T4-001 | Team 4 | Team 4 R&D Manager | hermes/team4/SB-T4-001-rd-map | blocked | process_not_running_pid_44937, process_session_not_found_proc_ae898c053300, no_new_branch_local_commit_2026-05-07T08:35:33Z, remote_ref_6af8948 |
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

## Profile NVIDIA Direct Config Fix — 2026-05-06T02:20:13Z

The Span Buddy profiles are now configured to use direct NVIDIA, not OpenRouter:

| Profile | Provider | Model | Fallback providers | NVIDIA key in profile env | Verification |
|---|---|---|---|---|---|
| span-buddy-product-manager | nvidia | nvidia/nemotron-3-super-120b-a12b | [] | present | `NVIDIA_DIRECT_OK_span-buddy-product-manager` |
| span-buddy-team1-manager | nvidia | nvidia/nemotron-3-super-120b-a12b | [] | present | `NVIDIA_DIRECT_OK_span-buddy-team1-manager` |
| span-buddy-team2-manager | nvidia | nvidia/nemotron-3-super-120b-a12b | [] | present | `NVIDIA_DIRECT_OK_span-buddy-team2-manager` |
| span-buddy-team3-manager | nvidia | nvidia/nemotron-3-super-120b-a12b | [] | present | `NVIDIA_DIRECT_OK_span-buddy-team3-manager` |
| span-buddy-team4-manager | nvidia | nvidia/nemotron-3-super-120b-a12b | [] | present | `NVIDIA_DIRECT_OK_span-buddy-team4-manager` |

The `:free` suffix and OpenRouter fallback providers were removed from these profile configs. `terminal.cwd` was set to each profile's intended Span Buddy worktree to prevent the previous wrong-path/read-only-worktree failure mode.

Previous Team 3/Team 4 launches are not counted as completed work: Team 3 produced no branch commit; Team 4 reported a filesystem/path blocker and produced no branch commit. Team branches remain at `edc18f763acc59aa0f386ce21a9df831901ed3ba` until relaunched work produces pushed artifacts.

## Direct-NVIDIA Relaunch Evidence — 2026-05-06T02:37:43Z

After fixing profile-local NVIDIA credentials/configs and `terminal.cwd`, Team 3 and Team 4 were relaunched without sourcing the default environment and without OpenRouter fallback.

| Lane | Ticket | Profile | Branch | Worktree | Process evidence |
|---|---|---|---|---|---|
| Team 3 Verification/Safety | SB-T3-001 | span-buddy-team3-manager | hermes/team3/SB-T3-001-verification | .hermes/worktrees/SB-T3-001 | proc_ad352a7110eb / PID 44778 |
| Team 4 R&D | SB-T4-001 | span-buddy-team4-manager | hermes/team4/SB-T4-001-rd-map | .hermes/worktrees/SB-T4-001 | proc_ae898c053300 / PID 44937 |

Initial 20-second waits timed out with both processes still running, which is expected for real work. Completion still requires team branch commits, pushed refs, and verification output.

## Process Health Check — 2026-05-06T04:15:09Z

Evidence check after direct-NVIDIA relaunch:

| Lane | Prior process | Result | Accepted completion? | Evidence |
|---|---|---|---|---|
| Team 3 Verification/Safety | proc_ad352a7110eb / PID 44778 | exited | No | remote ref still `6af8948e94d814e49d321c15c67a142626031db0`; no branch-local artifact commit found; process reported push auth failure and partial verification failures |
| Team 4 R&D | proc_ae898c053300 / PID 44937 | exited | No | remote ref still `6af8948e94d814e49d321c15c67a142626031db0`; no expected source-map artifacts present on tracked team branch; process reported wrong/minimal repo context |

PM branch remains the only successfully pushed/verified governance artifact at this check. Do not claim Team 3 or Team 4 completion until a clean relaunch produces branch-local commits, pushed refs, and verification output.

Additional reliability issue: older Span Buddy cron jobs still exist with OpenRouter `:free` model settings and stale workdirs. They should be reconciled, updated to direct NVIDIA, or paused before trusting autonomous loops.

## PM Monitor Recheck — 2026-05-07T02:32:43Z

Direct-NVIDIA Team 3/4 process and ref evidence was rechecked from the PM governance worktree.

| Lane | Process evidence | Process state | Branch/worktree/ref evidence | Accepted completion? | Blocker |
|---|---|---|---|---|---|
| Team 3 Verification/Safety | `proc_ad352a7110eb` / PID `44778` | not running (`ps -p 44778` returned no process) | worktree `.hermes/worktrees/SB-T3-001` on `hermes/team3/SB-T3-001-verification`; local HEAD and remote ref both `6af8948e94d814e49d321c15c67a142626031db0`; no branch-local artifact commit | No | Prior Team 3 final reported commit `553d120`, but that commit is not present in repository refs; push failed because git could not read HTTPS credentials; unit/build verification was not green. |
| Team 4 R&D | `proc_ae898c053300` / PID `44937` | not running (`ps -p 44937` returned no process) | worktree `.hermes/worktrees/SB-T4-001` on `hermes/team4/SB-T4-001-rd-map`; local HEAD and remote ref both `6af8948e94d814e49d321c15c67a142626031db0`; no branch-local artifact commit | No | Prior Team 4 summary reported wrong/minimal repo context and no accepted tracked source-map artifacts. |

Profile config evidence for Team 3 and Team 4: `model.provider` is `nvidia`, `model.model` is `nvidia/nemotron-3-super-120b-a12b`, `fallback_providers` is empty, and no `:free` suffix/OpenRouter fallback is configured. Completion remains blocked until clean relaunch work produces actual commits, pushed refs, and verification output.


## PM Cron Monitor Recheck — 2026-05-07T03:59:29Z

Direct-NVIDIA Team 3/4 process and ref evidence was rechecked from the PM governance worktree.

| Lane | Process evidence | Process state | Branch/worktree/ref evidence | Accepted completion? | Blocker |
|---|---|---|---|---|---|
| Team 3 Verification/Safety | `proc_ad352a7110eb` / PID `44778` | not running (`process.poll` returned `not_found`; `ps -p 44778` returned no process) | worktree `/home/theca/work/span-buddy/.hermes/worktrees/SB-T3-001` on `hermes/team3/SB-T3-001-verification`; local HEAD and remote ref both `6af8948e94d814e49d321c15c67a142626031db0`; no branch-local artifact commit | No | Prior Team 3 final reported commit `553d120`, but that commit is not present in repository refs; push failed because git could not read HTTPS credentials; unit tests and build were not green. |
| Team 4 R&D | `proc_ae898c053300` / PID `44937` | not running (`process.poll` returned `not_found`; `ps -p 44937` returned no process) | worktree `/home/theca/work/span-buddy/.hermes/worktrees/SB-T4-001` on `hermes/team4/SB-T4-001-rd-map`; local HEAD and remote ref both `6af8948e94d814e49d321c15c67a142626031db0`; no branch-local artifact commit | No | Prior Team 4 summary reported wrong/minimal repo context and no accepted tracked source-map artifacts. |

Profile config evidence for Team 3 and Team 4: `model.provider` is `nvidia`, `model.model` is `nvidia/nemotron-3-super-120b-a12b`, `model.fallback_providers` is empty, no `:free` suffix is present, and no OpenRouter fallback is configured. PM branch remote ref before this update was `efd2d4aad08075d2770fd09760dd6482e34d8bd0`. Completion remains blocked until clean recovery work produces actual commits, pushed refs, and verification output.

## PM Cron Monitor Recheck — 2026-05-07T08:35:33Z

Direct-NVIDIA Team 3/4 process and ref evidence was rechecked again from the PM governance worktree.

| Lane | Process evidence | Process state | Branch/worktree/ref evidence | Accepted completion? | Blocker |
|---|---|---|---|---|---|
| Team 3 Verification/Safety | `proc_ad352a7110eb` / PID `44778` | not running (`process.poll` returned `not_found`; `ps -p 44778` returned no process) | worktree `/home/theca/work/span-buddy/.hermes/worktrees/SB-T3-001` on `hermes/team3/SB-T3-001-verification`; local HEAD and remote ref both `6af8948e94d814e49d321c15c67a142626031db0`; no branch-local artifact commit | No | Prior Team 3 final reported commit `553d120`, but that commit is not present in repository refs; push failed because git could not read HTTPS credentials; unit tests and build were not green. |
| Team 4 R&D | `proc_ae898c053300` / PID `44937` | not running (`process.poll` returned `not_found`; `ps -p 44937` returned no process) | worktree `/home/theca/work/span-buddy/.hermes/worktrees/SB-T4-001` on `hermes/team4/SB-T4-001-rd-map`; local HEAD and remote ref both `6af8948e94d814e49d321c15c67a142626031db0`; no branch-local artifact commit | No | Prior Team 4 summary reported wrong/minimal repo context and no accepted tracked source-map artifacts. |

Profile config evidence for Team 3 and Team 4 remains valid: `model.provider` is `nvidia`, `model.model` is `nvidia/nemotron-3-super-120b-a12b`, `model.fallback_providers` is empty, no `:free` suffix is present, and no OpenRouter fallback is configured. PM branch remote ref before this update was `4e7298c4cf726ee5723d089e6b96d19c04d0822a`. Completion remains blocked until clean recovery work produces actual commits, pushed refs, and verification output.
