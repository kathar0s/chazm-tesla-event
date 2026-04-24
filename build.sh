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

# ISO 8601 timestamp of this build (UTC) — safe to parse with new Date(...)
BUILD_TIME=$(date -u '+%Y-%m-%dT%H:%M:%SZ')

echo "Cache-bust version: ${VERSION}"
echo "Build time: ${BUILD_TIME}"

for f in index.html about.html; do
  if [ -f "$f" ]; then
    sed -i.bak -e "s/__CACHE_BUST__/${VERSION}/g" -e "s/__BUILD_TIME__/${BUILD_TIME}/g" "$f"
    rm -f "${f}.bak"
    echo "  patched ${f}"
  fi
done
