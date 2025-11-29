#!/bin/bash
# Reusable Discord webhook notification script
# Usage: ./discord-notify.sh "Title" "Description" "color" "webhook_url"

set -e

TITLE="$1"
DESCRIPTION="$2"
COLOR="$3"  # decimal color code (e.g., 3066993 for green, 15158332 for red)
WEBHOOK_URL="$4"

if [ -z "$WEBHOOK_URL" ]; then
    echo "Discord webhook URL not configured - skipping notification"
    exit 0
fi

# Sanitize description - remove potential secrets
SAFE_DESCRIPTION=$(echo "$DESCRIPTION" | sed -E 's/(api[_-]?key|token|secret|password)[[:space:]]*[:=][[:space:]]*[^[:space:]]+/\1=REDACTED/gi')

# Create JSON payload
PAYLOAD=$(cat <<EOF
{
  "embeds": [{
    "title": "$TITLE",
    "description": "$SAFE_DESCRIPTION",
    "color": $COLOR,
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  }]
}
EOF
)

# Send to Discord with timeout and retry
curl -X POST \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  --max-time 10 \
  --retry 2 \
  --retry-delay 1 \
  --silent \
  --show-error \
  "$WEBHOOK_URL" || echo "Warning: Discord notification failed (non-critical)"

exit 0
