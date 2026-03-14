#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <remote-url> [remote-name]"
  echo "Example: $0 git@github.com:owner/repo.git origin"
  exit 1
fi

REMOTE_URL="$1"
REMOTE_NAME="${2:-origin}"

if git remote get-url "$REMOTE_NAME" >/dev/null 2>&1; then
  echo "Remote '$REMOTE_NAME' already exists. Updating URL..."
  git remote set-url "$REMOTE_NAME" "$REMOTE_URL"
else
  echo "Adding remote '$REMOTE_NAME'..."
  git remote add "$REMOTE_NAME" "$REMOTE_URL"
fi

echo "Current remotes:"
git remote -v
