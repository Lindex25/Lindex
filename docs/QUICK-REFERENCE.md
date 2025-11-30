# Quick Reference Card

Essential commands and workflows for daily development.

## Starting a New Project

```bash
# Copy template
cp -r /home/nstephenson/hub/project-template /home/nstephenson/hub/my-project
cd /home/nstephenson/hub/my-project

# Run setup
./setup.sh

# Configure secrets in GitHub and Fly.io (see README.md)
```

## Daily Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Develop in Cursor
# - Use AI assistance (Cmd/Ctrl + K)
# - Test locally: npm run dev

# 3. Commit and push
git add .
git commit -m "Descriptive message"
git push origin feature/my-feature

# 4. Create PR
gh pr create --title "Feature description"

# 5. Review Claude Code feedback on PR

# 6. Merge when ready
gh pr merge --squash

# 7. Deployment happens automatically to Fly.io
```

## Common Git Commands

```bash
# Switch branches
git checkout main
git checkout -b feature/name

# Update from main
git pull origin main

# View status
git status

# View changes
git diff

# Undo changes (before commit)
git checkout -- filename

# Undo last commit (keep changes)
git reset --soft HEAD~1
```

## Fly.io Commands

```bash
# View logs (real-time)
flyctl logs

# View app status
flyctl status

# Open deployed app
flyctl open

# List releases
flyctl releases

# Rollback to previous version
flyctl releases rollback

# Set secret
flyctl secrets set KEY=value

# View secrets (names only)
flyctl secrets list

# SSH into container
flyctl ssh console
```

## Claude Code Commands

```bash
# Interactive review (local)
claude-code review --interactive

# Analyze specific files
claude-code analyze --file src/app.js

# Full project analysis
claude-code analyze --prompt "Review for security issues"
```

## Pre-commit Hooks

```bash
# Install hooks
pre-commit install

# Run manually on all files
pre-commit run --all-files

# Update hook versions
pre-commit autoupdate

# Skip hooks (emergency only!)
git commit --no-verify
```

## GitHub CLI

```bash
# Create PR
gh pr create

# View PR status
gh pr status

# List PRs
gh pr list

# Merge PR
gh pr merge --squash

# View PR details
gh pr view

# Create issue
gh issue create
```

## Troubleshooting

### Deployment Failed

```bash
# Check logs
flyctl logs

# Check app status
flyctl status

# Restart app
flyctl apps restart

# Rollback
flyctl releases rollback
```

### Pre-commit Hooks Failing

```bash
# See what failed
pre-commit run --all-files

# Common fixes:
# - Format code: npm run format
# - Fix trailing whitespace automatically
# - Remove accidentally added secrets
```

### Merge Conflicts

```bash
# Update branch with main
git checkout feature/my-feature
git merge origin/main

# Fix conflicts in editor
# Then:
git add .
git commit -m "Resolve merge conflicts"
```

### Claude Code Review Not Running

```bash
# Check GitHub Actions
# Go to: https://github.com/USERNAME/REPO/actions

# Verify secrets are set:
# Settings > Secrets and variables > Actions
# - ANTHROPIC_API_KEY
# - FLY_API_TOKEN
```

## Environment Variables

### Local Development (.env)

```bash
# Edit local environment
nano .env

# Load in shell
export $(cat .env | xargs)
```

### Production (Fly.io)

```bash
# Set secret
flyctl secrets set DATABASE_URL="postgresql://..."

# Import from .env (careful!)
cat .env | flyctl secrets import

# Unset secret
flyctl secrets unset KEY
```

## Useful Aliases (Optional)

Add to `~/.bashrc` or `~/.zshrc`:

```bash
# Git shortcuts
alias gs='git status'
alias gc='git checkout'
alias gcb='git checkout -b'
alias gp='git push'
alias gl='git pull'
alias gd='git diff'

# Fly.io shortcuts
alias fl='flyctl logs'
alias fs='flyctl status'
alias fo='flyctl open'

# Project shortcuts
alias dev='npm run dev'  # or your dev command
```

## File Locations

```
Configuration Files:
├── .env                 → Local environment variables
├── .env.example         → Environment template
├── fly.toml            → Fly.io deployment config
├── .cursorrules        → Cursor AI rules
└── .github/workflows/  → CI/CD configuration

Documentation:
├── README.md           → Project overview
├── docs/WORKFLOW.md    → Detailed workflow guide
└── docs/QUICK-REFERENCE.md → This file
```

## Getting Help

- Workflow details: `cat docs/WORKFLOW.md`
- Project setup: `cat README.md`
- Cursor docs: https://cursor.sh/docs
- Fly.io docs: https://fly.io/docs
- GitHub Actions: https://docs.github.com/actions
