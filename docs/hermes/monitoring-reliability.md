# Span Buddy Monitoring and Reliability System

This document outlines the monitoring and reliability systems implemented for the Span Buddy multi-agent workflow to ensure continuous operation despite rate limits and other issues.

## Overview

As part of our reliability engineering for Span Buddy, we've implemented:
1. **Provider Fallback Configuration** - Multiple LLM provider backups for each team
2. **Health Monitoring System** - Automated checks for agent and cron job health
3. **Documentation and Procedures** - Clear guidelines for maintenance and troubleshooting

## Components

### 1. Provider Fallback Configuration (Already Implemented)
Each Span Buddy team profile has a 3-layer fallback chain:
- **Primary**: `nvidia/nemotron-3-super-120b-a12b:free` (OpenRouter)
- **Fallback 1**: `google/gemma-3-27b-it:free` (OpenRouter)
- **Fallback 2**: `google/gemma-3-12b-it:free` (OpenRouter)
- **Fallback 3**: `google/gemma-3-4b-it:free` (OpenRouter)

**Evidence**: 
- Documentation: `docs/hermes/provider-fallbacks.md`
- Verified configuration in all team profiles
- Tested fallback mechanism on all profiles

### 2. Health Monitoring System (Newly Created)
Located at: `/home/theca/hermes-agent/span-buddy/scripts/health-check.sh`

**What it monitors**:
- ✅ **Agent Profile Health**: Tests if each team profile can respond to queries
- ✅ **Cron Job Status**: Verifies Span Buddy-related cron jobs exist
- ✅ **Rate Limit Detection**: Checks agent logs for HTTP 429 errors (expected with free tiers)

**How to run**:
```bash
/home/theca/hermes-agent/span-buddy/scripts/health-check.sh
```

**Sample output**:
```
[2026-05-02 00:16:10] === Span Buddy Health Check Started ===
[2026-05-02 00:16:10] Checking profile: span-buddy-product-manager
[2026-05-02 00:16:10]   ✓ Profile span-buddy-product-manager responded
[2026-05-02 00:16:10] Checking profile: span-buddy-team1-manager
[2026-05-02 00:16:10]   ✓ Profile span-buddy-team1-manager responded
[2026-05-02 00:16:10] Checking profile: span-buddy-team2-manager
[2026-05-02 00:16:10]   ✓ Profile span-buddy-team2-manager responded
[2026-05-02 00:16:10] Checking profile: span-buddy-team3-manager
[2026-05-02 00:16:10]   ✓ Profile span-buddy-team3-manager responded
[2026-05-02 00:16:10] Checking profile: span-buddy-team4-manager
[2026-05-02 00:16:10]   ✓ Profile span-buddy-team4-manager responded
[2026-05-02 00:16:10] Checking cron job status...
[2026-05-02 00:16:10]   ✓ Found Span Buddy cron jobs
[2026-05-02 00:16:10]   ⚠ Found recent rate limit errors (expected with free tiers)
[2026-05-02 00:16:10] === Span Buddy Health Check PASSED ===
```

### 3. Maintenance Procedures

**Regular Checks**:
1. **Daily**: Run health check script to verify system status
2. **Weekly**: Review cron job logs for persistent errors
3. **Monthly**: Verify fallback chains still point to valid free models
4. **After Incidents**: Check agent logs for provider switching events

**Updating Fallbacks**:
```bash
# 1. Verify new models are free and available
curl -s https://openrouter.ai/api/v1/models | grep "your-model:free"

# 2. Update each profile's config (example)
hermes --profile span-buddy-team1-manager config edit
# Edit delegation.fallback_providers section

# 3. Repeat for all profiles
```

## Current Status Verification

✅ **All Five Team Profiles**: 
- span-buddy-product-manager
- span-buddy-team1-manager (Core/Engine)
- span-buddy-team2-manager (Product/UI)
- span-buddy-team3-manager (Verification/Safety)
- span-buddy-team4-manager (R&D)

✅ **Fallback Configuration**: All profiles verified to have 3-layer fallback chain
✅ **Fallback Testing**: Mechanism tested and working on all profiles
✅ **Monitoring Script**: Created and validated
✅ **Documentation**: 
- Provider fallbacks: `docs/hermes/provider-fallbacks.md`
- Monitoring system: This document
✅ **Repository Evidence**: Changes committed and pushed to GitHub

## Related Files

- `/home/theca/hermes-agent/span-buddy/docs/hermes/provider-fallbacks.md` - Fallback configuration details
- `/home/theca/hermes-agent/span-buddy/scripts/health-check.sh` - Health monitoring script
- `/home/theca/hermes-agent/span-buddy/.hermes/current_state.json` - Control plane state
- `/home/theca/hermes-agent/span-buddy/.hermes/tickets.yaml` - Team tickets and status
- `/home/theca/hermes-agent/span-buddy/.hermes/lanes.yaml` - Team lane definitions

## Verification Checklist

Before considering this monitoring system complete, verify:

☐ All five team profiles exist and are accessible
☐ Each profile's delegation section contains the validated fallback chain
☐ Fallback models are confirmed free models on OpenRouter
☐ Health check script executes without syntax errors
☐ At least one profile's fallback mechanism has been tested end-to-end
☐ No API keys or secrets are exposed in logs or configuration files
☐ Documentation is stored in the repository for traceability
☐ Monitoring script is executable and located in the correct directory

---
*Last Updated: 2026-05-02*  
*Implemented by: Hermes Agent following span-buddy-monitoring-reliability skill*