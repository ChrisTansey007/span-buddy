# AGENTS.md — Span Buddy

Onboarding context for OpenCode agents (and any LLM assistant) working inside
this repository. Read this before touching code.

## What this project is

Span Buddy is a residential beam / floor-joist sizing aid driven by the
**IRC 2021 prescriptive span tables**. It is a preliminary-sizing tool. It
does not stamp, seal, or replace a licensed professional engineer. That
qualification is surfaced to users at all times via `DisclaimerBanner`.

## Non-negotiables

1. **Do not weaken the liability disclaimer.** The exact string lives in
   `components/ui/DisclaimerBanner.tsx` (`DISCLAIMER_TEXT`). A Vitest test
   guards the string and three semantic claims (preliminary / licensed PE /
   stamp-or-seal). Edits require an RFC in `docs/rfcs/`.
2. **Do not loosen tsconfig strictness.** `strict`, `noUncheckedIndexedAccess`,
   and `exactOptionalPropertyTypes` must stay `true`. A guardrail test in
   `tsconfig.strict.test.ts` fails the suite if any of them regress. Silent
   array-out-of-bounds in a span lookup is a real way to ship wrong sizing.
3. **Engine isolation.** Code under `engine/` must not import from `next`,
   `react`, or any other browser / framework dependency. ESLint enforces this
   via `no-restricted-imports`. The engine is plain, deterministic TypeScript
   over structured IRC table data.
4. **No hand-transcribed span numbers in source.** IRC table data lives under
   `data/irc-2021/` as JSON with citation metadata. The engine reads from that
   data; it does not embed table rows as literals.
5. **Conventional Commits.** `feat:`, `fix:`, `refactor:`, `test:`, `docs:`,
   `chore:`, `ci:`. Scope optional. Breaking changes use `!` or a `BREAKING
   CHANGE:` footer.

## Repository layout

```
app/                    Next.js 14 App Router entrypoints (server-first)
components/ui/          Presentational React — no domain logic
engine/                 Pure TS sizing engine (no React, no Next, no I/O)
lib/                    Thin helpers shared by app + engine adapters
data/irc-2021/          Source-of-truth JSON for prescriptive span tables
docs/rfcs/              Architecture / policy RFCs
tests/e2e/              Playwright specs
prompts/                OpenCode prompt templates (used by the director)
scripts/                One-off repo tooling
```

Unit tests live next to the code they cover (`*.test.ts` / `*.test.tsx`).

## Verification gate

Any change must pass this pipeline locally and in CI before merge:

```
pnpm lint
pnpm typecheck
pnpm test -- --run
pnpm test:e2e
pnpm build
```

`pnpm install --frozen-lockfile` is the CI install command — keep
`pnpm-lock.yaml` committed and in sync.

## Working with OpenCode (agent-specific)

This repo is driven by a director (Claude) orchestrating OpenCode agents
running NVIDIA Nemotron Super 49B. See `TEAM.md` for the role definitions,
prompt templates, and the **observed model pathologies** (post-FINAL loop,
empty-text-part on long prose). In short:

- Finish every task with a line starting `FINAL:` and stop. The driver
  aborts the session as soon as it sees `FINAL:`.
- Prefer atomic, single-step prompts. Multi-step prompts have triggered the
  post-FINAL rambling loop.
- Do not be "helpful" by suggesting follow-up work. The director decides
  what runs next.
- If the task asks for long prose (> ~400 tokens of markdown), flag it
  back rather than producing it — the model has dropped text parts on that
  shape before.

## House style

- TypeScript strict. No `any`. Prefer discriminated unions and `EngineResult<T>`
  (`{ ok: true, value } | { ok: false, reason, detail }`).
- Server components by default. Mark client components with the `"use client"`
  pragma only when interaction or browser APIs are actually needed.
- Tailwind for styling. shadcn/ui for primitives when they arrive.
- No implicit global state. Stores (Zustand) live under `lib/state/` and are
  imported explicitly.

## When in doubt

1. Re-read `docs/rfcs/001-foundation.md` — it defines the ground rules.
2. Check `TEAM.md` for role and orchestration rules.
3. Check `PROJECT_PLAN.md` for phase scope and deliverables.
4. If still unclear, stop and ask the director via the `FINAL:` line with a
   question rather than guessing.
