# Phase 0.3 — Tester prompt

Authoritative prompt for the Phase 0.3 Tester run. Do not hand this to OpenCode
without first running the smoke probe below. Derived from the Tester template in
`TEAM.md`; narrowed to the Phase 0.3 scope in `PROJECT_PLAN.md`.

## Agent / driver config

| Field       | Value |
|-------------|-------|
| `agent`     | `build` |
| `model`     | `nvidia/nemotron-3-super-120b-a12b` |
| `variant`   | `medium` |
| `directory` | `C:\Users\theca\Documents\Claude\Projects\Fine Tune OpenCode\span-buddy` |

API payload fields: `providerID = "nvidia"`, `modelID = "nvidia/nemotron-3-super-120b-a12b"`. Super 49B (`nvidia/llama-3.3-nemotron-super-49b-v1`) was the original model; swapped out after three failed smoke probes when we discovered its `capabilities.toolcall = false` in the OpenCode model registry. Devstral 123B (`mistralai/devstral-2-123b-instruct-2512`) was tried as an interim swap; registry claims `toolcall: true` but the probe showed the model emitting the tool call as plain text — evidence that the capability flag is unreliable for that specific model's NVIDIA-provider integration. See Iteration log for the full progression.

Driver discipline (from `feedback_director_vs_doer.md` and the Super 49B
pathologies in `TEAM.md`):

1. Poll `/session/:id/message`. As soon as an assistant text part begins with
   `FINAL:`, `POST /session/:id/abort` — do not wait for the session to idle on
   its own. Super 49B will otherwise emit a post-FINAL "it seems there was a
   misunderstanding" ramble.
2. Archive the session dump to
   `.opencode-runs/2026-04-21-0-3-tester-<sessionId>.json` before clearing
   state.
3. On failure, diagnose (refusal / empty parts / post-FINAL loop / tool misuse),
   edit this file, re-probe, retry. Two failed iterations before director
   fallback is even considered; if fallback happens, commit the failed prompt
   variant + diagnosis + working alternative back to this file.

## Smoke probe (run first — binary pass of tool invocation)

Narrow probe. We are not extracting content and we are not testing reasoning.
We are testing one thing: can Super 49B build a clean `read` tool call against
this project path and stop cleanly at `FINAL:`. Positive instructions only —
no "do not" constraints; iter 2 below showed Super 49B freezes up on stacked
negatives and skips the tool entirely.

Issue this prompt on the same agent / model / variant / directory:

> Your first action is to call the `read` tool with this exact argument:
>
> ```json
> {"filePath": "components/ui/DisclaimerBanner.test.tsx"}
> ```
>
> Copy the `filePath` value literally. It is a relative path and the session
> cwd is the project root, so the tool will resolve it.
>
> After the tool returns, respond with exactly one line and nothing else:
>
> ```
> FINAL: probe ok
> ```

Pass criteria (all three must hold):

1. Assistant message contains a tool part with `tool = "read"` and
   `state.status = "completed"`.
2. The tool's `filePath` argument is the literal string
   `components/ui/DisclaimerBanner.test.tsx` — no drive letter, no prefix,
   no space-stripped variant like `...\FineTuneOpenCode\...`.
3. The trailing text part equals `FINAL: probe ok`.

On any failure: add an entry to the Iteration log, edit this file, re-run.
Do not advance to the real task below until the probe passes.

### Iteration log

- **2026-04-21 iter 1 — FAILED.** Smoke prompt was the relative path
  `components/ui/DisclaimerBanner.test.tsx`. Super 49B constructed an absolute
  path for the `read` tool call and *space-stripped the project directory*
  (`...\FineTuneOpenCode\span-buddy\...` instead of `...\Fine Tune OpenCode\span-buddy\...`).
  The `read` tool then hung on the non-existent path until aborted. Dump at
  `.opencode-runs/2026-04-21-probe-ses_24e6f0244ffeFq8y71wJBi67Kq.json`.
  **Diagnosis:** Super 49B mis-constructs absolute paths on directories with
  spaces. **Attempted fix (iter 2):** stack negative constraints telling it
  never to build an absolute path. This turned out to be the wrong instinct;
  see iter 2.
- **2026-04-21 iter 2 — FAILED (worse).** After adding "do not construct
  absolute paths under any circumstances" plus three more negative
  constraints, Super 49B stopped calling the `read` tool entirely.
  5-second response with zero tool parts; hallucinated a refusal
  ("Test names could not be extracted. Please provide the file...") and
  jumped straight to `FINAL:`. Dump at
  `.opencode-runs/2026-04-21-probe2-ses_24e62470cffeKz1Of2ov40iCYw.json`.
  **Diagnosis:** Super 49B degrades under stacked negative constraints — told
  what not to do, it chose skip-the-tool over risk-the-tool. **Fix (iter 3):**
  positive-only instructions; show the literal tool-call argument instead of
  proscribing what not to build; dumb down the probe to one tool call + one
  text line + binary pass (no content extraction). Same pattern applied to
  the real prompt's path-style section below. This is a generalized Super 49B
  workmanship rule: **never stack negatives, always show the shape you want.**
- **2026-04-21 iter 3 — FAILED (partial).** Positive-only probe with a JSON
  code-fence example. Super 49B *did* call the `read` tool (progress over
  iter-2's skip-the-tool), but passed an empty input object `{}` — no
  `filePath` argument at all. Tool returned a schema validation error
  (`Invalid input: expected string, received undefined`), the model gave
  up and jumped to `FINAL: probe ok`. Dump at
  `.opencode-runs/2026-04-21-probe3-ses_24d0361d9ffefcPTd0ptWrwz4z.json`.
  **Diagnosis:** three smoke iterations, three distinct pathologies on a
  100-token task (absolute-path space-stripping, tool-skip, empty input).
  Super 49B is structurally unreliable at building tool calls against this
  project path.
- **2026-04-21 iter 4 — MODEL SWAP #1 (FAILED).** Switched to
  `nvidia / mistralai/devstral-2-123b-instruct-2512` (Devstral 123B).
  Result: the model produced zero tool parts — only a text part containing
  the literal string `read{"filePath": "components/ui/DisclaimerBanner.test.tsx"}`.
  It transcribed what a tool call should look like rather than invoking one.
- **2026-04-21 iter 4 postmortem — ROOT CAUSE FOUND.** Inspecting the
  `/config/providers` endpoint revealed that every model carries a
  `capabilities.toolcall` boolean. **Super 49B is marked
  `toolcall: false`**, as is its v1.5 variant. All three iter-1–3 pathologies
  (space-stripped abs path, tool skip, empty args) were the same underlying
  bug: OpenCode doesn't pass a tool schema to models the registry flags as
  non-tool-capable, so Super 49B was hallucinating tool calls in prose.
  Devstral 123B is registered as `toolcall: true` but still failed, which is
  a second, narrower issue specific to that model's NVIDIA-provider
  integration — capability flag is unreliable for Devstral in particular.
  **Reusable rule for future phases:** before picking a model for an
  orchestration task, GET `http://127.0.0.1:4096/config/providers` and
  confirm the chosen model has `capabilities.toolcall: true`. The OpenCode
  wrapper will not error on a non-tool model; it will silently produce these
  pathologies instead.
- **2026-04-21 iter 5 — MODEL SWAP #2.** Switched to
  `nvidia/nemotron-3-super-120b-a12b` (Nemotron 3 Super, 120B MoE with 12B
  active params, 262K/262K context/output). Registry confirms
  `capabilities.toolcall: true` and `capabilities.reasoning: true`. This is
  the direct upgrade path from the Super 49B family into a tool-capable,
  reasoning-enabled model. Running the binary-pass smoke probe against this
  model next.

## Real prompt (send only after smoke probe is clean)

---

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

---

You are the Tester for Phase 0.3. The Phase 0.2 scaffold is committed: `app/layout.tsx`, `app/page.tsx`, `app/not-found.tsx`, and `components/ui/DisclaimerBanner.tsx` already exist. The banner is already unit-tested in isolation in `components/ui/DisclaimerBanner.test.tsx`. What is missing: integration coverage proving the banner is actually mounted by the real `RootLayout`, and that both the home page and the 404 page render underneath it.

Deliverable: exactly one new Vitest file, `app/layout.integration.test.tsx`, containing three integration tests against real components (no mocking of `DisclaimerBanner`, `RootLayout`, `Home`, or `NotFound`). One test file, three `it(...)` cases:

1. `RootLayout` with `<Home />` as children mounts the disclaimer banner (match by `DISCLAIMER_TEXT` imported from `components/ui/DisclaimerBanner.tsx`, or by `role="alert"` with `aria-label="Engineering disclaimer"` — your call, but import the constant; do not duplicate the string).
2. `RootLayout` with `<Home />` as children renders the home page heading — the exact text is in `app/page.tsx`; read the file and assert the heading text that is actually there.
3. `RootLayout` with `<NotFound />` as children still mounts the disclaimer banner (layout-level persistence regression guard).

Tool-call path shape — copy these literal shapes for every file-touching call. The session cwd is the project root; relative paths resolve cleanly.

- `read` — `{"filePath": "components/ui/DisclaimerBanner.tsx"}`
- `read` — `{"filePath": "app/layout.tsx"}`
- `read` — `{"filePath": "app/page.tsx"}`
- `read` — `{"filePath": "app/not-found.tsx"}`
- `read` — `{"filePath": "tsconfig.json"}`
- `write` — `{"filePath": "app/layout.integration.test.tsx", "content": "<file contents>"}`
- `bash` — `{"command": "pnpm test -- --run"}`
- `glob` — `{"pattern": "app/**/*.tsx"}`
- `grep` — `{"pattern": "DISCLAIMER_TEXT", "path": "components/ui"}`

Use these exact shapes. The `filePath` value is the relative path from the project root — just the path, the way it is written above. If any tool call returns a "file not found" or path-style error, stop, and add a comment at the very top of `app/layout.integration.test.tsx`: `// NEEDS_REFACTOR: <tool name> rejected <path> — <error>`, then stop.

Constraints:
- Render the real `RootLayout`. Do not mock it, do not inline a substitute. `RootLayout` returns `<html>/<body>`, which `@testing-library/react` will not accept as children of its default container. Pick one of these two approaches and comment which and why at the top of the test file:
  (a) Call `RootLayout({ children: <Home /> })` as a function, then feed the returned React element to `renderToStaticMarkup` from `react-dom/server` and assert on the resulting HTML string; or
  (b) Use `@testing-library/react`'s `render(..., { container: document.documentElement, baseElement: document.documentElement })` and query via `screen` — accept that jsdom will host a second `<html>/<body>` inside the existing document.
- Import the actual page components (`Home` from `app/page.tsx`, `NotFound` from `app/not-found.tsx`) — not copies. A future edit that removes the banner from the layout or breaks either page must break this test.
- Do not modify any source file: not `app/layout.tsx`, not `app/page.tsx`, not `app/not-found.tsx`, not `components/ui/DisclaimerBanner.tsx`, not `tsconfig.json`, not `vitest.config.ts`, not `package.json`. If the task as specified cannot be done without a source edit, add a `// NEEDS_REFACTOR: <reason>` comment at the very top of `app/layout.integration.test.tsx`, write whatever subset you can, and stop.
- Do not add new dependencies. `@testing-library/react`, `@testing-library/jest-dom`, and `react-dom` are already wired — see `components/ui/DisclaimerBanner.test.tsx` for the existing setup pattern.
- The test file must typecheck under the existing `tsconfig.json` (strict + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`). No `any`. No `@ts-ignore`.
- Run `pnpm test -- --run` exactly once when done. If it is green, you are done. If it is red, fix the test (never the source) or add the `NEEDS_REFACTOR` note and stop.

Out of scope — do not touch:
- Playwright / E2E specs. Banner E2E coverage already exists in `tests/e2e/`.
- ESLint, Prettier, CI config, or any tooling config.
- Any file outside `app/layout.integration.test.tsx`.

End your response with one line, exactly:

```
FINAL: app/layout.integration.test.tsx — N tests added, all green.
```

(Substitute the real count for `N`, or `N tests added, NEEDS_REFACTOR noted` if you took the escape hatch.) Do not write anything after the `FINAL:` line.

---

*Authored 2026-04-21 by director for Phase 0.3. Update in place if the prompt needs to iterate; do not silently fork.*
