#!/bin/bash

# Script to push Manus Twin to a new private GitHub repository
# Uses the provided GitHub personal access token

# Configuration
GITHUB_TOKEN="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"
REPO_NAME="manus-twin"
REPO_DESCRIPTION="A Manus.im-like application that runs locally on Windows with support for multiple AI models"

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
git commit -m "Initial commit of Manus Twin application"

# Create private repository on GitHub
echo -e "${GREEN}Creating private repository on GitHub...${NC}"
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

# Get the repository URL
REPO_URL=$(echo "$RESPONSE" | grep -o '"clone_url":"[^"]*"' | sed 's/"clone_url":"//;s/"//')

# If repo URL is empty, try to construct it
if [ -z "$REPO_URL" ]; then
    echo -e "${YELLOW}Could not extract repository URL from response. Using default format...${NC}"
    # Get GitHub username
    USERNAME=$(curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user | grep -o '"login":"[^"]*"' | sed 's/"login":"//;s/"//')
    if [ -z "$USERNAME" ]; then
        echo -e "${RED}Could not determine GitHub username. Exiting.${NC}"
        exit 1
    fi
    REPO_URL="https://github.com/$USERNAME/$REPO_NAME.git"
fi

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
    if git push -u origin main; then
        echo -e "${GREEN}Successfully pushed code to GitHub!${NC}"
    else
        echo -e "${RED}Failed to push code to GitHub. Please check your token and try again.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}Repository URL: https://github.com/$(echo $REPO_URL | sed 's/https:\/\/github.com\///;s/\.git$//')${NC}"
echo -e "${GREEN}Done!${NC}"
