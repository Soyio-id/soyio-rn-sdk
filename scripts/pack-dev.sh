#!/bin/sh

set -e

SCRIPTS=$(cd "$(dirname "$0")" && pwd)
BASEDIR=$(dirname "$SCRIPTS")

FRAMEWORKS_DIR="$BASEDIR/ios/Frameworks"
FRAMEWORKS_DEV_DIR="$BASEDIR/ios/Frameworks-dev"
FRAMEWORKS_PROD_BACKUP="$BASEDIR/ios/Frameworks-prod-backup"

cleanup() {
  echo "Restoring original state..."
  if [ -d "$FRAMEWORKS_PROD_BACKUP" ]; then
    rm -rf "$FRAMEWORKS_DIR"
    mv "$FRAMEWORKS_PROD_BACKUP" "$FRAMEWORKS_DIR"
  fi
  git checkout -- "$BASEDIR/package.json" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

# 1. Build the package
echo "Building package..."
yarn build

# 2. Swap production xcframework with dev xcframework
echo "Swapping to dev FaceTec xcframework..."
mv "$FRAMEWORKS_DIR" "$FRAMEWORKS_PROD_BACKUP"
cp -R "$FRAMEWORKS_DEV_DIR" "$FRAMEWORKS_DIR"

# 3. Set version to x.y.z-dev
CURRENT_VERSION=$(node -p "require('./package.json').version")
npm version "$CURRENT_VERSION-dev" --no-git-tag-version

# 4. Pack
echo "Packing..."
npm pack

# 5. Cleanup is handled by trap
echo "Done! Created dev tarball."
