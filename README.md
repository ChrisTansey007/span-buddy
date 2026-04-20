# Span Buddy

Residential beam and floor joist sizing calculator. Reads a floor plan, sizes structural members per IRC 2021 prescriptive tables, produces a review-ready package for a licensed Professional Engineer to sign and seal.

> **Preliminary sizing aid.** This tool does not stamp or seal engineering work. Verify every output with a licensed PE in the jurisdiction of construction before framing.

## Status

Phase 0 — foundation. Project docs in place, Next.js scaffold next.

## Planning documents

- [PROJECT_PLAN.md](./PROJECT_PLAN.md) — liability framing, tech stack, phased roadmap, open questions.
- [TEAM.md](./TEAM.md) — OpenCode agent roles (Architect / Builder / Tester / Reviewer / Fixer / Docs) with prompt templates.
- [PHASE_0_CHECKLIST.md](./PHASE_0_CHECKLIST.md) — concrete kickoff prompts ready to hand to OpenCode.

## How this project is built

Chris (product owner) and Claude (orchestrator) direct a team of OpenCode agents running against a self-hosted OpenCode server with NVIDIA Nemotron Super 49B. Heavy lifting — scaffolding, implementation, tests, docs — is done by agents; humans review diffs, port IRC tables by hand, and make scope calls.

See `TEAM.md` for the roster and orchestration patterns.

## Stack (locked)

Next.js 14 App Router · TypeScript (strict) · Tailwind CSS · shadcn/ui · Zod · Zustand · Vitest · Playwright · GitHub Actions · Vercel (future).

## License

MIT (planned — finalize before first public tag).
