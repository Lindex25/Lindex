# Development Workflow

Complete guide to the optimized development lifecycle using Cursor, Claude Code, and Fly.io.

## Overview

This workflow is designed for rapid iteration with built-in quality gates and automated deployment:

```
Development (Cursor) → Quality Gate (Claude Code) → Deployment (Fly.io)
```

## Detailed Workflow Steps

### 1. Starting a New Feature

```bash
# Ensure you're on main and up-to-date
git checkout main
git pull origin main

# Create a feature branch
git checkout -b feature/descriptive-name
# Examples:
# - feature/user-authentication
# - feature/payment-integration
# - bugfix/login-error
```

**Branch naming conventions:**
- `feature/` - New features
- `bugfix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates

### 2. Development in Cursor

Open the project in Cursor and start coding:

**Best practices:**
- Use Cursor's AI assistance (Cmd+K or Ctrl+K)
- Follow the rules in `.cursorrules`
- Make small, focused commits
- Test frequently during development

```bash
# Run your app locally
npm run dev  # Node.js
# or
python app.py  # Python

# Test your changes
npm test  # Run test suite
```

### 3. Local Quality Checks

Before pushing, run local checks:

```bash
# Claude Code can be run locally for interactive feedback
claude-code review --interactive

# Pre-commit hooks will run automatically on commit
git add .
git commit -m "Add user authentication feature"
# Hooks will check for secrets, formatting, etc.
```

If pre-commit hooks fail:
- Review the error messages
- Fix the issues
- Try committing again

### 4. Push and Create Pull Request

```bash
# Push your feature branch
git push origin feature/your-feature-name

# Create a pull request (using GitHub CLI)
gh pr create --title "Add user authentication" --body "Description of changes"

# Or create PR manually on GitHub web interface
```

**Pull Request best practices:**
- Write clear title and description
- Reference any related issues
- Include testing steps if applicable
- Keep PRs focused and reasonably sized

### 5. Automated Quality Gate

Once you create the PR, GitHub Actions automatically triggers:

**Claude Code Review (`claude-code-review.yml`):**
- Analyzes your code for bugs, security issues, and best practices
- Posts review comments directly on the PR
- Focuses on changed files for efficiency

**Security Scan:**
- Checks for dependency vulnerabilities (npm audit / pip-audit)
- Scans for accidentally committed secrets (TruffleHog)
- Runs automatically on every PR

**Reviewing the results:**
1. Check the PR page for the Claude Code review comment
2. Address any critical issues identified
3. Push fixes to the same branch (PR updates automatically)
4. Re-review if needed

### 6. Merge to Main

Once you're satisfied with the review:

```bash
# Merge via GitHub CLI
gh pr merge --squash  # or --merge or --rebase

# Or use GitHub web interface
# Click "Squash and merge" button
```

**Merge strategies:**
- **Squash merge** (recommended for solo): Clean history, one commit per feature
- **Regular merge**: Preserves all commits
- **Rebase**: Linear history

### 7. Automatic Deployment

After merging to `main`, deployment happens automatically:

**What happens:**
1. GitHub Actions runs `deploy.yml` workflow
2. Connects to Fly.io using `FLY_API_TOKEN`
3. Deploys your app with `flyctl deploy`
4. Verifies deployment status

**Monitoring deployment:**
```bash
# Watch deployment in real-time
flyctl logs

# Check app status
flyctl status

# Open your deployed app
flyctl open
```

### 8. Verify Production

After deployment completes:

1. **Test the deployed app**: Visit your app URL and verify changes
2. **Check logs for errors**: `flyctl logs`
3. **Monitor performance**: Use Fly.io dashboard

### 9. Rollback if Needed

If something goes wrong:

```bash
# List recent releases
flyctl releases

# Rollback to previous version
flyctl releases rollback

# Or rollback via GitHub
git revert <commit-hash>
git push origin main  # Triggers new deployment with revert
```

## Quick Reference Commands

### Daily Development
```bash
# Start new feature
git checkout -b feature/name

# Commit changes
git add .
git commit -m "message"

# Push and create PR
git push origin feature/name
gh pr create

# Merge and deploy
gh pr merge --squash
```

### Local Testing
```bash
# Run Claude Code locally
claude-code review --interactive

# Run tests
npm test  # or pytest

# Check for secrets
detect-secrets scan

# Run pre-commit checks manually
pre-commit run --all-files
```

### Fly.io Management
```bash
# View logs
flyctl logs

# Check status
flyctl status

# List deployments
flyctl releases

# Rollback
flyctl releases rollback

# Update secrets
flyctl secrets set KEY=value
```

## Workflow Variations

### Hot Fix to Production

For urgent fixes that can't wait for the full PR process:

```bash
git checkout main
git pull
git checkout -b hotfix/critical-bug
# Make minimal fix
git commit -m "Fix critical bug"
git push origin hotfix/critical-bug

# Create PR but merge immediately after quick review
gh pr create --title "HOTFIX: Critical bug"
# Review quickly, then merge
```

### Feature Flags

For gradual feature rollout:

1. Add feature flag to `.env.example`
2. Set flag in Fly.io secrets: `flyctl secrets set ENABLE_FEATURE_X=false`
3. Deploy code with feature behind flag
4. Enable when ready: `flyctl secrets set ENABLE_FEATURE_X=true`

### Working on Multiple Features

```bash
# Switch between feature branches
git checkout feature/feature-a
# Work on feature A
git checkout feature/feature-b
# Work on feature B

# Keep branches updated with main
git checkout feature/feature-a
git merge main  # or git rebase main
```

## Tips for Maximum Efficiency

### Cursor IDE
- Use AI chat for complex logic
- Ask for test generation
- Request refactoring suggestions
- Use multi-cursor for batch edits

### Claude Code
- Run locally during development for faster feedback
- CI/CD review catches what you might miss
- Focus on security and structural issues
- Use findings to learn patterns

### Git Workflow
- Commit frequently with clear messages
- Keep feature branches short-lived (1-2 days max)
- Merge main into your branch regularly to avoid conflicts
- Delete merged branches to keep repo clean

### Deployment
- Deploy multiple times per day for fast feedback
- Small deployments = easier rollbacks
- Monitor logs after each deployment
- Keep `main` branch always deployable

## Troubleshooting Common Issues

### PR Review Not Triggering
- Check GitHub Actions tab for errors
- Verify `ANTHROPIC_API_KEY` is set
- Ensure PR is not from a fork (security limitation)

### Deployment Failing
- Check `flyctl logs` for application errors
- Verify all required secrets are set
- Ensure `fly.toml` matches your app type
- Check Fly.io status page for outages

### Pre-commit Hooks Failing
If pre-commit hooks fail:
1. **Read the error message carefully** - it's protecting you from a mistake
2. **Fix the underlying issue** - don't bypass the check
3. **Update hook configuration** if it's a false positive (via `.pre-commit-config.yaml`)
4. **Update the secrets baseline** if detect-secrets reports a false positive:
   ```bash
   detect-secrets scan > .secrets.baseline
   ```

**NEVER use `--no-verify`** in production code. If you must bypass for a legitimate reason (extremely rare), document why in the commit message and notify your team.

### Merge Conflicts
```bash
# Update your branch with latest main
git checkout feature/your-feature
git fetch origin
git merge origin/main

# Resolve conflicts in your editor
# Stage resolved files
git add .
git commit -m "Merge main and resolve conflicts"
```

## Advanced: Customizing the Workflow

### Adding Staging Environment

1. Create staging Fly.io app: `flyctl launch --copy-config --name myapp-staging`
2. Add staging deployment workflow in `.github/workflows/deploy-staging.yml`
3. Deploy to staging on PR creation, production on merge

### Multiple Deployment Targets

Modify `deploy.yml` to deploy to different regions or apps:
```yaml
strategy:
  matrix:
    region: [iad, lhr, syd]
```

### Custom Claude Code Prompts

Edit `.github/workflows/claude-code-review.yml` to customize analysis:
```yaml
--prompt "Focus on performance optimizations and SQL query efficiency"
```

## Getting Help

If you encounter issues:
1. Check this workflow documentation
2. Review README.md troubleshooting section
3. Check tool-specific docs (Cursor, Claude, Fly.io)
4. Review GitHub Actions logs for CI/CD issues
5. Check Fly.io logs for deployment issues
