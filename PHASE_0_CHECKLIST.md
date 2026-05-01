# Phase 0 — Foundation

**Goal:** empty-but-correct Next.js project, on GitHub, with green CI. No domain code yet.

**Execution model:** four-step pipeline per `TEAM.md` Pattern A. Director runs each step, reviews, moves to next.

**Done when:**
- `main` branch is green in GitHub Actions
- `pnpm dev` serves a "Hello, Span Buddy" page with the disclaimer banner visible
- `pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e && pnpm build` all pass
- `AGENTS.md` exists with enough context that a fresh OpenCode session can onboard itself

---

## Step 0.0 — Director prerequisites (humans only)

Before any OpenCode run:

- [ ] Confirm OpenCode server is running at `http://localhost:4096` (`opencode-serve` skill)
- [ ] Confirm NVIDIA API key is set in the OpenCode provider config
- [ ] Confirm `gh` CLI is authenticated as ChrisTansey007
- [ ] Decide final repo name (default: `span-buddy`)
- [ ] Decide public vs private for v1
- [ ] Install pnpm globally if not present: `npm i -g pnpm`

---

## Step 0.1 — Architect: Foundation RFC

**Agent:** plan / variant:high

**Hand this to OpenCode:**

```
[SHARED PRELUDE from TEAM.md]

You are the Architect. Produce docs/rfcs/001-foundation.md covering:

1. Package manager choice: pnpm. Explain why over npm/yarn/bun for this project.
2. Directory layout: where do app/, components/, engine/, data/, tests/, prompts/, scripts/, docs/ live? Justify.
3. Module boundaries: engine/ is pure TS with zero Next imports. components/ and app/ can import engine/, never the reverse. Data in data/irc-2021/ is consumed only by engine/.
4. Testing: Vitest for unit (co-located *.test.ts), Playwright for E2E (tests/e2e/*.spec.ts).
5. Linting: ESLint flat config, Prettier, Tailwind plugin. No husky yet — defer to Phase 3.
6. CI: a single GitHub Actions workflow on PR and push to main — install, lint, typecheck, test, e2e, build. Cache pnpm store.
7. Commit style: Conventional Commits. Why? Future automated changelog.
8. License: MIT (to match the skill library).

Deliverable: the RFC doc only. No implementation.

End your response with:
FINAL: docs/rfcs/001-foundation.md — summary of the adopted foundation choices.
```

**Director review checklist:**
- [ ] RFC addresses all 8 sections
- [ ] Module boundaries explicitly ban engine→next imports
- [ ] CI workflow plan is single-file (not over-engineered)
- [ ] Open questions (if any) are marked `@director` for me to answer inline

---

## Step 0.2 — Builder: Project scaffold

**Agent:** build / variant:medium

**Blocks until Step 0.1 RFC is merged.**

**Hand this to OpenCode:**

```
[SHARED PRELUDE from TEAM.md]

You are the Builder. RFC docs/rfcs/001-foundation.md is merged — follow it exactly.

Task: scaffold the project.

Steps:
1. Run `pnpm create next-app@latest . --typescript --tailwind --app --eslint --src-dir=false --use-pnpm --import-alias="@/*"` (answer "no" to Turbopack — keep it boring for now).
2. Install dev deps: vitest, @vitejs/plugin-react, @testing-library/react, @testing-library/jest-dom, jsdom, @playwright/test, prettier, prettier-plugin-tailwindcss.
3. Install runtime deps: zod, zustand.
4. Install shadcn/ui: `pnpm dlx shadcn@latest init` with defaults.
5. Configure tsconfig: strict=true, noUncheckedIndexedAccess=true, exactOptionalPropertyTypes=true.
6. Create directories per RFC: engine/, data/irc-2021/, prompts/, scripts/, tests/e2e/, .opencode-runs/.
7. Add .gitkeep to every new empty dir.
8. Create a DisclaimerBanner component in components/ui/ and render it in app/layout.tsx. Text: "Preliminary sizing aid. Verify with a licensed PE before construction. This tool does not stamp or seal engineering work."
9. Replace the default landing page with a minimal "Hello, Span Buddy" centered on page, banner at top.
10. Add a sanity unit test in engine/sanity.test.ts (2+2 === 4) — confirms vitest is wired.
11. Add a sanity E2E test in tests/e2e/landing.spec.ts — visits /, asserts the banner text is present.
12. Add package.json scripts: dev, build, start, lint, typecheck (tsc --noEmit), test (vitest run), test:watch, test:e2e (playwright test), format (prettier --write .).
13. Author .github/workflows/ci.yml — runs on push to main and on all PRs — jobs: setup → lint → typecheck → test → e2e → build. Cache pnpm.
14. Author AGENTS.md at repo root per opencode-init skill conventions: project intent, stack, key constraints, where to find RFCs, how to run the test suite.
15. Verify: pnpm install && pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e && pnpm build — all must pass.

End your response with:
FINAL: <files touched> — Phase 0 scaffold complete, all checks green.
```

**Director review checklist:**
- [ ] All 15 steps visibly completed in the FINAL file list
- [ ] Local clone + `pnpm install && pnpm dev` works end-to-end
- [ ] Disclaimer banner visible on load
- [ ] `pnpm test` and `pnpm test:e2e` green locally

---

## Step 0.3 — Tester: Foundation coverage

**Agent:** build / variant:medium (test-focused persona)

**Hand this to OpenCode:**

```
[SHARED PRELUDE from TEAM.md]

You are the Tester. Builder just scaffolded the project.

Task: make sure the foundation is properly tested.

1. Read package.json scripts. Confirm each passes from a clean install.
2. Add a Vitest test that imports DisclaimerBanner and asserts the exact disclaimer string is in its rendered output (regression guard against quiet edits).
3. Add a Playwright E2E test that asserts the banner is visible on /, / (reload), and a 404 route. Banner must persist.
4. Add a Vitest test that asserts tsconfig.json has strict=true and noUncheckedIndexedAccess=true (guards against future loosening).
5. Run all tests. Green?

End your response with:
FINAL: <test files> — N tests added, all green, foundation is guarded.
```

---

## Step 0.4 — Reviewer: Foundation verdict

**Agent:** explore / variant:high (read-only)

**Hand this to OpenCode:**

```
[SHARED PRELUDE from TEAM.md]

You are the Reviewer. Scaffold + tests are in. Produce a JSON verdict per TEAM.md.

Review checklist:
1. RFC was actually followed (cross-check against docs/rfcs/001-foundation.md)
2. tsconfig strictness is real, not cosmetic
3. Disclaimer text matches exactly across banner component, E2E test, and README
4. CI workflow covers all script names and uses pnpm caching
5. engine/ has zero Next.js / React imports (run `grep -R "from ['\"]next" engine/` to confirm empty)
6. AGENTS.md actually tells a fresh OpenCode session what it needs to know
7. No hardcoded paths, no committed .env, no leaked keys
8. .gitignore covers node_modules, .next, coverage, playwright-report, test-results, .env*

Output: the JSON verdict. No edits.

End your response with:
FINAL: verdict=<PASS|NEEDS_FIXES>, N high / N medium / N low.
```

**Director action:**
- If PASS → 0.5
- If NEEDS_FIXES → 0.4b (Fixer) then 0.4 again (max 2 loops, then escalate)

---

## Step 0.5 — GitHub repo + first push

**Human-driven. Director runs the commands.**

```powershell
cd "C:\Users\theca\Documents\Claude\Projects\Fine Tune OpenCode\span-buddy"

git init
git add .
git commit -m "chore: Phase 0 foundation scaffold" -m "Next.js 14 + TS + Tailwind + Vitest + Playwright + GH Actions CI. See docs/rfcs/001-foundation.md."

gh repo create ChrisTansey007/span-buddy --public --source=. --remote=origin --description "Residential beam & floor joist calculator (IRC 2021)."
git push -u origin main
```

Verify: GitHub Actions runs and goes green on first push.

---

## Step 0.6 — Docs: kickoff README

**Agent:** build (Nano 30B) / variant:low

**Hand this to OpenCode:**

```
[SHARED PRELUDE from TEAM.md]

You are the Docs writer. The project has shipped Phase 0.

Task: rewrite README.md. Sections:
1. What this is (from PROJECT_PLAN.md section "One-sentence pitch")
2. Status badge (GitHub Actions) — placeholder link if you can't verify
3. "Not a stamp" disclaimer — prominent, above fold
4. Getting started: clone, pnpm install, pnpm dev
5. Scripts: enumerate from package.json with one-liner each
6. Project structure: tree view of the top-level dirs
7. Contributing: link to AGENTS.md + PROJECT_PLAN.md + TEAM.md
8. License: MIT

Tone: direct, no marketing fluff. Borrow voice from opencode-skill-library README.

End your response with:
FINAL: README.md — rewritten for post-Phase-0 state.
```

---

## Phase 0 exit criteria

- [ ] `main` green on CI
- [ ] Banner + landing page live on `pnpm dev`
- [ ] All 6 docs present at repo root: README.md, PROJECT_PLAN.md, TEAM.md, PHASE_0_CHECKLIST.md, AGENTS.md, docs/rfcs/001-foundation.md
- [ ] Director has approved Reviewer verdict as PASS
- [ ] Next step queued: Phase 1 Architect run → `docs/rfcs/002-irc-data-ports.md`

---

*Last updated: 2026-04-20*
