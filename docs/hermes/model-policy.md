# Model Policy

Span Buddy uses OpenRouter free models unless explicitly changed by the owner.
The control plane records `free-router-model` as the baseline assigned model
until a specific free model is validated and pinned.

## Free-capacity rules

- Do not blast-launch all managers.
- Run one or two active model jobs at a time.
- Use staggered launches and backoff on rate limits.
- Use small bounded prompts and resume summaries instead of full-context reloads.
- Never auto-fallback to paid models.
- Log model decisions and rate-limit incidents in `.hermes/events.jsonl`.
