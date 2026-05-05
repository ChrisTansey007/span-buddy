# Span Buddy Research → Build Action Plan

Generated: 2026-05-05
Repo inspected: `ChrisTansey007/span-buddy`
Branch for this plan: `hermes/action-plan-research-build-20260505`

## Executive summary

Span Buddy has the right durable-control-plane scaffolding for a research-then-build process, but the current `main` branch is not ready for autonomous build waves yet. The immediate priority is to stabilize the repo and reconcile existing branch work, then run Team 4 as a research intake lane feeding Product Manager ticket promotion, then let Team 1/2 build only promoted, bounded tickets while Team 3 verifies each artifact before integration.

The process should be:

```text
Research spike → source map / feasibility note → candidate ticket → PM promotion → Team build → Team 3 verification → integration PR → main
```

Do not let R&D directly change production code. Do not let build teams invent IRC values. Every sizing number must trace to committed `data/irc-2021/*` JSON with citation metadata.

## Current repo facts from inspection

### Good foundation already present

- Next.js 14 / TypeScript strict app scaffold exists.
- Durable Hermes control-plane scripts exist:
  - `pnpm hermes:validate`
  - `pnpm hermes:reconcile`
  - `pnpm hermes:resume`
  - `pnpm hermes:test`
- Five durable lanes are defined in `.hermes/lanes.yaml`:
  - `product_manager`
  - `team1_core_engine`
  - `team2_product_ui`
  - `team3_verification_safety`
  - `team4_rd`
- Ticket state exists in `.hermes/tickets.yaml` with initial wave tickets:
  - `SB-PM-001`
  - `SB-T1-001`
  - `SB-T2-001`
  - `SB-T3-001`
  - `SB-T4-001`
- Remote branch `origin/feature/joist-span-v1` contains useful engine/data work not present on `main`, including:
  - `data/irc-2021/R502.3.1(1).json`
  - `data/irc-2021/R502.3.1(2).json`
  - `data/irc-2021/R502.5(1).json`
  - `engine/sizeFloorJoist.ts`
  - `engine/sizeHeader.ts`
  - related tests

### Blockers on current `main`

1. **Committed merge-conflict markers exist in docs.** Found in:
   - `docs/hermes/operating-model.md`
   - `docs/hermes/proof-and-gates.md`
   - `docs/hermes/rd-research-log.md`
   - `docs/hermes/ticket-generation-policy.md`
   - `docs/hermes/tickets/SB-PM-001.md`
   - `docs/hermes/tickets/SB-T1-001.md`
   - `docs/hermes/tickets/SB-T2-001.md`
   - `docs/hermes/tickets/SB-T3-001.md`
   - `docs/hermes/tickets/SB-T4-001.md`

2. **`app/calculator/page.tsx` imports missing engine modules on `main`:**
   - `@/engine/sizeFloorJoist`
   - `@/engine/sizeFloorJoist40psf`
   - `@/engine/sizeHeader`

3. **`data/irc-2021/` is empty on `main`.** The repo rule says IRC table data must live under `data/irc-2021/` with citations; the useful data appears to be only on `origin/feature/joist-span-v1`.

4. **Verification is not green on `main`:**
   - `pnpm hermes:validate` passes.
   - `pnpm hermes:resume` works and shows only Team 2 `ready`; others remain `planned`.
   - `pnpm typecheck` fails because engine modules are missing.
   - `pnpm lint` passes.
   - `pnpm test -- --run` fails in current shell because `NODE_ENV=production` makes React testing-library use a production React build; it also fails `tsconfig.strict.test.ts` with `join is not a function`.

5. **Control-plane state overstates little; that is good.** `.hermes/current_state.json` marks most lanes `planned` and Team 2 `ready`, not running. Keep this conservative evidence standard.

## Non-negotiable gates

Every work item must preserve these repo rules:

1. Do not weaken `components/ui/DisclaimerBanner.tsx` or protected disclaimer semantics.
2. Keep TypeScript strictness: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`.
3. Keep `engine/` pure TypeScript: no React, Next, browser APIs, or I/O.
4. No hand-transcribed span numbers in source code. Table values live in `data/irc-2021/` JSON with citation metadata.
5. Verification gate before merge:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test -- --run
   pnpm test:e2e
   pnpm build
   ```

## Phase 0 — Stabilize before launching teams

Goal: make `main` safe enough that agents can build without compounding repo drift.

### Task 0.1 — Resolve committed conflict markers

Owner: Team 3, with PM review for doctrine wording.

Steps:

1. Create branch:
   ```bash
   git checkout main
   git pull --ff-only
   git checkout -B hermes/stabilize-conflict-markers
   ```
2. Resolve all `<<<<<<<`, `=======`, `>>>>>>>` markers in docs listed above.
3. Prefer the durable-control-plane wording when it is more precise, but preserve any useful HEAD sections that mention delivery evidence and integration gates.
4. Verify:
   ```bash
   grep -RIn '<<<<<<<\|=======\|>>>>>>>' -- docs .hermes ':!node_modules' || true
   pnpm hermes:validate
   pnpm hermes:test
   ```
5. Commit and push:
   ```bash
   git add docs/hermes
   git commit -m "docs: resolve Hermes control-plane conflict markers"
   git push -u origin hermes/stabilize-conflict-markers
   ```

Exit criteria: zero conflict markers; control-plane scripts pass; PR opened or branch ready for merge.

### Task 0.2 — Fix baseline test environment

Owner: Team 3.

Observed issue: `pnpm test -- --run` used production React because the shell had `NODE_ENV=production`. Also `tsconfig.strict.test.ts` has a `join is not a function` bug.

Steps:

1. Inspect `vitest.config.ts`, `vitest.setup.ts`, and `tsconfig.strict.test.ts`.
2. Make tests robust against inherited shell `NODE_ENV` by setting test environment explicitly where appropriate.
3. Fix `tsconfig.strict.test.ts` import/path bug.
4. Verify:
   ```bash
   NODE_ENV=development pnpm test -- --run
   NODE_ENV=production pnpm test -- --run
   pnpm typecheck || true  # still expected to fail until Task 0.3
   ```
5. Commit and push on `hermes/team3/SB-T3-001-verification` or a stabilization branch.

Exit criteria: unit tests are green independent of shell `NODE_ENV`, except failures caused by intentionally missing engine modules are isolated to typecheck/build.

### Task 0.3 — Reconcile engine/data branch into an integration branch

Owner: Team 1 + Team 3.

The remote `origin/feature/joist-span-v1` appears to contain the missing engine/data work that `main` needs. Do not blindly merge to `main`; audit and import it through a verification branch.

Steps:

1. Create an audit worktree:
   ```bash
   git fetch origin
   git worktree add .hermes/worktrees/audit-joist-span-v1 origin/feature/joist-span-v1
   ```
2. Audit files:
   ```bash
   git -C .hermes/worktrees/audit-joist-span-v1 ls-tree -r --name-only HEAD | grep -E '^(engine|data/irc-2021|app/calculator|components/ui)'
   ```
3. Check engine purity:
   ```bash
   grep -RIn "from ['\"]next\|from ['\"]react\|window\|document" .hermes/worktrees/audit-joist-span-v1/engine || true
   ```
4. Verify data citation metadata exists in every `data/irc-2021/*.json` file.
5. Create integration branch from stabilized `main`:
   ```bash
   git checkout main
   git pull --ff-only
   git checkout -B hermes/integrate-joist-span-v1
   git checkout origin/feature/joist-span-v1 -- engine data/irc-2021
   ```
6. Add or adapt `sizeFloorJoist40psf.ts` if the UI still expects it, or refactor the UI to call a single typed `sizeFloorJoist()` contract.
7. Verify:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test -- --run
   pnpm build
   ```
8. Push branch and create PR.

Exit criteria: `main` or an integration PR has engine modules, data tables, citations, and passing lint/typecheck/unit/build.

## Phase 1 — Put research intake in motion

Goal: turn Team 4 from vague R&D into a controlled source-mapping and candidate-ticket generator.

### Team 4 ticket: SB-T4-001 — Source map and research queue

Branch/worktree:

```text
branch: hermes/team4/SB-T4-001-rd-map
worktree: .hermes/worktrees/SB-T4-001
```

Deliverables:

1. Replace conflicted `docs/hermes/rd-research-log.md` with a structured log containing:
   - source title
   - jurisdiction/edition
   - relevant IRC section/table
   - licensing/access note
   - extraction confidence
   - candidate ticket IDs
2. Create `docs/hermes/research/source-map-irc-2021.md` with a prioritized source map:
   - R502.3.1(1) floor joist spans — 30 psf live load
   - R502.3.1(2) floor joist spans — 40 psf live load
   - R502.5(1) girders/headers — exterior bearing walls
   - R602.7(1)/(2) headers/girders — interior/exterior bearing walls
   - R507 deck joists — defer unless PM promotes
   - R802 rafters/ceiling joists — stretch/defer
3. Create candidate ticket stubs under `docs/hermes/tickets/` only as `candidate` or `planned`, not `ready`, until PM promotion.
4. Explicitly mark any data that requires human transcription or review. Agents should not invent or silently transcribe span values.

Verification:

```bash
pnpm hermes:validate
pnpm hermes:test
grep -RIn '<<<<<<<\|=======\|>>>>>>>' docs/hermes || true
```

Exit criteria: Team 4 produces research artifacts and candidate tickets, not production code.

## Phase 2 — Product Manager promotion gate

Goal: PM decides which research outputs become build tickets.

PM responsibilities:

1. Review Team 4 source map and candidate tickets.
2. Promote only tickets with:
   - clear user value
   - bounded file scope
   - acceptance criteria
   - verification commands
   - citation requirements
   - safety/disclaimer constraints
3. Update:
   - `.hermes/tickets.yaml`
   - `docs/hermes/ticket-backlog.md`
   - `docs/hermes/status-board.md`
   - `.hermes/events.jsonl`
4. Move promoted tickets from `planned` to `ready` only after branch/worktree fields are set.

Recommended first promoted tickets:

1. `SB-T1-002`: Normalize engine result contract and shared types.
2. `SB-T1-003`: Import/review IRC 2021 floor joist table JSON with citation metadata.
3. `SB-T1-004`: Implement `sizeFloorJoist()` against JSON data with golden tests.
4. `SB-T2-002`: Connect UI to typed engine contract without `any` or unsupported claims.
5. `SB-T3-002`: Add guardrail tests for engine purity, citation metadata, and disclaimer visibility.

## Phase 3 — Build lanes in dependency order

Do not launch all teams to modify code at once. Use dependency order:

```text
Team 3 baseline → Team 4 source map → PM promotion → Team 1 engine/data → Team 2 UI → Team 3 verification → PM integration
```

### Team 1 — Core engine/data

First build objectives:

1. Create `engine/types.ts`:
   - `EngineResult<T>`
   - `Citation`
   - `Assumption`
   - `Warning`
   - `JoistInput`
   - `JoistSpec`
   - `HeaderInput`
   - `HeaderSpec`
2. Create `data/irc-2021/*` JSON schema or Zod parser.
3. Port/import only reviewed table data from `feature/joist-span-v1`.
4. Implement pure lookup functions that return results with assumptions/citations/warnings.
5. Add golden tests from known examples.

Hard rule: if a table value is not in reviewed JSON, return an unsupported/needs-engineering warning rather than guessing.

### Team 2 — UI/product

First build objectives:

1. Add `"use client"` to interactive calculator pages/components where required by Next.js.
2. Remove `any` from `app/calculator/page.tsx` and use the Team 1 result contract.
3. Keep all result language preliminary and PE-review-oriented.
4. Display citations, assumptions, warnings, and unsupported-case messages prominently.
5. Add component tests for form validation and result rendering.

Team 2 should not create sizing formulas or table values. It only renders Team 1 outputs.

### Team 3 — Verification/safety

First build objectives:

1. Maintain the baseline verification report in `docs/hermes/test-results.md`.
2. Add tests that fail if:
   - disclaimer text or required semantic claims are weakened
   - `engine/` imports React/Next/browser APIs
   - `data/irc-2021/*.json` lacks citation metadata
   - `tsconfig.json` loses strict guardrails
3. Verify each team branch before PM integration.
4. Record explicit pass/fail evidence, not just prose claims.

## Phase 4 — Agent launch procedure

Only launch a lane when its ticket state is `ready` and no lock exists.

Recommended launch preparation:

```bash
cd /home/theca/work/span-buddy
pnpm hermes:resume
pnpm hermes:validate
pnpm hermes:test
```

Create or refresh a worktree for the lane:

```bash
git fetch origin
git worktree add .hermes/worktrees/SB-T4-001 -b hermes/team4/SB-T4-001-rd-map main
```

Launch the profile in that worktree only after recording the lock/run evidence. Example:

```bash
cd /home/theca/work/span-buddy/.hermes/worktrees/SB-T4-001
hermes --profile span-buddy-team4-manager --worktree chat -q "Work only on SB-T4-001. Produce research artifacts and candidate tickets. Do not edit production code. End with pushed branch/ref evidence and verification command output."
```

Evidence required before reporting a lane as active:

- process ID or completed run log
- branch/worktree evidence
- diff/commit evidence
- pushed ref if work is complete
- verification output

## Recommended first wave

### Wave A — Stabilization

1. Team 3 resolves conflict markers.
2. Team 3 fixes baseline test environment.
3. Team 1/3 audits `feature/joist-span-v1` and prepares an integration branch.
4. PM updates tickets and status board after stabilization.

### Wave B — Research intake

1. Team 4 executes `SB-T4-001` source map.
2. PM promotes only bounded candidate tickets.
3. Team 3 validates that source-map artifacts do not contain invented span values.

### Wave C — Build MVP engine path

1. Team 1 defines result contracts and imports reviewed table data.
2. Team 1 implements `sizeFloorJoist()` with citations/warnings.
3. Team 2 connects calculator UI to the typed engine result.
4. Team 3 verifies lint/typecheck/unit/build/e2e and guardrails.
5. PM integrates verified branches to `main`.

## Immediate command checklist

Run these before launching any team:

```bash
cd /home/theca/work/span-buddy
git checkout main
git pull --ff-only
grep -RIn '<<<<<<<\|=======\|>>>>>>>' -- docs .hermes || true
pnpm hermes:resume
pnpm hermes:validate
pnpm hermes:test
pnpm lint
pnpm typecheck || true
pnpm test -- --run || true
```

Expected today:

- conflict marker grep returns the listed docs until Task 0.1 is done
- `hermes:validate` passes
- `typecheck` fails on missing engine modules until Task 0.3 is done
- unit tests need Team 3 cleanup from Task 0.2

## Success definition

The research-then-build process is operational when:

1. `main` has zero conflict markers.
2. `main` has green lint/typecheck/unit/build.
3. Team 4 has a committed source map and candidate-ticket feed.
4. PM has promoted at least one candidate ticket to `ready` with branch/worktree scope.
5. Team 1 has built a cited engine slice from reviewed JSON data.
6. Team 2 renders that engine slice without unsupported structural claims.
7. Team 3 has verified the branch with captured command output.
8. PM has merged only verified work to `main`.

## Key management rule

Keep the control plane conservative. Never report a profile, team, or lane as running based only on docs, cron jobs, or profile existence. Report activity only with branch/worktree/process/commit/pushed-ref/verification evidence.
