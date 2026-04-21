# Phase 0.3 — Tester prompt

Authoritative prompt for the Phase 0.3 Tester run. Do not hand this to OpenCode
without first running the smoke probe below. Derived from the Tester template in
`TEAM.md`; narrowed to the Phase 0.3 scope in `PROJECT_PLAN.md`.

## Agent / driver config

| Field       | Value |
|-------------|-------|
| `agent`     | `build` |
| `model`     | `nvidia/llama-3.3-nemotron-super-49b-v1` |
| `variant`   | `medium` |
| `directory` | `C:\Users\theca\Documents\Claude\Projects\Fine Tune OpenCode\span-buddy` |

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

## Smoke probe (run first — ~100 tokens of work)

Issue this prompt, on the same agent / model / variant / directory, to verify
the session returns a text part and the driver aborts on `FINAL:`:

> The session cwd is already set to the span-buddy project root. Using a
> **relative path only** (not an absolute path), read
> `components/ui/DisclaimerBanner.test.tsx` and print the three `it(...)` test
> names, one per line, then end with `FINAL:`. Do not construct an absolute
> path under any circumstances.

Expected: three lines matching the titles in `DisclaimerBanner.test.tsx`, then a
`FINAL:` line. Driver aborts. If the session produces empty text parts, times
out, or continues past `FINAL:`, fix the driver / prompt before running the real
task below.

### Iteration log

- **2026-04-21 iter 1 — FAILED.** Smoke prompt was the relative path
  `components/ui/DisclaimerBanner.test.tsx`. Super 49B constructed an absolute
  path for the `read` tool call and *space-stripped the project directory*
  (`...\FineTuneOpenCode\span-buddy\...` instead of `...\Fine Tune OpenCode\span-buddy\...`).
  The `read` tool then hung on the non-existent path until aborted. Dump at
  `.opencode-runs/2026-04-21-probe-ses_24e6f0244ffeFq8y71wJBi67Kq.json`.
  **Fix:** the smoke probe and the real prompt below both now forbid absolute
  paths explicitly and require relative paths from the session cwd. This is a
  generalized Super 49B pathology when the project path contains spaces;
  future phases inherit this discipline from here.

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

Tool-call path discipline (non-negotiable — your session has already failed once on this):
- The session cwd is set to the span-buddy project root. Every file-touching tool call (read, edit, write, bash, grep, glob) must use **relative paths from that root** — e.g. `components/ui/DisclaimerBanner.tsx`, not `C:\...\span-buddy\components\ui\DisclaimerBanner.tsx`.
- Do not construct absolute paths, do not prefix with the project root, do not interpolate `$root` or similar. The project path contains spaces ("Fine Tune OpenCode") and Super 49B has been observed space-stripping them when it builds absolute paths, producing a `...\FineTuneOpenCode\...` path that does not exist. That pathology is how the prior smoke probe hung.
- If a tool insists on an absolute path, stop and add a `NEEDS_REFACTOR` note instead of improvising.

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
