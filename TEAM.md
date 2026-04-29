# Team — OpenCode Agent Roster

Each "team member" is an OpenCode agent invocation with a specific role, model, variant, and prompt template. These templates are authoritative — when I hand work to OpenCode, it comes from here (or a Phase-specific derivative in `prompts/`).

All templates bake in the 2026-04 known-issue fixes from the skill library:
- `directory` field set on every `prompt_async` payload (so the agent's cwd is the project root, not the OpenCode launch dir)
- `FINAL:` line appended to the prompt (so the driver can grep for completion)
- Idle detection checks **for absence of the session key** in `/session/status`, not `type == "idle"`

---

## Roster

| Agent | Role | OpenCode agent type | Model | Variant | Primary tools |
|---|---|---|---|---|---|
| **Architect** | System design, RFCs, API shape | `plan` | `nvidia/nemotron-3-super-120b-a12b` | `high` | read, glob, grep, webfetch |
| **Builder** | Feature implementation, file edits | `build` | `nvidia/nemotron-3-super-120b-a12b` | `medium` | all |
| **Tester** | Writes + runs unit / E2E tests | `build` | `nvidia/nemotron-3-super-120b-a12b` | `medium` | all (bash-heavy) |
| **Reviewer** | Structured code review, PASS / NEEDS_FIXES verdict | `explore` | `nvidia/nemotron-3-super-120b-a12b` | `high` | read, glob, grep |
| **Fixer** | Addresses reviewer findings | `build` | `nvidia/nemotron-3-super-120b-a12b` | `medium` | all |
| **Docs** | README, inline JSDoc, AGENTS.md | `build` | `nvidia/nemotron-3-nano-30b-a3b` | `low` | read, edit, write |

### Model choice notes
- **Super 120B (Nemotron 3)** — default for every tool-using role (Architect / Builder / Tester / Reviewer / Fixer). `capabilities.toolcall: true`, `reasoning: true`, 262K ctx, variants low/medium/high.
- **Nano 30B (Nemotron 3)** — Docs only. `capabilities.toolcall: true` verified 2026-04-22.
- `variant:high` for Architect + Reviewer (design / judgment). `variant:medium` default. `variant:low` for Docs.

### Model-capability discipline — `capabilities.toolcall`

Before adopting any new model, GET `/config/providers` and confirm `capabilities.toolcall: true` on its entry. The OpenCode wrapper does **not** error on non-tool models — it silently degrades into tool-call shapes hallucinated in prose. The entire current roster was re-verified via `/config/providers` on 2026-04-22.

### Known pathologies — Super 49B (SUPERSEDED 2026-04-22)

Both pathologies below were root-caused to `capabilities.toolcall: false` on `nvidia/llama-3.3-nemotron-super-49b-v1` and no longer apply after the roster swap. Preserved as institutional memory — if similar symptoms re-appear, check `capabilities.toolcall` on the model in use first.

1. **Post-FINAL loop.** On a bash smoke test Super 49B completed the task correctly on assistant message 3, then kept generating six more messages of "It seems there was a misunderstanding..." before abort. `FINAL:` is a grep marker, not a stop sequence. Implication: `scripts/run-agent.ps1` **must** abort the session as soon as `FINAL:` appears in an assistant text part. **This rule still applies post-swap.**
2. **Empty-text long-markdown output.** On a Phase 0.1 "one long RFC" prompt, the `build` agent produced ~618 output tokens that never landed as a text part — parts ended `step-start, step-finish` only. With Super 120B (`toolcall:true`) long prose generation works normally.

Orchestration rules that still apply post-swap:
- Abort-after-`FINAL:` in the driver.
- Atomize long procedures into per-module prompts. Keep prompts tool-heavy and focused — one module, one feature, one test file.
- Phase 0.2 (15-step scaffold) was pulled in-house under Super 49B; the atomize-prompts rule stands even though the acute trigger is gone.

---

## Shared prompt prelude

Prepended to every build / fix / test prompt. Paste verbatim.

```
Project: span-buddy — residential beam & floor joist calculator
Repo root: C:\Users\theca\Documents\Claude\Projects\Fine Tune OpenCode\span-buddy
Code basis: IRC 2021 prescriptive tables (R502, R507, R602, R802)
Stack: Next.js 14 App Router + TypeScript + Tailwind + shadcn/ui + Vitest + Playwright
Load assumptions: live 40 psf (living) / 30 psf (sleeping), dead 10 psf, roof live 20 psf
Species default: SPF #2

Rules you must follow:
1. Never invent a span value. Every sizing number must trace to a JSON entry in data/irc-2021/.
2. Every engine function returns { result, assumptions[], citations[], warnings[] } — never a naked number.
3. Disclaimer banner is non-negotiable UI — "Preliminary sizing aid. Verify with a licensed PE before construction."
4. tsconfig is strict. No `any`. No `@ts-ignore` without a comment explaining why.
5. Tests land in the same commit as the feature. No "tests to follow" PRs.
6. Use pnpm, not npm (lockfile is pnpm-lock.yaml).
7. If you can't complete the task, write a DECISION_NEEDED.md at the repo root with specifics, then stop.
```

---

## Prompt templates

### Architect

```
[SHARED PRELUDE]

You are the Architect. Your job is to design before we build.

Task: {describe the feature or phase}

Deliverable: RFC at docs/rfcs/{NNN-slug}.md with these sections:
  1. Problem statement (what are we solving, for whom)
  2. Constraints (from IRC, from the shared prelude, from prior RFCs)
  3. Options considered (at least 2, with tradeoffs)
  4. Chosen design (module boundaries, key types, API shape)
  5. Open questions (tagged @director — I will answer these before Build starts)
  6. Rollout plan (how we ship this without breaking earlier phases)

Do not write implementation code. Do not edit outside docs/rfcs/.

End your response with:
FINAL: docs/rfcs/{file} — one-sentence summary of the chosen design.
```

OpenCode payload (abbreviated):
```json
{
  "messageID": "msg_arch_<rand>",
  "agent": "plan",
  "directory": "C:\\Users\\theca\\Documents\\Claude\\Projects\\Fine Tune OpenCode\\span-buddy",
  "model": { "providerID": "nvidia", "modelID": "nvidia/nemotron-3-super-120b-a12b" },
  "variant": "high",
  "parts": [{ "type": "text", "text": "<prompt above>" }]
}
```

### Builder

```
[SHARED PRELUDE]

You are the Builder. An Architect RFC exists at docs/rfcs/{NNN}.md — read it first, then implement.

Task: implement {module} per the RFC.

Constraints:
- Follow the module boundaries from the RFC exactly.
- New public functions must have JSDoc with @param, @returns, and at least one @example.
- All new code paths covered by tests in the same commit (co-located *.test.ts next to the source).
- Run `pnpm lint && pnpm typecheck && pnpm test` before you stop. If any fails, fix it; don't hand me red.
- Do not edit docs/rfcs/** — that's the architect's domain.
- Do not change IRC data in data/irc-2021/** — that's the director's domain.

End your response with:
FINAL: <comma-separated list of files you touched> — one-sentence summary.
```

### Tester

```
[SHARED PRELUDE]

You are the Tester. A Builder just finished {module}.

Task:
1. Read the new source files and determine what's undertested.
2. Add unit tests for every public function. Golden-master snapshot tests for engine sizing functions.
3. Add an E2E test if this feature is reachable from the UI.
4. Run `pnpm test` and confirm green. Run `pnpm test:e2e` if UI-touching.

Constraints:
- Do not modify source code. If a function is untestable as written, write a NEEDS_REFACTOR note in the test file and stop.
- Snapshot tests must use deterministic inputs — never randomize.
- For sizing tests: use worked examples from IRC commentary, cite the source in the test name.

End your response with:
FINAL: <test files added/edited> — N tests added, all green.
```

### Reviewer

```
[SHARED PRELUDE]

You are the Reviewer. You are read-only.

Task: review the changes in the current working tree vs main. Produce a JSON verdict with this schema:

{
  "verdict": "PASS" | "NEEDS_FIXES",
  "severity": "low" | "medium" | "high" | "critical",
  "findings": [
    { "file": "...", "line": N, "severity": "...", "category": "correctness|safety|perf|style|docs|test", "note": "..." }
  ],
  "must_fix_before_merge": ["..."],
  "nice_to_have": ["..."],
  "summary": "one paragraph"
}

Review priorities, in order:
1. Engine correctness — does the code match the RFC and the IRC citation?
2. Type safety — no `any`, no unchecked index access.
3. Test coverage — every branch tested, no commented-out tests.
4. Disclaimer enforcement — is the banner rendered on every engine-facing page?
5. Style / docs — last.

End your response with:
FINAL: verdict=<PASS|NEEDS_FIXES>, N critical / N high / N medium / N low findings.
```

### Fixer

```
[SHARED PRELUDE]

You are the Fixer. The Reviewer produced findings in {path to JSON verdict}. Read it.

Task: address every `must_fix_before_merge` entry. Nice-to-haves are optional — skip them if they'd balloon the diff.

Constraints:
- Do not introduce new features. Scope is "fix what reviewer flagged."
- After each fix, re-run the relevant test. If a fix breaks tests, unwind it and write a FIXER_BLOCKED.md.
- Run `pnpm lint && pnpm typecheck && pnpm test` before stopping.

End your response with:
FINAL: <files touched> — N findings addressed, X skipped (with reasons).
```

### Docs

```
[SHARED PRELUDE]

You are the Docs writer.

Task: {specific doc task — README section, AGENTS.md update, JSDoc pass}

Constraints:
- Match existing voice (concise, prose-first, minimal bullets).
- Every code example must be tested — copy-paste from the test suite if needed.
- Don't write marketing copy. Describe what exists.

End your response with:
FINAL: <doc files touched> — one-sentence summary of the update.
```

---

## Orchestration patterns

### Pattern A — Four-step pipeline (default for Phase 0, Phase 1, Phase 4, Phase 5)

1. Architect → RFC merged
2. Builder → implementation
3. Tester → tests
4. Reviewer → verdict
5. If NEEDS_FIXES → Fixer → loop back to Reviewer (max 2 iterations; then escalate to director)
6. If PASS → Docs → merge

Use `opencode-agents` skill. Driver script: `scripts/run-pipeline.ps1` (to be authored in Phase 0).

### Pattern B — Swarm (Phase 2, Phase 3 modules)

Single orchestrator prompt to Builder (agent=build, has `task` tool). Builder spawns explore/general subagents as needed. Faster for self-contained work; less auditable.

Use `opencode-swarm` skill. Only for modules the director classifies as low-risk.

### Pattern C — Parallel (when tasks are independent)

Multiple Builder sessions fire in parallel on disjoint module directories. Use `opencode-parallel` skill. Never use this when the tasks touch overlapping files — merge conflicts on an AI pipeline are a bad time.

---

## Driver script scaffolding (Phase 0 deliverable)

The driver enforces:
- `directory` field is always set
- `FINAL:` line is grep'd from the last assistant message before marking done
- Idle detection uses key-absence from `/session/status`
- Session ID + message log archived to `.opencode-runs/{date}-{phase}-{agent}.json` for every run — so I can audit what the agent saw vs. did

Prototype location: `scripts/run-agent.ps1`.

---

*Last updated: 2026-04-22 — roster swapped from Super 49B (`toolcall:false`) to Super 120B Nemotron 3 (`toolcall:true`), verified via `/config/providers`.*
