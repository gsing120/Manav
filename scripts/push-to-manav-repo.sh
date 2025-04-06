#!/bin/bash

# Script to push Manus Twin to a new private GitHub repository named "Manav"
# Uses the provided GitHub personal access token and user credentials

# Configuration
GITHUB_TOKEN="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"
REPO_NAME="Manav"
REPO_DESCRIPTION="A Manus.im-like application that runs locally on Windows with support for multiple AI models"
GIT_USERNAME="gsing120"
GIT_EMAIL="gsing120@lakeheadu.ca"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting GitHub repository creation and code push...${NC}"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: git is not installed. Please install git and try again.${NC}"
    exit 1
fi

# Navigate to project directory
cd "$(dirname "$0")/.."
PROJECT_DIR=$(pwd)
echo -e "${GREEN}Project directory: $PROJECT_DIR${NC}"

# Configure git user with provided credentials
echo -e "${GREEN}Configuring git user with provided credentials...${NC}"
git config --global user.email "$GIT_EMAIL"
git config --global user.name "$GIT_USERNAME"
echo -e "${GREEN}Git configured with username: $GIT_USERNAME and email: $GIT_EMAIL${NC}"

# Check if already a git repository
if [ -d ".git" ]; then
    echo -e "${YELLOW}This directory is already a git repository. Reinitializing...${NC}"
    rm -rf .git
fi

# Initialize git repository
echo -e "${GREEN}Initializing git repository...${NC}"
git init

# Create .gitignore file
echo -e "${GREEN}Creating .gitignore file...${NC}"
cat > .gitignore << EOL
# Node.js
node_modules/
npm-debug.log
yarn-debug.log
yarn-error.log
package-lock.json
yarn.lock

# Build files
dist/
build/
*.tsbuildinfo

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.idea/
.vscode/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Testing
coverage/

# Temporary files
tmp/
temp/
EOL

# Add all files
echo -e "${GREEN}Adding files to git...${NC}"
git add .

# Commit changes
echo -e "${GREEN}Committing files...${NC}"
git commit -m "Initial commit of Manus Twin application to Manav repository"

# Create private repository on GitHub
echo -e "${GREEN}Creating private repository named '$REPO_NAME' on GitHub...${NC}"
RESPONSE=$(curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"$REPO_NAME\",\"description\":\"$REPO_DESCRIPTION\",\"private\":true}")

# Check if repository was created successfully
if echo "$RESPONSE" | grep -q "id"; then
    echo -e "${GREEN}Repository created successfully!${NC}"
else
    echo -e "${RED}Failed to create repository. Response:${NC}"
    echo "$RESPONSE"
    exit 1
fi

# Construct the repository URL
REPO_URL="https://github.com/$GIT_USERNAME/$REPO_NAME.git"
echo -e "${GREEN}Repository URL: $REPO_URL${NC}"

# Add remote
echo -e "${GREEN}Adding remote...${NC}"
git remote add origin "$REPO_URL"

# Set up authentication for push
echo -e "${GREEN}Setting up authentication for push...${NC}"
git remote set-url origin "https://$GITHUB_TOKEN@${REPO_URL#https://}"

# Push to GitHub
echo -e "${GREEN}Pushing to GitHub...${NC}"
if git push -u origin master; then
    echo -e "${GREEN}Successfully pushed code to GitHub!${NC}"
else
    # Try pushing to main branch instead
    echo -e "${YELLOW}Failed to push to master branch. Trying main branch...${NC}"
    git branch -m master main
    if git push -u origin main; then
        echo -e "${GREEN}Successfully pushed code to GitHub!${NC}"
    else
        echo -e "${RED}Failed to push code to GitHub. Please check your token and try again.${NC}"
        echo -e "${YELLOW}Repository was created, but code was not pushed.${NC}"
        echo -e "${YELLOW}You can manually push the code using:${NC}"
        echo -e "git push -u origin main"
        exit 1
    fi
fi

echo -e "${GREEN}Repository URL: https://github.com/$GIT_USERNAME/$REPO_NAME${NC}"
echo -e "${GREEN}Done!${NC}"
