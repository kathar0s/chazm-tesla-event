#!/usr/bin/env bash
# Cloudflare Pages build step: replace __CACHE_BUST__ with the commit SHA
# so that app.js / styles.css URLs are versioned per deploy.
#
# Cloudflare Pages setting:
#   Build command: sh build.sh
#   Build output directory: .

set -euo pipefail

VERSION="${CF_PAGES_COMMIT_SHA:-${VERSION:-}}"
if [ -z "${VERSION}" ]; then
  VERSION="$(git rev-parse --short HEAD 2>/dev/null || date +%s)"
fi
VERSION="${VERSION:0:7}"

echo "Cache-bust version: ${VERSION}"

for f in index.html about.html; do
  if [ -f "$f" ]; then
    sed -i.bak "s/__CACHE_BUST__/${VERSION}/g" "$f"
    rm -f "${f}.bak"
    echo "  patched ${f}"
  fi
done
