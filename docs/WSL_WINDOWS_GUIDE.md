# WSL + Windows Development Guide

## Overview

This guide explains how to work on your project using the hybrid WSL + Windows environment you've set up.

## Architecture

### Path Mapping

| Environment | Path | Usage |
|------------|------|-------|
| Windows | `D:\AI\Projects\Lindex` | Primary storage, Cursor access |
| WSL | `/mnt/d/AI/Projects/Lindex` | Command-line operations, Git, scripts |
| Network Backup | `\\Mottomo_takai\AI Obsidian\AI Application backups\Lindex` | Automatic backup on push |

### Why This Setup?

**Carlos (Software):** Windows path as primary ensures Cursor (Windows app) has native file access with no translation overhead. Line ending configuration (`.gitattributes`) prevents CRLF/LF conflicts.

**Nathaniel (DevOps):** Git operations use Windows Git (git.exe) for performance. WSL provides bash scripting capabilities. Post-push hook triggers robocopy for reliable incremental backups.

**James (Security):** Network credentials managed by Windows Credential Manager. Backup excludes sensitive files (.env). API keys stored in WSL environment variables, not in repository.

## Daily Workflow

### Starting Development

```bash
# 1. Open WSL terminal
cd /mnt/d/AI/Projects/Lindex

# 2. Open Cursor (from Windows Start menu or desktop)
# File > Open Folder > D:\AI\Projects\Lindex

# 3. Create feature branch
git checkout -b feature/my-new-feature
```

### Making Changes

```bash
# 1. Edit files in Cursor (Windows path: D:\AI\Projects\Lindex)

# 2. Check status from WSL
cd /mnt/d/AI/Projects/Lindex
git status

# 3. Stage changes
git add .

# 4. Optional: Run manual Claude review
./claude-review.sh

# 5. Commit (triggers pre-commit hooks automatically)
git commit -m "Add new feature"

# 6. Push (triggers automatic network backup)
git push origin feature/my-new-feature
```

### What Happens Automatically

1. **Pre-commit Hook Runs:**
   - Linting (ESLint, Prettier, etc. via pre-commit framework)
   - Secret detection
   - Code formatting checks
   - **Note:** Claude AI review NOT automated by default (too slow, costs API credits)

2. **Post-push Hook Runs:**
   - Robocopy mirrors project to `\\Mottomo_takai\AI Obsidian\AI Application backups\Lindex`
   - Excludes: node_modules, .git, .env, logs, build artifacts
   - Logs to `.backup.log` in project root

## Claude Code Integration

### Interactive Claude Code (Current Session)

You're using Claude Code right now! It's an interactive CLI tool for development assistance.

**Use it for:**
- Generating code
- Debugging
- Architecture discussions
- Writing documentation
- Explaining complex code

**NOT for:**
- Automated pre-commit reviews (use API script instead)
- CI/CD pipelines (use GitHub Actions)

### Manual API-based Review

For standalone code reviews:

```bash
# 1. Set API key (one-time setup)
export ANTHROPIC_API_KEY='sk-ant-...'
echo 'export ANTHROPIC_API_KEY="sk-ant-..."' >> ~/.bashrc

# 2. Install jq (one-time setup)
sudo apt install jq

# 3. Stage changes
git add .

# 4. Run review
./claude-review.sh

# 5. Review output, then commit or make changes
```

### Automated Pre-commit Review (Optional)

To enable Claude API review on every commit:

1. Edit `.git/hooks/pre-commit`
2. Uncomment lines 20-23 (Claude API section)
3. Ensure `ANTHROPIC_API_KEY` is exported

**Warning:** This will:
- Slow down every commit (API latency)
- Consume API credits
- Block commits if API is down

**Recommendation:** Use manual review (`./claude-review.sh`) only when needed.

## Network Backup Details

### How It Works

```
git push origin main
    ↓
post-push hook triggered
    ↓
PowerShell executes robocopy
    ↓
D:\AI\Projects\Lindex → \\Mottomo_takai\...\Lindex
    ↓
Backup log written to .backup.log
```

### Verify Backup

```bash
# Check backup log
cat /mnt/d/AI/Projects/Lindex/.backup.log

# Verify files via PowerShell
powershell.exe -Command "Get-ChildItem '\\\\Mottomo_takai\\AI Obsidian\\AI Application backups\\Lindex'"
```

### Manual Backup

```bash
# Trigger backup without pushing
cd /mnt/d/AI/Projects/Lindex
.git/hooks/post-push
```

### Excluded from Backup

- `node_modules/` - Dependencies (restored via package manager)
- `.git/` - Version control (GitHub is the source of truth)
- `.venv/`, `__pycache__/` - Python artifacts
- `dist/`, `build/`, `.next/` - Build outputs
- `.env`, `.env.local` - Secrets
- `*.log` - Log files
- `.DS_Store` - macOS artifacts

## Git Configuration

### Line Endings (CRITICAL)

The `.gitattributes` file enforces LF line endings:

```
* text=auto eol=lf
*.bat text eol=crlf
*.ps1 text eol=crlf
*.sh text eol=lf
```

**Why:** Prevents Git from showing all files as modified when switching between WSL and Windows tools.

### Git Commands

Always use Windows Git (git.exe) for best compatibility:

```bash
# Automatic (setup script configures this)
git.exe status
git.exe add .
git.exe commit -m "Message"

# Or just use 'git' - WSL will find git.exe first
git status
```

## Troubleshooting

### "All files show as modified" in Git

**Cause:** Line ending mismatch (CRLF vs LF)

**Solution:**
```bash
cd /mnt/d/AI/Projects/Lindex

# Refresh Git index with correct line endings
git rm -rf --cached .
git add .
git commit -m "Normalize line endings"
```

### Network backup failing

**Check 1:** Network accessible?
```bash
powershell.exe -Command "Test-Path '\\\\Mottomo_takai\\AI Obsidian\\AI Application backups'"
# Should output: True
```

**Check 2:** Permissions
```bash
# Try creating a test file
powershell.exe -Command "New-Item -ItemType File -Path '\\\\Mottomo_takai\\AI Obsidian\\AI Application backups\\test.txt'"
```

**Check 3:** Review backup log
```bash
tail -20 /mnt/d/AI/Projects/Lindex/.backup.log
```

**Common issues:**
- Network share not mounted
- Credentials expired (re-connect via Windows Explorer)
- Server offline
- Path typo

### Claude review script fails

**Error: "ANTHROPIC_API_KEY not set"**
```bash
# Check if set
echo $ANTHROPIC_API_KEY

# Set it
export ANTHROPIC_API_KEY='your-key'

# Make permanent
echo 'export ANTHROPIC_API_KEY="your-key"' >> ~/.bashrc
source ~/.bashrc
```

**Error: "jq: command not found"**
```bash
sudo apt update
sudo apt install jq
```

**Error: "curl: failed to connect"**
- Check internet connection
- Verify API key is valid
- Check Anthropic API status: https://status.anthropic.com

### Cursor can't find files

**Cause:** Opened wrong path

**Solution:**
- Close Cursor
- File > Open Folder > `D:\AI\Projects\Lindex` (NOT `/mnt/d/...`)
- Use Windows path, not WSL path

### Pre-commit hooks not running

```bash
cd /mnt/d/AI/Projects/Lindex

# Reinstall hooks
pre-commit install

# Test manually
pre-commit run --all-files
```

## Performance Optimization

### DO:
- Use Windows Git (git.exe) - faster on Windows filesystem
- Open project in Cursor via Windows path (`D:\...`)
- Run build tools from WSL if they're Linux-native
- Store large node_modules on Windows side

### DON'T:
- Mix WSL and Windows Git on same repo (pick one)
- Edit files in WSL while Cursor is open (file watch issues)
- Store project in WSL filesystem (`/home/...`) and access from Windows (slow)

## Security Best Practices

### API Keys

**DO:**
```bash
# Store in environment variable
export ANTHROPIC_API_KEY='sk-ant-...'
echo 'export ANTHROPIC_API_KEY="sk-ant-..."' >> ~/.bashrc
```

**DON'T:**
```bash
# Hard-code in scripts
ANTHROPIC_API_KEY='sk-ant-...'  # ❌ NEVER DO THIS
```

### .env Files

**DO:**
```bash
# Keep .env in .gitignore
# Never commit secrets
# Use .env.example for templates
```

**DON'T:**
```bash
# Commit .env to Git
git add .env  # ❌ NEVER DO THIS
```

### Network Backup

- `.env` files are excluded from backup
- Backup location should have restricted access
- Regularly audit backup logs for errors

## Advanced: Custom Backup Schedule

If you want scheduled backups instead of on-push:

### Option 1: Windows Task Scheduler

1. Create `backup-task.ps1`:
```powershell
robocopy "D:\AI\Projects\Lindex" "\\Mottomo_takai\AI Obsidian\AI Application backups\Lindex" /MIR /R:3 /W:5 /XD node_modules .git .venv /XF .env *.log
```

2. Task Scheduler > Create Basic Task:
   - Trigger: Daily at 6 PM
   - Action: Start Program
   - Program: `powershell.exe`
   - Arguments: `-File D:\AI\Projects\Lindex\backup-task.ps1`

### Option 2: WSL Cron

1. Create backup script in project
2. Add to crontab:
```bash
crontab -e

# Add line (backup every hour)
0 * * * * cd /mnt/d/AI/Projects/Lindex && ./.backup-script.sh
```

**Note:** Post-push hook is recommended - only backs up when you've made progress worth pushing.

## Quick Reference

### Common Commands

```bash
# Navigate to project
cd /mnt/d/AI/Projects/Lindex

# Check Git status
git status

# Manual Claude review
./claude-review.sh

# Manual backup
.git/hooks/post-push

# View backup log
tail -f .backup.log

# Run pre-commit checks manually
pre-commit run --all-files

# Open Cursor from command line
/mnt/c/Users/YourUsername/AppData/Local/Programs/cursor/Cursor.exe "D:\AI\Projects\Lindex"
```

### File Locations

| File | Purpose |
|------|---------|
| `.git/hooks/pre-commit` | Runs before each commit |
| `.git/hooks/post-push` | Runs after successful push (backup) |
| `.backup.log` | Backup operation log |
| `.gitattributes` | Line ending configuration |
| `claude-review.sh` | Manual AI code review |
| `docs/CLAUDE_INTEGRATION.md` | Claude integration details |

## FAQ

**Q: Can I use VS Code instead of Cursor?**
A: Yes! Open `D:\AI\Projects\Lindex` in VS Code. Use the WSL extension for terminal access.

**Q: Do I need to run setup-wsl.sh every time?**
A: No, only once per project. It creates the project structure and hooks.

**Q: What if I forget to push and lose local changes?**
A: Network backup only runs on push. Use `git commit` frequently, then push when ready. Consider enabling Git auto-backup in Cursor settings.

**Q: Can I disable network backup?**
A: Yes, delete `.git/hooks/post-push` or rename it to `post-push.disabled`.

**Q: Is Claude Code free?**
A: Interactive Claude Code (CLI) requires Anthropic API access. API-based reviews consume tokens (cost). Check pricing at https://www.anthropic.com/pricing.

**Q: Should I use automated pre-commit Claude review?**
A: Not recommended for most workflows. Use manual review (`./claude-review.sh`) only when needed. GitHub Actions PR review is better for CI/CD.

## Support

- Template issues: Check README.md
- WSL issues: `wsl --help` or Microsoft WSL docs
- Git issues: `git help <command>`
- Claude API: https://docs.anthropic.com/
- Cursor: https://cursor.sh/docs

---

**Last Updated:** 2025-11-29
**Template Version:** 1.0.0-wsl
