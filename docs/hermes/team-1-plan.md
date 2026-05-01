# Team 1 Plan (Core Architecture/Backend)
Status: Not started

Initial Assessment:
Based on repo inspection, the core engine is in `engine/` and uses pure TypeScript.
Data lives in `data/irc-2021/` as JSON.
API routes are in `app/` (Next.js 14 App Router).

Tasks:
- [ ] Review engine/ for potential performance improvements
- [ ] Add input validation and edge case handling in engine/
- [ ] Review data/irc-2021/ for completeness and consider adding more citation metadata
- [ ] Ensure engine/ remains framework-independent (no React/Next imports)
- [ ] Create or improve unit tests for engine/ functions
- [ ] Document any architectural decisions in docs/hermes/architecture-decisions.md
