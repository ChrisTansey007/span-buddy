# Provider Fallback Configuration for Span Buddy Teams

This document outlines the LLM provider fallback configuration for all Span Buddy Hermes Agent profiles to ensure reliability in multi-agent workflows.

## Overview

As part of our reliability engineering, each Span Buddy team profile is configured with a fallback chain of LLM providers. This ensures that if the primary provider experiences issues (rate limits, outages, etc.), agents automatically switch to backup providers without manual intervention.

## Configuration Evidence

All team profiles have been verified to contain the following delegation configuration:

```yaml
delegation:
  provider: openrouter
  model: nvidia/nemotron-3-super-120b-a12b:free
  fallback_providers:
    - provider: openrouter
      model: google/gemma-3-27b-it:free
    - provider: openrouter
      model: google/gemma-3-12b-it:free
    - provider: openrouter
      model: google/gemma-3-4b-it:free
```

## Profile-Specific Status

### ✅ span-buddy-product-manager
- **Purpose**: Oversees product vision, requirements, prioritization
- **Primary Model**: `nvidia/nemotron-3-super-120b-a12b:free` (OpenRouter)
- **Fallback Chain**: 
  1. `google/gemma-3-27b-it:free` (OpenRouter)
  2. `google/gemma-3-12b-it:free` (OpenRouter)
  3. `google/gemma-3-4b-it:free` (OpenRouter)
- **Verification**: Configuration verified via `hermes --profile span-buddy-product-manager config show`

### ✅ span-buddy-team1-manager (Core/Engine)
- **Purpose**: Handles calculation logic, schemas, result contracts, engine correctness
- **Primary Model**: `nvidia/nemotron-3-super-120b-a12b:free` (OpenRouter)
- **Fallback Chain**: Same as above
- **Verification**: Configuration verified and fallback tested (see test logs)

### ✅ span-buddy-team2-manager (Product/UI)
- **Purpose**: Manages user flow, forms, display, mobile usability, accessibility, safe wording
- **Primary Model**: `nvidia/nemotron-3-super-120b-a12b:free` (OpenRouter)
- **Fallback Chain**: Same as above
- **Verification**: Configuration verified via `hermes --profile span-buddy-team2-manager config show`

### ✅ span-buddy-team3-manager (Verification/Safety)
- **Purpose**: Runs tests, lint, build, security, liability wording, independent verification
- **Primary Model**: `nvidia/nemotron-3-super-120b-a12b:free` (OpenRouter)
- **Fallback Chain**: Same as above
- **Verification**: Configuration verified via `hermes --profile span-buddy-team3-manager config show`

### ✅ span-buddy-team4-manager (R&D)
- **Purpose**: Conducts research spikes, source mapping, feasibility notes, candidate ticket creation
- **Primary Model**: `nvidia/nemotron-3-super-120b-a12b:free` (OpenRouter)
- **Fallback Chain**: Same as above
- **Verification**: Configuration verified via `hermes --profile span-buddy-team4-manager config show`

## Fallback Testing Evidence

Fallback mechanism was tested on `span-buddy-team1-manager` profile:

1. **Test Setup**: Temporarily set primary model to non-existent `non-existent-model:123b`
2. **Execution**: Ran simple query "What is 2+2?"
3. **Result**: Agent successfully responded "2 + 2 equals 4." using first available fallback
4. **Verification**: Logs confirmed provider switching occurred
5. **Restoration**: Primary model restored to `nvidia/nemotron-3-super-120b-a12b:free`

## Credential Management

All profiles share the same credential pool which contains:
- **OpenRouter**: Two API keys (one environment variable, one manual)
  - Both keys currently show rate-limited status with retry timers
  - Credential pool automatically rotates between available keys
- **Validation**: `hermes auth list` confirms credentials are stored and managed

## Maintenance Procedures

### Regular Checks
1. **Monthly**: Verify fallback chains still point to valid free models
2. **Quarterly**: Test fallback mechanism on each profile
3. **After Incidents**: Review agent logs for provider switching events

### Updating Fallbacks
To update fallback models for all profiles:
```bash
# 1. Verify new models are free and available
curl -s https://openrouter.ai/api/v1/models | grep "your-model:free"

# 2. Update each profile's config (example for team1)
hermes --profile span-buddy-team1-manager config edit
# Edit delegation.fallback_providers section

# 3. Repeat for all profiles
```

## Related Documentation
- [Span Buddy Agent Onboarding](./AGENTS.md) - General agent guidelines
- [Team Management Procedures](./team-management.md) - Oversight workflows
- [Control Plane Documentation](./resume-runbook.md) - System state management
- [Provider Configuration Guide](https://hermes-agent.nousresearch.com/docs/integrations/providers/) - Official Hermes docs

## Verification Checklist

Before considering this configuration complete, verify:

☐ All five team profiles exist and are configured  
☐ Each profile's delegation section contains the fallback chain  
☐ Fallback models are verified free models on OpenRouter  
☐ At least one profile's fallback mechanism has been tested  
☐ No API keys or secrets are exposed in logs or configuration files  
☐ This document is stored in the repository for traceability  

---
*Last Updated: 2026-05-01*  
*Configured by: Hermes Agent following provider-fallback-configuration skill*