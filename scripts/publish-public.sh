#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PUBLIC_REMOTE="${PUBLIC_REMOTE:-public}"
PUBLIC_BRANCH="${PUBLIC_BRANCH:-main}"
PUBLIC_REPO_URL="${PUBLIC_REPO_URL:-}"
MANIFEST="${MANIFEST:-public-manifest.txt}"
TMP_DIR="${TMP_DIR:-/tmp/buildos-public-export}"

if [[ ! -f "$MANIFEST" ]]; then
  echo "Manifest not found: $MANIFEST" >&2
  exit 1
fi

if ! git remote get-url "$PUBLIC_REMOTE" >/dev/null 2>&1; then
  if [[ -z "$PUBLIC_REPO_URL" ]]; then
    echo "Remote '$PUBLIC_REMOTE' not found. Set PUBLIC_REPO_URL or run:" >&2
    echo "  git remote add $PUBLIC_REMOTE <public-repo-url>" >&2
    exit 1
  fi
  git remote add "$PUBLIC_REMOTE" "$PUBLIC_REPO_URL"
fi

rm -rf "$TMP_DIR"
mkdir -p "$TMP_DIR"

while IFS= read -r line; do
  path="$(echo "$line" | sed 's/[[:space:]]*$//')"
  [[ -z "$path" || "$path" =~ ^# ]] && continue
  if [[ ! -e "$path" ]]; then
    echo "Skipping missing path: $path"
    continue
  fi
  mkdir -p "$TMP_DIR/$(dirname "$path")"
  if [[ -d "$path" ]]; then
    cp -R "$path" "$TMP_DIR/$path"
  else
    cp "$path" "$TMP_DIR/$path"
  fi
done < "$MANIFEST"

pushd "$TMP_DIR" >/dev/null
git init -b "$PUBLIC_BRANCH" >/dev/null
git config user.name "$(git -C "$ROOT_DIR" config user.name)"
git config user.email "$(git -C "$ROOT_DIR" config user.email)"
git add .
git commit -m "Publish public snapshot from $(git -C "$ROOT_DIR" rev-parse --short HEAD)" >/dev/null
git remote add "$PUBLIC_REMOTE" "$(git -C "$ROOT_DIR" remote get-url "$PUBLIC_REMOTE")"
git push --force "$PUBLIC_REMOTE" "$PUBLIC_BRANCH"
popd >/dev/null

echo "Public repo updated:"
echo "  remote: $PUBLIC_REMOTE"
echo "  branch: $PUBLIC_BRANCH"
echo "  source commit: $(git rev-parse --short HEAD)"
