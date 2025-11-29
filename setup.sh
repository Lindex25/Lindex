#!/bin/bash

# Project Setup Script
# Automates initialization of a new project from this template

set -e  # Exit on error

echo "🚀 Project Setup Script"
echo "======================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Check if required tools are installed
check_prerequisites() {
    print_info "Checking prerequisites..."

    local missing_tools=()

    if ! command -v git &> /dev/null; then
        missing_tools+=("git")
    fi

    if ! command -v gh &> /dev/null; then
        print_info "GitHub CLI (gh) not found - GitHub repo creation will be manual"
    fi

    if ! command -v flyctl &> /dev/null; then
        missing_tools+=("flyctl (Fly.io CLI)")
    fi

    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_error "Missing required tools: ${missing_tools[*]}"
        echo ""
        echo "Please install:"
        for tool in "${missing_tools[@]}"; do
            echo "  - $tool"
        done
        exit 1
    fi

    print_success "All prerequisites installed"
}

# Get project information
get_project_info() {
    echo ""
    print_info "Project Configuration"
    echo ""

    read -p "Project name (lowercase, no spaces): " PROJECT_NAME
    if [ -z "$PROJECT_NAME" ]; then
        print_error "Project name is required"
        exit 1
    fi

    # Validate project name format (security: prevent command injection)
    if [[ ! "$PROJECT_NAME" =~ ^[a-z0-9-]+$ ]]; then
        print_error "Project name must be lowercase alphanumeric and hyphens only"
        print_error "Invalid characters detected. Please use only: a-z, 0-9, and hyphens"
        exit 1
    fi

    read -p "Project description: " PROJECT_DESCRIPTION

    read -p "Your GitHub username: " GITHUB_USERNAME

    read -p "Is this a private repository? (y/n): " IS_PRIVATE
    if [[ "$IS_PRIVATE" =~ ^[Yy]$ ]]; then
        REPO_VISIBILITY="--private"
    else
        REPO_VISIBILITY="--public"
    fi

    read -p "Primary Fly.io region (e.g., iad, lhr, syd) [iad]: " FLY_REGION
    FLY_REGION=${FLY_REGION:-iad}

    echo ""
    print_info "Project: $PROJECT_NAME"
    print_info "Visibility: ${REPO_VISIBILITY/--/}"
    print_info "Fly.io region: $FLY_REGION"
    echo ""

    read -p "Continue with these settings? (y/n): " CONFIRM
    if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
        print_error "Setup cancelled"
        exit 0
    fi
}

# Initialize Git repository
init_git() {
    echo ""
    print_info "Initializing Git repository..."

    if [ -d ".git" ]; then
        print_info "Git repository already exists."
        read -p "Reinitialize git repository? This will DELETE all history! (yes/no): " REINIT
        if [ "$REINIT" != "yes" ]; then
            print_info "Keeping existing git repository"
            return
        fi

        # Backup before destroying (safety measure)
        BACKUP_NAME=".git.backup.$(date +%s)"
        print_info "Creating backup at $BACKUP_NAME"
        mv .git "$BACKUP_NAME"
        print_success "Git history backed up to $BACKUP_NAME"
    fi

    git init
    git add .
    git commit -m "Initial commit from template"

    print_success "Git repository initialized"
}

# Create GitHub repository
create_github_repo() {
    echo ""
    print_info "Creating GitHub repository..."

    if command -v gh &> /dev/null; then
        if gh repo create "$PROJECT_NAME" $REPO_VISIBILITY --source=. --remote=origin --description "$PROJECT_DESCRIPTION"; then
            print_success "GitHub repository created"

            print_info "Pushing initial commit..."
            git push -u origin main
            print_success "Code pushed to GitHub"
        else
            print_error "Failed to create GitHub repository"
            print_info "You can create it manually at https://github.com/new"
        fi
    else
        print_info "GitHub CLI not installed"
        print_info "Create repository manually at: https://github.com/new"
        print_info "Repository name: $PROJECT_NAME"
        print_info "Then run: git remote add origin git@github.com:$GITHUB_USERNAME/$PROJECT_NAME.git"
        print_info "And: git push -u origin main"
    fi
}

# Set up pre-commit hooks
setup_precommit() {
    echo ""
    print_info "Setting up pre-commit hooks..."

    # Install pre-commit if not available
    if ! command -v pre-commit &> /dev/null; then
        print_info "Installing pre-commit..."
        pip install pre-commit || {
            print_error "Failed to install pre-commit"
            print_info "Install manually with: pip install pre-commit"
            return 1
        }
    fi

    pre-commit install

    # Create secrets baseline (required for pre-commit hook to work)
    print_info "Creating secrets baseline..."
    if ! command -v detect-secrets &> /dev/null; then
        print_info "Installing detect-secrets..."
        pip install detect-secrets || {
            print_error "Failed to install detect-secrets"
            return 1
        }
    fi

    detect-secrets scan > .secrets.baseline
    print_success "Secrets detection baseline created"

    print_success "Pre-commit hooks installed with secrets baseline"
}

# Configure Fly.io
configure_flyio() {
    echo ""
    print_info "Configuring Fly.io..."

    # Update fly.toml with project name and region
    sed -i "s/YOUR_APP_NAME/$PROJECT_NAME/g" fly.toml
    sed -i "s/primary_region = \"iad\"/primary_region = \"$FLY_REGION\"/g" fly.toml

    print_info "Running flyctl launch (this will finalize Fly.io configuration)..."
    print_info "When prompted, choose to use existing fly.toml configuration"

    if flyctl launch --name "$PROJECT_NAME" --region "$FLY_REGION" --no-deploy; then
        print_success "Fly.io app configured"

        echo ""
        print_info "Get your Fly.io API token with: flyctl auth token"
        print_info "Add it as FLY_API_TOKEN in GitHub Secrets"
    else
        print_error "Fly.io configuration failed"
        print_info "You can configure manually later with: flyctl launch"
    fi
}

# Set up environment files
setup_env() {
    echo ""
    print_info "Setting up environment files..."

    if [ ! -f ".env" ]; then
        cp .env.example .env
        print_success "Created .env from template"
        print_info "Edit .env file with your local configuration"
    else
        print_info ".env already exists, skipping"
    fi
}

# Display next steps
show_next_steps() {
    echo ""
    echo "=========================================="
    print_success "Setup Complete!"
    echo "=========================================="
    echo ""
    echo "📋 Next Steps:"
    echo ""
    echo "1. Configure GitHub Secrets (Settings > Secrets and variables > Actions):"
    echo "   - ANTHROPIC_API_KEY: Get from https://console.anthropic.com/"
    echo "   - FLY_API_TOKEN: Get from 'flyctl auth token'"
    echo ""
    echo "2. Edit .env file with your local development configuration:"
    echo "   nano .env"
    echo ""
    echo "3. Set Fly.io production secrets:"
    echo "   flyctl secrets set DATABASE_URL=\"your_database_url\""
    echo "   flyctl secrets set API_KEY=\"your_api_key\""
    echo ""
    echo "4. Install dependencies:"
    echo "   npm install  # or pip install -r requirements.txt"
    echo ""
    echo "5. Start development:"
    echo "   git checkout -b feature/my-first-feature"
    echo "   # Make changes in Cursor"
    echo "   git push origin feature/my-first-feature"
    echo ""
    echo "6. Read the workflow documentation:"
    echo "   cat docs/WORKFLOW.md"
    echo ""
    echo "🎉 Happy coding!"
    echo ""
}

# Main execution
main() {
    check_prerequisites
    get_project_info
    init_git
    create_github_repo
    setup_precommit
    setup_env
    configure_flyio
    show_next_steps
}

# Run main function
main
