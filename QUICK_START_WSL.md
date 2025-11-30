# Quick Start: WSL Setup

## TL;DR - Run This Now

```bash
# From WSL terminal (you should already be here)
cd /home/nstephenson/hub/project-template
bash setup-wsl.sh
```

This will:

1. Create project at `D:\AI\Projects\Lindex`
2. Set up Git with Windows compatibility
3. Install automated network backup (triggers on `git push`)
4. Configure Claude Code integration scripts
5. Set up pre-commit hooks

**Time:** ~2-3 minutes

---

## What You Get

### Project Location

- **Windows path:** `D:\AI\Projects\Lindex` (use in Cursor)
- **WSL path:** `/mnt/d/AI/Projects/Lindex` (use in terminal)

### Automatic Backups

- **Trigger:** Every `git push`
- **Destination:** `\\Mottomo_takai\AI Obsidian\AI Application backups\Lindex`
- **Log:** `.backup.log` in project root

### Claude Code Reviews

- **Interactive (this CLI):** Already working - you're using it now!
- **Manual API reviews:** Run `./claude-review.sh` before commits
- **Automated:** NOT enabled by default (costs API credits, slows commits)

---

## After Setup: Next Steps

### 1. Configure Claude API (Optional)

Only needed for `claude-review.sh` script:

```bash
# Get API key from: https://console.anthropic.com/
export ANTHROPIC_API_KEY='sk-ant-api03-...'

# Make permanent:
echo 'export ANTHROPIC_API_KEY="sk-ant-api03-..."' >> ~/.bashrc

# Install jq (JSON processor for script):
sudo apt install jq
```

### 2. Create GitHub Repository

```bash
cd /mnt/d/AI/Projects/Lindex

# Using GitHub CLI (recommended):
gh auth login
gh repo create Lindex --private --source=. --remote=origin

# Or manually:
# 1. Go to https://github.com/new
# 2. Create repo named "Lindex"
# 3. Run:
git remote add origin git@github.com:YOUR_USERNAME/Lindex.git
```

### 3. First Commit and Push

```bash
cd /mnt/d/AI/Projects/Lindex

git add .
git commit -m "Initial commit"
git push -u origin main

# Network backup runs automatically after push!
# Check: tail .backup.log
```

### 4. Open in Cursor

1. Open Cursor (Windows Start menu)
2. File > Open Folder
3. Navigate to: `D:\AI\Projects\Lindex`
4. Start coding!

---

## Daily Workflow

```bash
# 1. Open project in terminal
cd /mnt/d/AI/Projects/Lindex

# 2. Open Cursor (Windows): D:\AI\Projects\Lindex

# 3. Create feature branch
git checkout -b feature/my-feature

# 4. Make changes in Cursor

# 5. Stage and commit
git add .
git commit -m "Add my feature"

# 6. Push (triggers automatic backup)
git push origin feature/my-feature
```

### Optional: Manual Code Review

```bash
# Before committing, get Claude's opinion:
git add .
./claude-review.sh

# Read review, then decide to commit or revise
git commit -m "Add feature (reviewed by Claude)"
```

---

## Verify Everything Works

### Test 1: Project Location

```bash
# Should show project files:
ls /mnt/d/AI/Projects/Lindex
```

### Test 2: Git Status

```bash
cd /mnt/d/AI/Projects/Lindex
git status
# Should show: "On branch main" or similar
```

### Test 3: Network Backup Path

```bash
# Should output "True":
powershell.exe -Command "Test-Path '\\\\Mottomo_takai\\AI Obsidian\\AI Application backups'"
```

### Test 4: Pre-commit Hooks

```bash
cd /mnt/d/AI/Projects/Lindex
ls -la .git/hooks/

# Should see:
# - pre-commit (executable)
# - post-push (executable)
```

---

## Troubleshooting

### Setup script fails on "D: drive not accessible"

**Fix:**

```bash
# Check if /mnt/d exists:
ls /mnt/d

# If not, enable automount:
sudo nano /etc/wsl.conf

# Add:
[automount]
enabled = true

# Restart WSL:
# (From Windows PowerShell)
wsl --shutdown
# Then reopen WSL terminal
```

### Network backup path not accessible

**Fix:**

1. Open Windows Explorer
2. Navigate to: `\\Mottomo_takai\AI Obsidian\AI Application backups`
3. Enter credentials if prompted
4. Windows will save credentials
5. Re-run setup script

### Git shows all files as modified

**Fix:**

```bash
cd /mnt/d/AI/Projects/Lindex
git config core.autocrlf false
git config core.eol lf
git rm -rf --cached .
git add .
git commit -m "Normalize line endings"
```

---

## Key Files Reference

| File                         | Purpose                          |
| ---------------------------- | -------------------------------- |
| `setup-wsl.sh`               | Initial project setup (run once) |
| `claude-review.sh`           | Manual AI code review            |
| `.git/hooks/pre-commit`      | Runs before each commit          |
| `.git/hooks/post-push`       | Backs up to network after push   |
| `.backup.log`                | Backup operation log             |
| `docs/WSL_WINDOWS_GUIDE.md`  | Complete documentation           |
| `docs/CLAUDE_INTEGRATION.md` | Claude API details               |

---

## Don't Want Automatic Backups?

### Disable Post-Push Backup

```bash
cd /mnt/d/AI/Projects/Lindex
mv .git/hooks/post-push .git/hooks/post-push.disabled
```

### Manual Backup Only

```bash
# Trigger backup manually:
.git/hooks/post-push.disabled
```

---

## Questions?

1. **Full documentation:** `docs/WSL_WINDOWS_GUIDE.md`
2. **Claude integration:** `docs/CLAUDE_INTEGRATION.md`
3. **Workflow guide:** `docs/WORKFLOW.md`
4. **GitHub Actions:** `.github/workflows/ci.yml`

---

**Ready to start?**

```bash
bash setup-wsl.sh
```
