#!/usr/bin/env bash
set -euo pipefail

REMOTE_NAME="${1:-origin}"
BRANCH_NAME="${2:-$(git branch --show-current)}"

if [[ -z "$BRANCH_NAME" ]]; then
  echo "Could not determine current branch."
  exit 1
fi

if ! git remote get-url "$REMOTE_NAME" >/dev/null 2>&1; then
  echo "Remote '$REMOTE_NAME' is not configured."
  echo "Run: ./scripts/setup-git-remote.sh <remote-url> $REMOTE_NAME"
  exit 1
fi

echo "Pushing '$BRANCH_NAME' to '$REMOTE_NAME' and setting upstream..."
git push -u "$REMOTE_NAME" "$BRANCH_NAME"
