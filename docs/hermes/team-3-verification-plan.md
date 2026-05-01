# Team 3 Plan (Verification/Testing/Security)
Status: Not started

Initial Assessment:
Repo has Vitest unit tests and Playwright e2e tests.
Uses pnpm, ESLint, and TypeScript strict mode.
OpenRouter free-models-only policy must be followed for any AI-assisted work.

Tasks:
- [ ] Run install, build, lint, test, and app startup checks to establish baseline
- [ ] Look for broken flows, unsafe assumptions, poor error handling, weak validation
- [ ] Verify no secrets are exposed (check .env, logs, etc.)
- [ ] Verify OpenRouter usage stays on free models only (if AI is used)
- [ ] Add or improve tests where practical (unit, integration, e2e)
- [ ] Create a release-readiness report
- [ ] Independently review Team 1 and Team 2 work for build safety, test coverage, security
- [ ] Document findings in docs/hermes/verification-report.md
