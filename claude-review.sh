#!/bin/bash

# Manual Claude Code Review Script
# Run this to get AI-powered code review using Claude API

set -e

# Check for API key
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "Error: ANTHROPIC_API_KEY environment variable not set"
    echo ""
    echo "Set it with:"
    echo "  export ANTHROPIC_API_KEY='your-api-key'"
    echo "  Or add to ~/.bashrc or ~/.zshrc"
    exit 1
fi

# Get list of changed files
CHANGED_FILES=$(git diff --name-only --cached)

if [ -z "$CHANGED_FILES" ]; then
    echo "No staged changes to review"
    exit 0
fi

echo "Files to review:"
echo "$CHANGED_FILES"
echo ""

# Get the diff
DIFF_CONTENT=$(git diff --cached)

# Create review prompt
REVIEW_PROMPT="Please review the following code changes for:
1. Code quality and best practices
2. Potential bugs or security issues
3. Performance concerns
4. Documentation needs

Git diff:
$DIFF_CONTENT"

echo "Sending to Claude API for review..."

# Call Claude API using curl
RESPONSE=$(curl -s https://api.anthropic.com/v1/messages \
    -H "Content-Type: application/json" \
    -H "x-api-key: $ANTHROPIC_API_KEY" \
    -H "anthropic-version: 2023-06-01" \
    -d "{
        \"model\": \"claude-sonnet-4-5-20250929\",
        \"max_tokens\": 4096,
        \"messages\": [{
            \"role\": \"user\",
            \"content\": $(echo "$REVIEW_PROMPT" | jq -Rs .)
        }]
    }")

# Extract and display the review
echo ""
echo "=== Claude Code Review ==="
echo "$RESPONSE" | jq -r '.content[0].text'
echo ""

# Ask if user wants to proceed with commit
read -p "Proceed with commit? (y/n): " PROCEED
if [[ ! "$PROCEED" =~ ^[Yy]$ ]]; then
    echo "Commit cancelled"
    exit 1
fi
