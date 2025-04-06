#!/bin/bash

# Script to verify GitHub repository access

# GitHub repository details
GITHUB_TOKEN="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"
REPO_NAME="manus-twin"
GITHUB_USERNAME="$(git config user.name || echo "manus-twin-developer")"

echo "Verifying GitHub repository access..."

# Check if repository exists
echo "Checking if repository exists..."
REPO_CHECK=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME")

if [ "$REPO_CHECK" == "200" ]; then
  echo "✅ Repository exists and is accessible!"
  
  # Get repository details
  REPO_DETAILS=$(curl -s \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME")
  
  # Extract and display repository information
  REPO_URL=$(echo "$REPO_DETAILS" | grep -o '"html_url": "[^"]*' | cut -d'"' -f4)
  REPO_PRIVATE=$(echo "$REPO_DETAILS" | grep -o '"private": [^,]*' | cut -d' ' -f2)
  
  echo "Repository URL: $REPO_URL"
  echo "Private repository: $REPO_PRIVATE"
  
  # Check if we can push to the repository
  echo "Verifying push access..."
  git remote -v | grep -q "origin.*$REPO_NAME"
  if [ $? -eq 0 ]; then
    echo "✅ Remote 'origin' is properly configured"
  else
    echo "⚠️ Remote 'origin' is not configured correctly"
    echo "Adding GitHub remote..."
    git remote add origin "https://$GITHUB_TOKEN@github.com/$GITHUB_USERNAME/$REPO_NAME.git"
  fi
  
  # Create a test file to verify push access
  echo "Creating test file..."
  echo "# Repository Access Test" > repo_access_test.md
  echo "This file was created to verify repository access on $(date)" >> repo_access_test.md
  
  # Commit and push the test file
  echo "Committing and pushing test file..."
  git add repo_access_test.md
  git commit -m "Test repository access"
  git push -u origin master
  
  if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to repository!"
    echo "Repository access verified and working correctly."
  else
    echo "❌ Failed to push to repository."
    echo "Please check your GitHub token and permissions."
  fi
  
else
  echo "❌ Repository does not exist or is not accessible."
  echo "HTTP Status Code: $REPO_CHECK"
  echo "Please run the push-to-github.sh script first to create the repository."
fi
