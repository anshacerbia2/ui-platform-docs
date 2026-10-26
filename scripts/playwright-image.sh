#!/bin/sh
# scripts/playwright-image.sh <image version> — fails when the Playwright the site
# installs is not the one the CI image (mcr.microsoft.com/playwright) carries
# browsers for, so the two are moved together.
set -eu
installed=$(node -p "require('playwright/package.json').version")
if [ "$installed" != "$1" ]; then
  echo "::error::playwright is $installed, but the CI image carries $1: move the image tag in .github/workflows/ci.yml with it"
  exit 1
fi
echo "playwright $installed matches the image"
