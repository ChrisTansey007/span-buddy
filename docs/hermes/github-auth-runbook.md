# GitHub Auth Runbook for Span Buddy Hermes Profiles

Purpose: let manager/product-manager profiles commit and push correctly from WSL without storing or exposing GitHub credentials in profile files.

## Current credential model

- Hermes profiles are isolated runtime configs under `~/.hermes/profiles/<profile>/`.
- The Span Buddy profiles do **not** each store a GitHub token or `.env` secret.
- GitHub credentials live in the Windows GitHub CLI keyring and must never be copied into repository docs, prompts, logs, or profile configs.
- WSL `gh auth status` may show unauthenticated because Windows Credential Manager is not visible inside WSL.
- Use the Windows `gh` CLI from WSL via `powershell.exe` when GitHub credentials are needed.

## Correct push procedure from WSL

Use this procedure for manager/product-manager push operations:

1. Verify repository state:
   ```bash
   git status --short --branch
   git remote -v
   git log --oneline -3
   ```

2. Commit only intended files:
   ```bash
   git add <paths>
   git commit -m "type: concise message"
   ```

3. Push using the Windows GitHub CLI credential bridge. Do **not** print tokens.

   For ordinary Span Buddy pushes, use the `ChrisTansey007` account:
   ```bash
   TOKEN=$(powershell.exe -NoProfile -Command "gh auth switch -u ChrisTansey007 *> $null; gh auth token" | tr -d '
')
   AUTH=$(printf 'x-access-token:%s' "$TOKEN" | base64 -w0)
   git -c http.https://github.com/.extraheader="AUTHORIZATION: basic $AUTH" push origin HEAD
   unset TOKEN AUTH
   ```

   If pushing commits that create or modify `.github/workflows/*`, switch to the account/token with `workflow` scope before pushing:
   ```bash
   TOKEN=$(powershell.exe -NoProfile -Command "gh auth switch -u TheCarpenter73 *> $null; gh auth token" | tr -d '
')
   AUTH=$(printf 'x-access-token:%s' "$TOKEN" | base64 -w0)
   git -c http.https://github.com/.extraheader="AUTHORIZATION: basic $AUTH" push origin HEAD
   unset TOKEN AUTH
   ```

4. Verify remote ref after push:
   ```bash
   git status --short --branch
   git ls-remote origin refs/heads/$(git branch --show-current)
   git log --oneline -1
   ```

## Safety rules

- Never write raw tokens to files, docs, prompts, commit messages, or summaries.
- Never set `origin` to a token-bearing URL.
- Never print the token, `AUTH` header, or full command with expanded secrets.
- Summaries must say `[REDACTED]` for any credential material.
- If a push fails, capture the error text but redact any secret-looking value before writing logs.
- Before committing, scan changed docs/artifacts for likely secrets.

## Known account scopes

- `ChrisTansey007`: repo-capable for normal Span Buddy repository writes.
- `TheCarpenter73`: includes `workflow` scope; use for workflow-file pushes if needed.

This runbook describes credential use only. It does not grant credentials to profiles by itself; the credentials remain in the Windows keyring.
