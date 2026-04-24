#!/bin/sh
# Cloudflare Pages build step: replace __CACHE_BUST__ with the commit SHA
# so that app.js / styles.css URLs are versioned per deploy.
# POSIX-compatible so it runs under Cloudflare's /bin/sh (dash).
#
# Cloudflare Pages setting:
#   Build command: sh build.sh
#   Build output directory: /

set -eu

VERSION="${CF_PAGES_COMMIT_SHA:-}"
if [ -z "${VERSION}" ]; then
  VERSION="${VERSION_OVERRIDE:-}"
fi
if [ -z "${VERSION}" ]; then
  VERSION="$(git rev-parse --short HEAD 2>/dev/null || date +%s)"
fi
# take first 7 chars (POSIX: use `expr substr`, or `cut`)
VERSION=$(printf %s "$VERSION" | cut -c1-7)

echo "Cache-bust version: ${VERSION}"

for f in index.html about.html; do
  if [ -f "$f" ]; then
    sed -i.bak "s/__CACHE_BUST__/${VERSION}/g" "$f"
    rm -f "${f}.bak"
    echo "  patched ${f}"
  fi
done
