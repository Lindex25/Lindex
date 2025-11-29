# Discord Notifications Setup

This template supports Discord notifications for various project events.

## Quick Setup

### 1. Create Discord Webhook

1. Open Discord and navigate to your server
2. Go to Server Settings > Integrations > Webhooks
3. Click "New Webhook"
4. Name it (e.g., "Project Notifications")
5. Select the channel for notifications
6. Copy the Webhook URL

### 2. Configure GitHub Actions (Required for CI/CD)

1. Go to your GitHub repository
2. Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Name: `DISCORD_WEBHOOK_URL`
5. Value: Paste your webhook URL
6. Click "Add secret"

### 3. Configure Git Hooks (Optional, for local backups)

The webhook is automatically configured during project creation if you provided it.

To update or add it later:

```bash
# Create config file if it doesn't exist
mkdir -p ~/.config
touch ~/.config/discord-webhooks
chmod 600 ~/.config/discord-webhooks

# Add webhook (replace YOUR_PROJECT_NAME and URL)
echo 'export DISCORD_WEBHOOK_YOUR_PROJECT_NAME="https://discord.com/api/webhooks/..."' >> ~/.config/discord-webhooks

# Source in your shell
echo 'source ~/.config/discord-webhooks' >> ~/.bashrc
source ~/.bashrc
```

## Notification Events

### GitHub Actions
- ✅ **Deployment Success** - When code deploys successfully to Fly.io
- ❌ **Deployment Failure** - When deployment fails
- ⚠️ **PR Review Complete** - After Claude Code review and security scan
- 🔒 **Security Alerts** - When vulnerabilities detected (if enabled)

### Git Hooks
- 💾 **Backup Success** - When network backup completes
- ❌ **Backup Failure** - When backup fails

## Security Notes

- Webhook URLs are sensitive - treat them like passwords
- Never commit webhook URLs to your repository
- Store in GitHub Secrets for CI/CD
- Store in `~/.config/discord-webhooks` (permissions 600) for local hooks
- Notifications automatically redact secrets from messages

## Troubleshooting

### Notifications not appearing

**GitHub Actions:**
1. Verify `DISCORD_WEBHOOK_URL` secret exists in repository settings
2. Check workflow logs for errors
3. Test webhook with curl:
   ```bash
   curl -X POST -H "Content-Type: application/json" \
     -d '{"content": "Test message"}' \
     YOUR_WEBHOOK_URL
   ```

**Git Hooks:**
1. Verify `~/.config/discord-webhooks` exists and has correct permissions
2. Verify webhook variable matches your project name
3. Source the config: `source ~/.config/discord-webhooks`

### Rate limiting
Discord webhooks limit: 30 requests per 60 seconds per webhook. This template is designed to stay well under this limit.

## Customization

Edit notification content in:
- `.github/workflows/deploy.yml` - Deployment notifications
- `.github/workflows/claude-code-review.yml` - PR review notifications
- `.git/hooks/post-push` - Backup notifications

Notification colors (decimal format):
- Green (success): 3066993
- Red (failure): 15158332
- Yellow (warning): 16776960
- Blue (info): 3447003

## Example Notifications

### Deployment Success
```
✅ Deployment Successful
Repository: username/project-name
Branch: main
Commit: Add new feature
Author: username
Environment: Production (Fly.io)
```

### PR Review Complete
```
✅ Pull Request Review Complete
PR: #42 - Add authentication system
Author: username
Claude Review: success
Security Scan: success
```

### Backup Success
```
💾 Backup Successful
Project: my-project
Branch: main
Commit: abc123 - Update documentation
Location: Network storage
```

## Disabling Notifications

### For a specific project:
- Remove `DISCORD_WEBHOOK_URL` from GitHub Secrets
- Remove webhook from `~/.config/discord-webhooks`

### For all future projects:
- Answer "n" when prompted "Enable Discord notifications?" during project creation

## Advanced Configuration

### Multiple Projects, One Channel
All projects can share the same Discord webhook URL. Each notification includes the project name and repository for easy identification.

### Separate Channels per Project
Create different webhooks for each project in Discord and configure each project with its own webhook URL.

### Custom Notification Format
Modify the webhook curl commands in the workflow files and git hooks to customize:
- Message format
- Colors
- Additional fields (timestamp, links, etc.)

Refer to [Discord Webhook Documentation](https://discord.com/developers/docs/resources/webhook) for advanced formatting options.

## Privacy Considerations

Notifications include:
- Repository name
- Branch name
- Commit messages
- Author username
- Workflow status

Notifications do NOT include:
- Code contents
- Environment variables
- API keys or secrets (automatically redacted)
- File paths (except in error messages)

If you're working on private/sensitive projects, ensure your Discord server has appropriate access controls.
