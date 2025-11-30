# Claude Code Integration Guide

## Overview

This project integrates with Claude AI for code reviews in two ways:

1. **Interactive Claude Code**: Use the Claude Code CLI for on-demand assistance
2. **API-based Reviews**: Automated or manual code reviews using Claude API

## Interactive Claude Code (Recommended)

Claude Code is the CLI tool you're using right now. It's designed for interactive development:

```bash
# Navigate to your project
cd /mnt/d/AI/Projects/Lindex

# Claude Code is already running if you're reading this!
# Use it for:
# - Code generation
# - Debugging assistance
# - Architecture discussions
# - Documentation writing
```

## Manual API-based Code Review

For standalone code reviews without the full Claude Code interface:

### Setup

1. Get your Anthropic API key from https://console.anthropic.com/
2. Set environment variable:

```bash
export ANTHROPIC_API_KEY='your-api-key-here'

# Add to ~/.bashrc or ~/.zshrc for persistence:
echo 'export ANTHROPIC_API_KEY="your-api-key"' >> ~/.bashrc
```

3. Install jq (JSON processor):

```bash
sudo apt install jq
```

### Usage

```bash
# Stage your changes
git add .

# Run manual review
./claude-review.sh

# Follow the prompts
```

## Automated Pre-commit Review (Optional)

To enable automated Claude review on every commit:

1. Edit `.git/hooks/pre-commit`
2. Uncomment the Claude review section (lines with `# if [ -n "$ANTHROPIC_API_KEY" ]...`)
3. Ensure ANTHROPIC_API_KEY is exported in your shell environment

**Warning**: This will slow down commits and consume API credits. Only enable if you want strict review gates.

## Network Backup

Every time you `git push`, the project is automatically backed up to:
`\\Mottomo_takai\AI Obsidian\AI Application backups\Lindex`

Backup logs are saved to `.backup.log` in your project root.

### Manual Backup

```bash
# Trigger backup manually (without pushing)
.git/hooks/post-push
```

### Verify Backup

```bash
# Check backup log
cat /mnt/d/AI/Projects/Lindex/.backup.log
```

## Best Practices

1. **For development questions**: Use Claude Code interactively (you're in it now!)
2. **For commit reviews**: Use `./claude-review.sh` before committing
3. **For CI/CD**: GitHub Actions already runs automated checks on PRs
4. **For backups**: Just `git push` - it happens automatically

## Troubleshooting

### "ANTHROPIC_API_KEY not set"

```bash
# Verify it's set
echo $ANTHROPIC_API_KEY

# If empty, export it
export ANTHROPIC_API_KEY='your-key'
```

### Network backup failing

Check `.backup.log` for robocopy errors. Common issues:

- Network share not accessible from Windows
- Permissions issues
- Network path incorrect

Test manually:

```bash
powershell.exe -Command "Test-Path '\\\\Mottomo_takai\\AI Obsidian\\AI Application backups'"
```

### Line ending issues (Git showing all files as modified)

```bash
# Reset line endings
git rm -rf --cached .
git add .
git commit -m "Normalize line endings"
```
