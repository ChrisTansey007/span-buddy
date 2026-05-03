#!/bin/bash
# Span Buddy Health Check Script
# Simple version that just checks if profiles respond

set -euo pipefail

LOG_FILE="/home/theca/hermes-agent/span-buddy/logs/health-check.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

log() {
    echo "[$TIMESTAMP] $1" | tee -a "$LOG_FILE"
}

# Simple test - just see if we can get a response
profiles=(
    "span-buddy-product-manager"
    "span-buddy-team1-manager"
    "span-buddy-team2-manager"
    "span-buddy-team3-manager"
    "span-buddy-team4-manager"
)

log "=== Span Buddy Health Check Started ==="

all_healthy=0

for profile in "${profiles[@]}"; do
    log "Checking profile: $profile"
    # Just try to get any response - don't worry about content
    if output=$(hermes --profile "$profile" chat -q "test" 2>&1); then
        log "  ✓ Profile $profile responded"
    else
        log "  ❌ Profile $profile failed: $output"
        all_healthy=1
    fi
done

# Check cron jobs briefly
log "Checking cron job status..."
if hermes cron list | grep -q "span-buddy"; then
    log "  ✓ Found Span Buddy cron jobs"
else
    log "  ⚠ No Span Buddy cron jobs found"
fi

# Check for rate limits in logs
if grep -i "rate.*limit\|429" /home/theca/.hermes/logs/agent.log 2>/dev/null | head -5 > /dev/null; then
    log "  ⚠ Found recent rate limit errors (expected with free tiers)"
else
    log "  ✓ No recent rate limit errors"
fi

if [ $all_healthy -eq 0 ]; then
    log "=== Span Buddy Health Check PASSED ==="
else
    log "=== Span Buddy Health Check FAILED ==="
fi

exit $all_healthy