# RFC 001 — Foundation

- **Status:** Accepted
- **Phase:** 0 (foundation)
- **Author:** Director (Chris + Claude advisor)
- **Date:** 2026-04-20
- **Supersedes:** none

## 1. Problem statement

Span Buddy needs a project skeleton that is (a) small enough to keep out of the way while the domain engine is built, (b) strict enough to catch the kinds of mistakes that matter in structural sizing code (implicit `any`, silent array-out-of-bounds, `undefined` returns), and (c) boring enough that an OpenCode Builder agent can scaffold it without improvising. This RFC locks the foundation so Phase 0.2 onwards has zero ambiguity.

"Empty but correct" is the deliverable: no domain code, but every structural decision fixed and a green pipeline proving it.

## 2. Constraints

From the shared prompt prelude (TEAM.md) and PROJECT_PLAN.md:

1. Every engine function must return `{ result, assumptions[], citations[], warnings[] }` — never a naked number. The module boundary chosen here must make that return shape natural and enforceable.
2. The disclaimer banner ("Preliminary sizing aid. Verify with a licensed PE before construction.") is non-negotiable UI and must be regression-guarded by tests.
3. tsconfig must be *strict* in the real sense: `strict: true` plus `noUncheckedIndexedAccess: true` and `exactOptionalPropertyTypes: true`. Array lookups in sizing code must force null checks.
4. Tests land in the same commit as the feature. CI must make skipping tests painful.
5. Engine code must never import Next.js or React — it has to stay usable from a future CLI, a Node script, or a Vercel serverless function without pulling the world.
6. Package manager is pnpm. Lockfile is `pnpm-lock.yaml`. CI caches `~/.pnpm-store`.

## 3. Options considered

### 3.1 Package manager

| Option | Pros | Cons |
|---|---|---|
| **pnpm** | Fast installs, content-addressable store, strict peer deps, well supported by `pnpm dlx shadcn`. Works cleanly in GitHub Actions. | Contributors may need to install it first. Minor. |
| npm | Default, no install step for contributors. | Slower, loose peer-dep handling, flat node_modules makes boundary enforcement harder. |
| yarn (classic) | Mature. | Legacy; Berry adds complexity we don't want. |
| bun | Very fast. | Too new for a production-facing stack. Module resolution edge cases still common. |

**Chosen:** pnpm. Team already uses pnpm in the testbed; every OpenCode prompt in TEAM.md assumes pnpm. Switching would create a low-value contradiction.

### 3.2 Directory layout

Two layouts were considered:

**Option A — src-dir layout** (`src/app/`, `src/components/`, `src/engine/`)
- Pros: conventional Next.js, keeps tooling configs out of app tree.
- Cons: tsconfig paths get longer; more boilerplate for the engine imports; complicates `engine/` being a first-class citizen separate from the UI.

**Option B — flat layout at repo root** (`app/`, `components/`, `engine/`, `data/`, ...)
- Pros: `engine/` sits next to `app/` at the root, making the "engine is not a Next.js submodule" rule visible in the tree. Shorter import paths (`@/engine/joist`). Matches how the PROJECT_PLAN refers to these dirs.
- Cons: mixes framework dirs and non-framework dirs at the top level.

**Chosen:** Option B. The visual prominence of `engine/` at the root matters for a structural-engineering tool; we want reviewers to see immediately that the domain logic is not UI-adjacent.

### 3.3 Testing split

| Tier | Tool | Location | Fires |
|---|---|---|---|
| Unit | Vitest (`vitest run`) | co-located `*.test.ts` next to source in `engine/`, `components/`, `lib/` | pre-commit (future), CI |
| E2E  | Playwright | `tests/e2e/*.spec.ts` | CI |

Rejected: a second "integration" tier. For Phase 0–3, unit + E2E covers everything. Revisit if Phase 4 (DXF) introduces heavy integration seams.

## 4. Chosen design

### 4.1 Directory layout (repo root)

```
span-buddy/
├── app/                    # Next.js App Router (routes, layouts, server components)
├── components/             # React components
│   └── ui/                 # shadcn/ui primitives + DisclaimerBanner
├── engine/                 # PURE TypeScript — sizing logic. NO Next.js, NO React imports.
├── data/
│   └── irc-2021/           # JSON-encoded IRC prescriptive tables (R502, R507, R602, R802)
├── lib/                    # App-side helpers (state, formatting). May import engine.
├── prompts/                # OpenCode prompt templates (checked in, version-controlled)
├── scripts/                # Orchestration scripts (run-agent.ps1, run-pipeline.ps1)
├── tests/
│   └── e2e/                # Playwright specs
├── docs/
│   └── rfcs/               # This RFC, and successors
├── public/                 # Static assets
├── .github/
│   └── workflows/
│       └── ci.yml          # Single CI workflow
└── .opencode-runs/         # Archived OpenCode session dumps (gitignored)
```

### 4.2 Module boundary rules (enforced by lint + review)

1. **`engine/` imports nothing framework-specific.** No `next`, no `react`, no `next/headers`, no `next/navigation`. This is checked in CI with `grep -RE "from ['\"](next|react)" engine/` — empty grep result is required.
2. **`data/irc-2021/` is consumed only by `engine/`.** UI code that needs a span value asks `engine/` for one; it does not import data JSON directly.
3. **`app/` and `components/` may import `engine/` and `lib/`.** `engine/` must not import `app/` or `components/`. Enforced by ESLint `no-restricted-imports`.
4. **`lib/` is allowed to import `engine/`.** It's the glue layer for UI-facing helpers.

### 4.3 Key types (deferred to RFC 002, but pinned here for shape)

Every engine function returns:

```ts
export type EngineResult<T> = {
  result: T;
  assumptions: string[];   // e.g. "Live load 40 psf (living areas, IRC Table R301.5)"
  citations: string[];     // e.g. "IRC 2021 Table R502.3.1(2), row: SPF #2, 2x10, 16\" OC"
  warnings: string[];      // e.g. "Span approaches 95% of table maximum — consider upsizing"
};
```

Naked numeric returns are a lint-banned pattern. This RFC only commits to the shape existing; concrete unions/discriminants land in RFC 002 alongside the first engine module.

### 4.4 Configuration

**`tsconfig.json`** — extends the Next.js default, overrides:

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**ESLint** — flat config (`eslint.config.mjs`) with:
- `next/core-web-vitals`
- `@typescript-eslint/recommended-type-checked`
- `no-restricted-imports` blocking `next` and `react` from `engine/**`
- Tailwind plugin for class-order sanity
- No husky, no lint-staged in Phase 0. Pre-commit hooks are deferred to Phase 3 (when we have enough contributors for local hooks to pay off).

**Prettier** — default config + `prettier-plugin-tailwindcss`.

### 4.5 CI workflow (`.github/workflows/ci.yml`)

Single file. Single job. Sequential steps. No matrix (we're not supporting multiple Node versions yet — Node 20 LTS, period).

```yaml
name: ci
on:
  push:
    branches: [main]
  pull_request:

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm test:e2e
      - run: pnpm build
```

Rejected: splitting into separate jobs (lint, test, e2e). Single job is faster to start (no runner spin-up per step), fails fast on the cheapest check, and leaves us one file to reason about. If total wall time exceeds ~6 min later, revisit.

### 4.6 Commit style

Conventional Commits. `type(scope): subject` — types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `build`, `ci`.

**Why:** downstream automation. When we add automated changelog generation (Phase 5 or 6), Conventional Commits is the cheapest on-ramp. Costs ~3 seconds per commit message to think about the type; pays for itself the first time we need to answer "what changed between v0.3 and v0.4?".

### 4.7 License

MIT. Matches the skill library. No contributor license agreement. Added to repo root as `LICENSE` before Phase 1 cut.

### 4.8 `package.json` scripts

```jsonc
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "format": "prettier --write ."
  }
}
```

Every script name in this list must match a step in CI. No drift.

## 5. Open questions

*All tagged `@director` — I will answer these inline before Phase 1 closes. Phase 0.2 Builder does not wait on these.*

- [ ] **`@director`** Species default for Phase 1 engine: locked to **SPF #2** per PROJECT_PLAN.md. Confirm this is what we ship v1 with. (Phase 1 decision, not blocking Phase 0.)
- [ ] **`@director`** Deck joist sizing (IRC Table R507.6): in or out of v1 scope? Preliminary answer in PROJECT_PLAN §7 is "defer to Phase 2" — confirming here.
- [ ] **`@director`** E2E target coverage: PROJECT_PLAN says "every user-facing flow has at least one Playwright spec". Phase 0 foundation only needs the banner spec. Confirm this is acceptable as the floor, not the ceiling.

## 6. Rollout plan

1. **Phase 0.2 (Builder)** — scaffold per this RFC. All 15 steps in PHASE_0_CHECKLIST.md Step 0.2 are already ordered to match this layout.
2. **Phase 0.3 (Tester)** — lock in the foundation with guardrail tests (disclaimer regression, tsconfig strictness assertion, engine-imports-no-next regression).
3. **Phase 0.4 (Reviewer)** — verify against this RFC, JSON verdict.
4. **Phase 0.5 (Director)** — `git push`, watch first CI run, fix any OS-specific foot-guns.
5. **Phase 0.6 (Docs)** — README rewrite referencing this RFC as the normative source for layout and scripts.

**Rollback:** this RFC is pre-code. If the Builder hits a real problem (e.g., `pnpm create next-app` behavior drift, `shadcn` init failure on Windows path-length limits), Builder writes `DECISION_NEEDED.md` and stops. Director amends this RFC (as a v1.1 section below) rather than letting the Builder improvise.

---

*Accepted 2026-04-20. Changes after Phase 0 ship require a superseding RFC, not silent edits.*
