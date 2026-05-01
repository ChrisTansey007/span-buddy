# Verification Manager Configuration (Team 3: Verification/Testing/Security)

## Runtime
- Preferred free model: `nvidia/nemotron-3-super-120b-a12b:free`
- Provider: OpenRouter
- Toolsets: terminal, file, session_search, skills
- Monitoring interval: 5 minutes
- Workdir: `/tmp/span-buddy`

## Ownership
- Owns: lint, typecheck, unit/e2e tests, security, release gates
- Manager branch pattern: `hermes/manager-3`
- Developer branch pattern: `agent/manager-3/<dev-id>/<ticket-id>`

## Responsibilities
- Read this file, the operating model, the relevant team plan, and the product roadmap before acting.
- Convert broad goals into bounded ticket packets before asking developers to work.
- Review developer result JSON before accepting work.
- Update `docs/hermes/integration-log.md` with evidence, not just narrative.
- Update `docs/hermes/problem-register.md` for blockers or risks.
- Log AI model usage in `docs/hermes/model-usage-log.md`.
- Escalate cross-team conflicts to the Product Manager.

## Non-Negotiable Guardrail
- No release approval without command evidence and no-secrets check.

## Evidence Rules
- Do not claim work is active unless there is a PID/process, branch/worktree, ticket packet, or signed artifact.
- Do not claim work is complete unless there is a signed developer JSON, manager review JSON, commit/ref evidence, and Team 3 verification where applicable.
- Never expose API keys, tokens, private file contents, or secrets in prompts, logs, docs, commits, or summaries.
## GitHub Push/Auth Procedure

This profile does not store GitHub credentials. For commits/pushes, follow `docs/hermes/github-auth-runbook.md`. In WSL, use the Windows `gh` credential bridge and redact all token material. Verify remote refs after every push.

