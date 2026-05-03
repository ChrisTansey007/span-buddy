#!/bin/bash
# Span Buddy Lane Launcher Script
# Automates launching eligible lanes based on control plane state

set -euo pipefail

LOG_FILE="/home/theca/hermes-agent/span-buddy/logs/lane-launcher.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

log() {
    echo "[$TIMESTAMP] $1" | tee -a "$LOG_FILE"
}

log "=== Span Buddy Lane Launcher Started ==="

# First, reconcile to get latest state
log "Running control plane reconciliation..."
cd /home/theca/hermes-agent/span-buddy
pnpm hermes:reconcile > /dev/null 2>&1

# Get list of lanes from lanes.yaml - lines that start with two spaces, then letters/underscores, then colon
# Remove carriage returns to handle Windows line endings
LANES=$(grep '^  [a-z_][a-z0-9_]*:$' .hermes/lanes.yaml | sed 's/^  //;s/:$//' | tr -d '\r')

for LANE in $LANES; do
    log "Checking lane: $LANE"
    # Get active ticket for this lane
    TICKET=$(grep -A2 "$LANE:" .hermes/lanes.yaml | grep "active_ticket:" | awk '{print $2}' | tr -d '\r')
    if [ -z "$TICKET" ]; then
        log "  No active ticket found for lane $LANE"
        continue
    fi
    log "  Active ticket: $TICKET"
    # Get ticket state
    STATE=$(grep -A2 "$TICKET:" .hermes/tickets.yaml | grep "state:" | awk '{print $2}' | tr -d '\r')
    log "  Ticket state: $STATE"
    if [ "$STATE" = "ready" ]; then
        log "  -> Ticket is READY"
        # Get manager profile
        PROFILE=$(grep -A2 "$LANE:" .hermes/lanes.yaml | grep "manager_profile:" | awk '{print $2}' | tr -d '\r')
        WORKTREE=$(grep -A2 "$LANE:" .hermes/lanes.yaml | grep "default_worktree:" | awk '{print $2}' | tr -d '\r')
        BRANCH=$(grep -A2 "$LANE:" .hermes/lanes.yaml | grep "default_branch:" | awk '{print $2}' | tr -d '\r')
        log "  Manager profile: $PROFILE"
        log "  Worktree: $WORKTREE"
        log "  Branch: $BRANCH"
        
        # Check if agent is already running for this profile
        RUNNING=$(ps aux | grep "hermes chat.*--profile $PROFILE" | grep -v grep)
        if [ -z "$RUNNING" ]; then
            log "  -> No agent running for profile $PROFILE, launching..."
            
            # Change to worktree
            WORKTREE_PATH="/home/theca/hermes-agent/span-buddy$WORKTREE"
            log "  Worktree path: $WORKTREE_PATH"
            if [ -d "$WORKTREE_PATH" ]; then
                cd "$WORKTREE_PATH"
                log "  Changed to worktree"
                
                # Ensure we're on the correct branch
                CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
                log "  Current branch: $CURRENT_BRANCH"
                if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
                    log "  Checking out branch: $BRANCH"
                    git checkout "$BRANCH"
                fi
                
                # Get ticket summary for prompt
                PROMPT=$(grep -A2 "$TICKET:" /home/theca/hermes-agent/span-buddy/.hermes/tickets.yaml | grep "summary:" | sed 's/summary: //' | sed 's/^ *//' | tr -d '\r')
                if [ -z "$PROMPT" ]; then
                    PROMPT="Work on ticket $TICKET for lane $LANE"
                fi
                log "  Prompt: $PROMPT"
                
                # Launch the agent in the background using nohup, logging to a file
                LOG_FILE_AGENT="/home/theca/hermes-agent/span-buddy/logs/agent-$LANE-$(date +%s).log"
                log "  Launching agent, logging to $LOG_FILE_AGENT"
                nohup hermes --profile "$PROFILE" chat "$PROMPT" > "$LOG_FILE_AGENT" 2>&1 &
                AGENT_PID=$!
                log "  Agent launched with PID: $AGENT_PID"
                
                # Wait a moment
                sleep 3
                
                # Verify it's running
                RUNNING_NOW=$(ps aux | grep "hermes chat.*--profile $PROFILE" | grep -v grep)
                if [ -n "$RUNNING_NOW" ]; then
                    log "  ✓ Agent confirmed running"
                else
                    log "  ⚠ Agent may not have started properly"
                fi
                
                # Return to project root
                cd /home/theca/hermes-agent/span-buddy
            else
                log "  ❌ Worktree $WORKTREE_PATH does not exist"
            fi
        else
            log "  -> Agent for profile $PROFILE is already running:"
            log "$RUNNING"
        fi
    else
        log "  -> Ticket not ready (state: $STATE), skipping"
    fi
    log ""
done

log "=== Span Buddy Lane Launcher Complete ==="
exit 0