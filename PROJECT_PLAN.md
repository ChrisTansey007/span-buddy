# Span Buddy — Beam & Floor Joist Calculator

**Working name:** `span-buddy` (easy to rename before the first public commit — candidates: `beam-joist-calc`, `joistmate`, `framesizer`, `carpenter-calc`).

**One-sentence pitch:** A web app that reads a residential floor plan (manual form in v1, DXF upload in v2), sizes joists / beams / headers per IRC 2021, and produces a review-ready package a licensed PE can sign and seal.

**Director:** Chris (product owner + reviewer-of-last-resort)
**Co-director / orchestrator:** Claude (this assistant) — shepherds OpenCode "team" through each phase, reviews output, keeps the plan moving.
**Heavy-lifting team:** OpenCode agents (Architect / Builder / Tester / Reviewer / Fixer / Docs) — see `TEAM.md`.

---

## 1. Liability & accuracy framing (read first)

This section is deliberately up front because it drives every other decision.

**What this tool is:** a structural sizing engine that does the math a framer or designer would otherwise do by hand or in a spreadsheet. It produces a traceable output package (every input, every table citation, every formula) ready for a licensed PE to review.

**What this tool is NOT:** a stamp. Stamps come from a licensed Professional Engineer in the jurisdiction where the building is being built — full stop. No software product stamps anything; the PE does.

**Practical posture:**
- v1 ships with a prominent disclaimer banner — "Preliminary sizing aid. Verify with a licensed professional engineer before construction."
- v2 adds a "PE Review Package" export — a PDF that bundles inputs, assumptions, IRC table citations, and a sign-and-seal page for the reviewing engineer.
- v3 explores a partnership model with a PE firm that reviews and seals outputs for a fee. That's a business problem, not a software problem, and it sits outside the MVP.

**The word "stamp-ready" in marketing copy is off limits until we have a PE partnership in place.** We can say "PE-reviewable," "audit-ready," "engineered-quality output" — all accurate, none claim the software itself stamps.

---

## 2. Locked tech decisions

| Decision | Choice | Rationale |
|---|---|---|
| Platform | Next.js 14 + TypeScript (App Router) | Single full-stack app, strong OpenCode scaffolding support, deploys to Vercel, good for interactive plan UI |
| Runtime | Node 20 LTS | |
| Styling | Tailwind CSS + shadcn/ui | Low-bikeshed, matches OpenCode's default assumptions |
| State | Zustand for client state, Zod for schema | Keeps sizing-engine inputs strictly typed end-to-end |
| Math engine | Pure TS, no floating-point tricks (Decimal.js where codes specify rounded table lookup) | Deterministic, testable, exportable to CLI |
| Storage (v1) | Local file + URL-shareable state | Defer auth/database until v2 |
| Code basis | IRC 2021 prescriptive tables (R502, R507, R602, R802) | Public-code, copy-safe with citation, covers the 95% case |
| Input (v1) | Structured JSON / form | Fastest path to a working engine |
| Input (v2) | DXF upload + semi-automatic room/bearing-wall detection | Real value-add vs competitors |
| Output (v1) | On-screen sized members + warnings | |
| Output (v2) | PDF "PE Review Package" | |
| Testing | Vitest (unit), Playwright (E2E), golden-master snapshots for sizing regressions | |
| CI | GitHub Actions — lint, typecheck, test, build on every PR | |
| Hosting | Vercel for preview + prod | |

---

## 3. Phased roadmap

Each phase is built by OpenCode under my direction. Completion criteria are tight so we never get stuck in a "90% done" trap.

### Phase 0 — Foundation (target: ~1 working session)

**Goal:** an empty-but-correct Next.js project, committed to GitHub, with CI green on an empty test.

Deliverables:
- `create-next-app` scaffold with TS, Tailwind, App Router
- `tsconfig.json` with `"strict": true`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- ESLint + Prettier configured with Next + Tailwind plugins
- Vitest wired up, one passing unit test (sanity)
- Playwright wired up, one passing E2E test (loads `/`)
- `.github/workflows/ci.yml` — lint, typecheck, test, build
- GitHub repo created, initial commit, CI green
- `README.md`, `LICENSE`, `CODE_OF_CONDUCT.md`
- `AGENTS.md` so OpenCode has project context for every subsequent session

Done when: `main` is green on CI, repo is cloneable, `npm run dev` serves a "Hello, Span Buddy" page.

### Phase 1 — Sizing engine v1 (IRC prescriptive, JSON input)

**Goal:** pure-TS library that takes a structured floor description and returns sized joists, beams, and headers.

Deliverables:
- `data/irc-2021/` — JSON ports of the relevant IRC tables with full citations:
  - R502.3.1(1) Floor joist spans — 30 psf live load
  - R502.3.1(2) Floor joist spans — 40 psf live load
  - R502.5(1) Girders & headers — exterior bearing walls
  - R507 Deck joist spans
  - R602.7(1/2) Headers & girders — interior bearing walls
  - R802.5.1 Ceiling joists / rafters (stretch)
- `engine/` — pure TS functions:
  - `sizeFloorJoist(span, spacing, species, grade, liveLoad) → JoistSpec`
  - `sizeHeader(span, loadWidth, stories, species) → HeaderSpec`
  - `sizeGirder(span, tributaryWidth, stories) → GirderSpec`
  - Every function returns `{ result, assumptions[], citations[], warnings[] }` — never a naked number
- Unit tests against worked examples from code-commentary sources
- Golden-master snapshot test: feed a known floor plan, assert the full JSON output byte-for-byte
- Disclaimer banner component

Done when: engine returns correct sizes for 30+ worked examples, snapshot tests lock behavior, disclaimer is visible on every engine-using page.

### Phase 2 — Floor-plan UX + parameter editing

**Goal:** a user can describe a simple floor plan in the UI, tweak inputs, and see sizes update live.

Deliverables:
- Floor plan schema (`plan.schema.json`) — rooms, walls, load-bearing lines, openings
- Plan editor UI — room-by-room form (not a canvas yet; canvas is v2+)
- Live sizing results panel with color-coded warnings
- URL-shareable state (plan encoded in search params or signed URL)
- Report view — clean printable page with inputs + sized members + citations + disclaimer
- E2E test: "enter a 20'×30' single-story, see joists sized"

Done when: a non-technical user can input a simple rectangular house and get reasonable output without reading the source code.

### Phase 3 — PE Review Package (PDF export)

**Goal:** an output document a licensed PE can review, annotate, and seal.

Deliverables:
- PDF generator (`@react-pdf/renderer` or server-side via Puppeteer — decide based on Vercel constraints)
- Document sections:
  1. Project info (address, permit #, designer, date)
  2. Input summary (plan geometry, loads, assumptions)
  3. Sized members (table per element type)
  4. IRC table citations (exact section numbers, edition year)
  5. Assumption log (default live loads, species, grade, etc.)
  6. Warnings & limitations (every case where the tool punted to engineering)
  7. **PE sign-and-seal page** — blank fields for PE name, license #, state, seal image, date
- Watermark on every page: "Preliminary — requires PE review before construction"
- Saved-package versioning so revisions are traceable

Done when: we can hand a PE a PDF and they can review it without needing to open the web app.

### Phase 4 — DXF input (the real value-add)

**Goal:** upload an architect's DXF, auto-extract rooms and bearing lines, human-confirms, engine sizes.

Deliverables:
- DXF parsing layer (`dxf-parser` npm or similar)
- Geometry → floor-plan-schema mapping:
  - Wall-lines grouped by layer (`A-WALL`, `S-BEAM`, `A-WALL-FULL`, etc. — by convention)
  - Bearing-wall detection heuristics (thick walls, structural layer)
  - Opening detection (doors, windows) for header placement
- Semi-automatic UI: parsed result overlaid on the drawing, user confirms each bearing line, tags loads, then engine runs
- Graceful degradation when DXF is non-standard (most DXFs are)
- Test corpus: 5–10 real sample plans from public sources

Done when: a real architect DXF imports to 80% auto-completion, user confirms the rest in <5 minutes.

### Phase 5 — Engineered NDS mode (unlocks non-prescriptive cases)

**Goal:** when IRC tables don't cover it (long spans, point loads, multi-span beams), fall through to full mechanics-based NDS 2018/2024 analysis.

Deliverables:
- NDS reference values library (F_b, F_v, E, F_c_perp by species/grade)
- Adjustment factor pipeline (C_D, C_M, C_t, C_L, C_F, C_fu, etc.)
- Flexure, shear, deflection, bearing checks per NDS Chapter 3
- Multi-span continuous beam solver
- Upgraded PDF report showing full calc traceback

Done when: tool correctly sizes a 22' great-room beam where prescriptive tables stop at 18'.

### Phase 6+ — partnership, licensing, growth

Out of software scope — PE partnership, state-by-state review, pricing model. Revisited after Phase 3 ships.

---

## 4. My role as director

Not writing code line-by-line. Specifically:

1. **Plan owner.** I keep this document current, call phase transitions, and kill scope that isn't earning its keep.
2. **OpenCode orchestrator.** Every non-trivial task goes out as a prompt with the 2026-04 fixes baked in (directory param, FINAL: line convention, correct idle detection) — see `TEAM.md`.
3. **Prompt writer.** I author the detailed, agent-ready prompts in `prompts/` so each OpenCode run has enough context to succeed without my real-time intervention.
4. **Reviewer of agent output.** I read every diff OpenCode produces, run the tests, and decide merge / rework / scrap.
5. **Structural-code translator.** I take IRC sections and convert them into unambiguous engine specs so OpenCode isn't trying to interpret legal text. This is probably the highest-leverage thing I do.
6. **Error-handling ombudsman.** When an agent hangs, returns garbage, or misreads a spec, I diagnose (stuck on tool loop? wrong model? context window? prompt ambiguity?) and reissue.
7. **Escalator.** When something is outside software scope (PE review, licensing, state rules, liability insurance), I flag it to Chris and we discuss — I don't try to quietly design around it.

I do NOT stamp anything, interpret IRC ambiguities without a citation, or invent span values. Every number the tool reports must trace to a table entry or a code formula.

---

## 5. OpenCode team composition

See `TEAM.md` for prompt templates. Quick roster:

| Agent | Role | OpenCode agent type | Model | When |
|---|---|---|---|---|
| Architect | RFC authoring, system design | `plan` | Super 49B, variant:high | Before each phase |
| Builder | Feature implementation, file edits | `build` | Super 49B, variant:medium | Main workhorse |
| Tester | Writes + runs tests | `build` (test-focused) | Super 49B, variant:medium | After each feature |
| Reviewer | Structured code review, PASS / NEEDS_FIXES | `explore` | Super 49B, variant:high | Before every merge |
| Fixer | Addresses reviewer findings | `build` | Super 49B, variant:medium | After review |
| Docs writer | README, inline docs, AGENTS.md updates | `build` | Nano 30B, variant:low | End of each phase |

Orchestration style:
- Phase 0 and early Phase 1: `opencode-agents` four-step pipeline (Architect → Builder → Reviewer → Fixer) for each module — tight, auditable, easy to intervene.
- Phase 1+ modules: `opencode-swarm` (single orchestrator prompt, builder spawns subagents internally) for self-contained stories.
- Phase 4 (DXF) and Phase 5 (NDS): back to the four-step pipeline — too much subject-matter risk to go full swarm.

---

## 6. First-week concrete deliverables

Day 1 — Now:
- [x] Project folder scaffolded
- [x] `PROJECT_PLAN.md` (this file)
- [ ] `TEAM.md`
- [ ] `PHASE_0_CHECKLIST.md` (agent-ready prompts for foundation work)
- [ ] GitHub repo created, plan docs pushed

Day 2:
- [ ] OpenCode runs Phase 0 end-to-end — scaffold, CI, repo green
- [ ] First visual: `npm run dev` shows "Hello, Span Buddy" + disclaimer banner

Day 3–4:
- [ ] Phase 1 kickoff: IRC R502.3.1(1) ported to JSON with citations
- [ ] First engine function: `sizeFloorJoist()` with ten passing tests

Day 5:
- [ ] Phase 1 checkpoint: all floor-joist tables in, `sizeFloorJoist` green, disclaimer component in place

---

## 7. Open questions / decisions still needed

These don't block Phase 0 but must be answered before Phase 1 closes:

1. **Repo name** — `span-buddy` OK? Alt suggestions: `beam-joist-calc`, `joistmate`, `carpenter-calc`.
2. **Repo visibility** — public (like the skill library) or private until v1 ships?
3. **License** — MIT fine? AGPL if we want stronger copyleft on the engine?
4. **Target user for v1** — DIY / owner-builder, framing contractor, or home designer? Affects default input assumptions (how much structural literacy to assume).
5. **IRC edition** — locked to 2021, or also maintain 2018 and 2024? 2024 published Nov 2023. Many jurisdictions still on 2021 or even 2018.
6. **Species defaults** — SPF #2, DF-L #2, SYP #2 are the big three. Pick a default for the UI.
7. **Load defaults** — 40 psf live (living), 30 psf live (sleeping), 10 psf dead, 20 psf roof live? Confirm for v1.
8. **LVL / engineered lumber in v1?** — Most IRC tables are sawn lumber only. Manufacturer tables (Trus Joist, Boise Cascade, Roseburg) have licensing constraints. Decide: sawn-only MVP, engineered deferred.
9. **Deck joists** — include R507 in v1 or defer?
10. **Testing budget** — how much golden-master coverage is "enough" for Phase 1 exit?

---

## 8. Risks & mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| OpenCode misreads IRC tables → wrong spans | High if unsupervised | I port the tables personally, not via OpenCode. Agents only consume the structured JSON. |
| DXF parsing rabbit hole eats Phase 4 | High | Hard timebox Phase 4 at 2 weeks, fall back to "upload image + manual trace" if parser blows up |
| Liability concern scope-creeps the MVP | Medium | PE review package is a separate artifact — engine stays clean |
| Users skip the disclaimer, cite tool as stamped | Medium | Watermark every PDF, forced "I am not a licensed engineer" checkbox on first use |
| NDS in Phase 5 is actually 2 phases of work | High | Scope Phase 5 to flexure + shear + deflection only; column design + connections are Phase 6 |
| Manufacturer table licensing drift | Low for v1, high if we add Trus Joist | Legal review before shipping any proprietary table |

---

## 9. Definitions

- **Span** — clear horizontal distance between bearing supports
- **Bearing wall / line** — a wall or member that carries load from above to the foundation
- **Header** — short beam over an opening (door, window) in a bearing wall
- **Girder / beam** — horizontal member carrying loads from joists or other beams to posts/walls
- **Tributary width** — the plan-view strip of floor whose load a given member carries
- **Live load** — transient load (people, furniture) — IRC: 30 psf sleeping, 40 psf living/other
- **Dead load** — permanent load (self-weight, finishes) — typically 10–15 psf for residential
- **F_b, F_v, E** — NDS reference values for bending, shear, modulus of elasticity
- **PE** — Professional Engineer, state-licensed; the only entity that can stamp residential structural drawings

---

*Last updated: 2026-04-20*
