#!/usr/bin/env bash
set -euo pipefail

# ← EDIT these to your own GitHub repo
GITHUB_OWNER="wess"
GITHUB_REPO="purge"
BINARY_NAME="prg"

# 1. Figure out arch
ARCH="$(uname -m)"
case "$ARCH" in
  x86_64) PLATFORM="macos-x64" ;;
  arm64)  PLATFORM="macos-arm64" ;;
  *)
    echo "❌ Unsupported architecture: $ARCH"
    exit 1
    ;;
esac

# 2. Fetch latest release tag from GitHub API
LATEST_TAG="$(
  curl -sSL "https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO/releases/latest" \
  | grep -E '"tag_name":' \
  | sed -E 's/.*"([^"]+)".*/\1/'
)"
if [[ -z "$LATEST_TAG" ]]; then
  echo "❌ Could not determine latest release tag"
  exit 1
fi

# 3. Build asset URL
ASSET_NAME="$BINARY_NAME-$PLATFORM"
DOWNLOAD_URL="https://github.com/$GITHUB_OWNER/$GITHUB_REPO/releases/download/$LATEST_TAG/$ASSET_NAME"

echo "⏬ Downloading $ASSET_NAME from $LATEST_TAG…"
curl -sSL "$DOWNLOAD_URL" -o "$ASSET_NAME"

# 4. Install
chmod +x "$ASSET_NAME"
install -m 755 "$ASSET_NAME" /usr/local/bin/"$BINARY_NAME"
rm "$ASSET_NAME"

echo "✅ Installed $BINARY_NAME to /usr/local/bin/"