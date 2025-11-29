# Project Template - WSL Edition

## Overview

This is a production-ready project template optimized for WSL (Windows Subsystem for Linux) development with:

- **Hybrid WSL + Windows workflow** - Best of both worlds
- **Cursor IDE integration** - Native Windows file access
- **Automatic network backups** - Triggered on every `git push`
- **Claude Code integration** - AI-powered code reviews
- **Pre-commit hooks** - Quality gates before commits
- **GitHub Actions CI/CD** - Automated testing and deployment

## Quick Start

```bash
# Run setup script (one-time)
cd /home/nstephenson/hub/project-template
bash setup-wsl.sh
```

**Time:** 2-3 minutes

**Result:** Project created at:
- Windows: `D:\AI\Projects\Lindex`
- WSL: `/mnt/d/AI/Projects/Lindex`
- Backup: `\\Mottomo_takai\AI Obsidian\AI Application backups\Lindex`

## What Makes This Special?

### 1. WSL + Windows Path Interoperability

**Problem:** Working across WSL and Windows can cause path conflicts, line-ending issues, and performance problems.

**Solution:**
- Project lives on Windows filesystem (`D:\AI\Projects\Lindex`)
- Cursor accesses native Windows path
- WSL accesses via `/mnt/d/AI/Projects/Lindex`
- Git configured for cross-platform compatibility
- `.gitattributes` enforces consistent line endings

### 2. Automated Network Backup

**Problem:** Need reliable backups to network share without manual intervention.

**Solution:**
- Git `post-push` hook triggers Windows `robocopy`
- Mirrors project to `\\Mottomo_takai\AI Obsidian\AI Application backups\Lindex`
- Excludes dependencies, build artifacts, secrets
- Logs to `.backup.log`
- Non-blocking - never interrupts development

### 3. Claude Code Integration

**Problem:** Want AI code reviews but unsure how to integrate them into workflow.

**Solution:**
- **Interactive Claude Code** - You're using it now! Best for development
- **Manual API reviews** - Run `./claude-review.sh` before critical commits
- **Automated pre-commit** - Optional (costs API credits, slows commits)
- **GitHub Actions** - PR reviews already configured

### 4. Multi-Layer Quality Gates

**Problem:** Need to catch issues early without slowing down development.

**Solution:**
1. **Pre-commit hooks** - Local checks (linting, secrets, formatting)
2. **Claude API reviews** - Optional AI review before commit
3. **GitHub Actions** - Automated CI on every PR
4. **Fly.io deployment** - Production checks before going live

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Development Flow                         │
└─────────────────────────────────────────────────────────────┘

Windows Side                WSL Side                Network Backup
─────────────               ────────                ──────────────
Cursor IDE                  Git commands            Robocopy sync
  │                           │                           │
  ├─ Edits files             ├─ git add .                 │
  │  (D:\AI\...)             ├─ git commit                │
  │                          │   └─ pre-commit hooks run  │
  ├─ File watching           │                            │
  │                          ├─ git push                  │
  └─ Build tools             │   └─ post-push hook ───────┤
                             │                            │
                             └─ ./claude-review.sh        ▼
                                (optional manual)   Backup complete!

GitHub Actions                                      Fly.io Deployment
──────────────                                      ─────────────────
PR opened → CI runs → Tests pass → Merge → Deploy to production
```

## File Structure

```
project-template/
├── setup-wsl.sh                    # WSL-optimized setup script
├── QUICK_START_WSL.md              # This file - quick reference
├── README-WSL.md                   # Comprehensive WSL guide
│
├── docs/
│   ├── WSL_WINDOWS_GUIDE.md        # Complete WSL workflow docs
│   ├── CLAUDE_INTEGRATION.md       # Claude API integration
│   ├── WORKFLOW.md                 # Development workflow
│   └── QUICK-REFERENCE.md          # Command cheatsheet
│
├── .github/workflows/
│   ├── ci.yml                      # Automated testing
│   └── deploy.yml                  # Fly.io deployment
│
├── .git/hooks/                     # (Created by setup)
│   ├── pre-commit                  # Quality checks before commit
│   └── post-push                   # Network backup after push
│
├── claude-review.sh                # (Created by setup) Manual AI review
├── .backup.log                     # (Created on first push) Backup log
│
├── .gitattributes                  # Line ending configuration
├── .gitignore                      # Files to exclude from Git
├── .env.example                    # Environment variable template
├── .cursorrules                    # Cursor IDE configuration
└── fly.toml                        # Fly.io deployment config
```

## Daily Workflow

### Morning: Start Development

```bash
# 1. Open WSL terminal
cd /mnt/d/AI/Projects/Lindex

# 2. Open Cursor (Windows)
# File > Open Folder > D:\AI\Projects\Lindex

# 3. Create feature branch
git checkout -b feature/new-feature

# 4. Start coding in Cursor
```

### During: Make Changes

```bash
# Edit files in Cursor (auto-saves)

# Check what changed
git status
git diff

# Stage changes
git add .

# Optional: Run Claude review
./claude-review.sh

# Commit (pre-commit hooks run automatically)
git commit -m "Add new feature"
```

### Evening: Push and Backup

```bash
# Push to GitHub (triggers automatic backup)
git push origin feature/new-feature

# Create PR via GitHub web interface or:
gh pr create --title "Add new feature" --body "Description here"

# Verify backup
tail .backup.log
```

## Key Features Explained

### Pre-commit Hooks

**What they do:**
- Lint code (ESLint, Prettier, etc.)
- Detect secrets (API keys, passwords)
- Format code consistently
- Run tests (if configured)

**When they run:**
- Automatically on every `git commit`
- Can run manually: `pre-commit run --all-files`

**How to skip (emergency only):**
```bash
git commit --no-verify -m "Emergency fix"
```

### Post-push Backup

**What it does:**
- Mirrors entire project to network share
- Excludes: node_modules, .git, .env, logs, build artifacts
- Logs results to `.backup.log`

**When it runs:**
- Automatically after every successful `git push`

**How to trigger manually:**
```bash
.git/hooks/post-push
```

**How to disable:**
```bash
mv .git/hooks/post-push .git/hooks/post-push.disabled
```

### Claude Code Reviews

**Three ways to use:**

1. **Interactive (you're using it now!)**
   - Best for: Development, debugging, learning
   - Cost: Covered by Claude Code subscription
   - Usage: Just talk to Claude!

2. **Manual API review (`./claude-review.sh`)**
   - Best for: Critical commits, complex changes
   - Cost: ~$0.02-$0.10 per review (API tokens)
   - Usage: `git add . && ./claude-review.sh`

3. **Automated pre-commit (optional)**
   - Best for: Strict quality gates
   - Cost: API tokens on every commit
   - Usage: Uncomment in `.git/hooks/pre-commit`

**Recommendation:** Use #1 for development, #2 for important commits, skip #3 (too expensive/slow).

## Configuration

### Environment Variables

Create `.env` from template:

```bash
cp .env.example .env
nano .env
```

**Required:**
```
# None required for basic usage
```

**Optional (for Claude API reviews):**
```bash
export ANTHROPIC_API_KEY='sk-ant-api03-...'
echo 'export ANTHROPIC_API_KEY="sk-ant-..."' >> ~/.bashrc
```

**Optional (for GitHub Actions):**
```
ANTHROPIC_API_KEY   # For PR reviews
FLY_API_TOKEN       # For deployment
```

### Network Backup Path

Edit `.git/hooks/post-push` if you need to change backup location:

```bash
# Line 6
NETWORK_BACKUP_PATH="\\\\Mottomo_takai\\AI Obsidian\\AI Application backups\\Lindex"
```

### Excluded from Backup

Edit `.git/hooks/post-push` line 18 to customize:

```bash
/XD 'node_modules' '.git' '.venv' '__pycache__' 'dist' 'build' '.next' \
/XF '.env' '.env.local' '*.log' '.DS_Store' \
```

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "All files modified" in Git | Run: `git rm -rf --cached . && git add . && git commit -m "Fix line endings"` |
| Network backup fails | Verify: `powershell.exe -Command "Test-Path '\\\\Mottomo_takai\\AI Obsidian\\AI Application backups'"` |
| Pre-commit hooks don't run | Run: `pre-commit install` |
| Claude review script fails | Set: `export ANTHROPIC_API_KEY='your-key'` and install: `sudo apt install jq` |
| Cursor can't find files | Open Windows path: `D:\AI\Projects\Lindex` (not WSL path) |

### Getting Help

1. **WSL-specific issues:** `docs/WSL_WINDOWS_GUIDE.md`
2. **Claude integration:** `docs/CLAUDE_INTEGRATION.md`
3. **Git workflow:** `docs/WORKFLOW.md`
4. **Quick commands:** `docs/QUICK-REFERENCE.md`

## Performance Tips

### DO:
- Use Windows Git (git.exe) for best performance
- Open Cursor via Windows path (`D:\...`)
- Run builds from WSL if they're Linux-native
- Keep large dependencies on Windows side

### DON'T:
- Mix WSL and Windows Git on same repo
- Edit files in WSL while Cursor is open
- Store project in WSL home (`/home/...`) and access from Windows
- Commit `node_modules` or `.env` files

## Security Checklist

- [ ] `.env` in `.gitignore` - secrets never committed
- [ ] `.env` excluded from backup
- [ ] API keys in environment variables, not code
- [ ] GitHub secrets configured for CI/CD
- [ ] Network backup path has restricted access
- [ ] Pre-commit hooks detect secrets
- [ ] `.gitattributes` prevents line-ending leaks

## Next Steps After Setup

1. **Configure GitHub:**
   ```bash
   gh repo create Lindex --private --source=. --remote=origin
   git push -u origin main
   ```

2. **Set GitHub Secrets:**
   - Go to: Settings > Secrets and variables > Actions
   - Add: `ANTHROPIC_API_KEY`, `FLY_API_TOKEN`

3. **Install Dependencies:**
   ```bash
   npm install    # or pip install -r requirements.txt
   ```

4. **Start Development:**
   ```bash
   git checkout -b feature/my-first-feature
   # Code in Cursor, commit, push!
   ```

5. **Deploy to Production:**
   ```bash
   flyctl launch
   git push origin main  # Triggers deployment
   ```

## FAQ

**Q: Can I use this template without network backup?**
A: Yes! Delete `.git/hooks/post-push` or rename to `.disabled`.

**Q: Can I use VS Code instead of Cursor?**
A: Yes! Open `D:\AI\Projects\Lindex` in VS Code. Works identically.

**Q: Do I need Claude API key?**
A: No, only for `claude-review.sh` script. Interactive Claude Code (CLI) works without it.

**Q: What if my network share is unavailable?**
A: Backup will fail gracefully, won't block your push. Check `.backup.log` for details.

**Q: Can I change project location from D: to C:?**
A: Yes! Edit `setup-wsl.sh` line 22-24 before running.

**Q: Is this template language-specific?**
A: No! Works with any language. Just add your language-specific tools to pre-commit config.

## Credits

**Template Version:** 1.0.0-wsl
**Last Updated:** 2025-11-29
**Optimized for:** WSL2 + Windows 11 + Cursor + Claude Code

## License

This template is provided as-is for use in your projects. Modify as needed!

---

**Ready to start?**

```bash
bash setup-wsl.sh
```

**Need help?** Read `docs/WSL_WINDOWS_GUIDE.md` for complete documentation.
