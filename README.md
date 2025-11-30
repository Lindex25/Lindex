# Project Template

A streamlined development template integrating Cursor IDE, Claude Code, and Fly.io for an optimized development-to-deployment workflow.

## Features

- **Development**: Cursor IDE with AI-assisted coding
- **Quality Assurance**: Automated Claude Code reviews on pull requests
- **Security**: Pre-commit hooks, secret detection, dependency auditing
- **Deployment**: Automated Fly.io deployment from main branch
- **Best Practices**: Git workflow, environment management, and documentation

## Quick Start

### 1. Prerequisites

Ensure you have the following installed:

- Git
- Node.js (v18+) or Python (3.11+) depending on your project type
- [Fly.io CLI](https://fly.io/docs/hands-on/install-flyctl/)
- [GitHub CLI](https://cli.github.com/) (optional but recommended)

### 2. Initial Setup

```bash
# Clone this template for a new project
cp -r /home/nstephenson/hub/project-template /home/nstephenson/hub/my-new-project
cd /home/nstephenson/hub/my-new-project

# Run the setup script
./setup.sh
```

The setup script will:

- Initialize a new Git repository
- Set up pre-commit hooks
- Create a GitHub repository
- Configure Fly.io
- Set up environment variables

### 3. Configure Secrets

#### GitHub Secrets (for CI/CD)

Add these secrets to your GitHub repository at `Settings > Secrets and variables > Actions`:

1. `ANTHROPIC_API_KEY` - Your Claude API key from [console.anthropic.com](https://console.anthropic.com/)
2. `FLY_API_TOKEN` - Get from `flyctl auth token`

#### Fly.io Secrets (for runtime)

```bash
# Set production environment variables
flyctl secrets set DATABASE_URL="your_database_url"
flyctl secrets set API_KEY="your_api_key"
# Add other secrets from .env.example
```

### 4. Local Development

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your local values
nano .env

# Install dependencies
npm install  # or pip install -r requirements.txt

# Start development server
npm run dev  # or python app.py
```

## Development Workflow

See [docs/WORKFLOW.md](docs/WORKFLOW.md) for the complete development workflow documentation.

**Quick summary:**

1. Create feature branch: `git checkout -b feature/your-feature`
2. Develop in Cursor with AI assistance
3. Test locally
4. Push and create Pull Request
5. Review Claude Code analysis
6. Merge to `main` to auto-deploy

## Project Structure

```
.
├── .github/
│   └── workflows/          # GitHub Actions (Claude Code review, deployment)
├── .vscode/                # Cursor/VSCode settings
├── docs/                   # Documentation
├── .cursorrules           # Cursor AI assistance rules
├── .env.example           # Environment variable template
├── .gitignore             # Git ignore patterns
├── .pre-commit-config.yaml # Pre-commit hooks configuration
├── fly.toml               # Fly.io deployment configuration
└── README.md              # This file
```

## Customization

### For Your Project Type

**Node.js/JavaScript:**

- Uncomment Node.js builder in `fly.toml`
- Remove Python-specific pre-commit hooks from `.pre-commit-config.yaml`

**Python:**

- Uncomment Python builder in `fly.toml`
- Remove JavaScript-specific pre-commit hooks from `.pre-commit-config.yaml`

**Docker:**

- Create a `Dockerfile`
- Update `fly.toml` to use Dockerfile builder

### Enable Manual Deployment Approval

For beginners, it's recommended to require manual approval before deployment:

1. Uncomment the `environment` section in `.github/workflows/deploy.yml`
2. Go to GitHub repo `Settings > Environments > New environment`
3. Create `production` environment with required reviewers

## Troubleshooting

### Claude Code Review Not Running

- Verify `ANTHROPIC_API_KEY` is set in GitHub Secrets
- Check GitHub Actions logs for errors

### Deployment Failing

- Verify `FLY_API_TOKEN` is set in GitHub Secrets
- Run `flyctl logs` to see application errors
- Ensure `fly.toml` is configured correctly for your app type

### Pre-commit Hooks Failing

- Run `pre-commit run --all-files` to see specific errors
- Update `.pre-commit-config.yaml` if needed

## Resources

- [Cursor Documentation](https://cursor.sh/docs)
- [Claude Code Documentation](https://claude.ai/docs)
- [Fly.io Documentation](https://fly.io/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## License

This template is free to use for any purpose.
