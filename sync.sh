#!/usr/bin/env bash
# Keeps the Chrome extension and the service-worker cache name in sync
# with the root page. Run after editing any of the shell files below.
# macOS / Linux / Git Bash / WSL.
#
#   ./sync.sh          sync everything
#   ./sync.sh --check  report what's out of sync, change nothing (exit 1 if stale)

set -e
cd "$(dirname "$0")"

CHECK=false
[ "$1" = "--check" ] && CHECK=true

SHELL_FILES="index.html styles.css config.js cosmos.js live.js app.js manifest.webmanifest"
STALE=false

hash_shell() {
  # strip \r so CRLF vs LF checkouts (core.autocrlf) never change the hash
  if command -v sha256sum >/dev/null 2>&1; then
    cat $SHELL_FILES | tr -d '\r' | sha256sum | cut -c1-10
  else
    cat $SHELL_FILES | tr -d '\r' | shasum -a 256 | cut -c1-10
  fi
}

# ---- 1. sw.js cache name, derived from the shell files' content ----------
# (replaces manually bumping CACHE — it's now impossible to forget)
WANT_CACHE="sk-home-$(hash_shell)"
HAVE_CACHE=$(grep -o '^const CACHE = "[^"]*"' sw.js | sed 's/^const CACHE = "//;s/"$//')

if [ "$WANT_CACHE" != "$HAVE_CACHE" ]; then
  if $CHECK; then
    echo "stale: sw.js CACHE is \"$HAVE_CACHE\", should be \"$WANT_CACHE\""
    STALE=true
  else
    sed "s/^const CACHE = .*/const CACHE = \"$WANT_CACHE\";/" sw.js > sw.js.tmp && mv sw.js.tmp sw.js
    echo "sw.js cache bumped -> $WANT_CACHE"
  fi
fi

# ---- 2. extension/ copy ---------------------------------------------------
# newtab.html = index.html without the PWA-only tags
#   (the web manifest and apple-touch-icon mean nothing inside an extension)
EXPECTED_NEWTAB=$(sed -e '/manifest\.webmanifest/d' \
                       -e '/apple-touch-icon/d' \
                       -e 's/data-page="web"/data-page="ext"/' \
                       index.html)

if $CHECK; then
  for f in styles.css app.js config.js cosmos.js live.js; do
    if ! diff -q "$f" "extension/$f" >/dev/null 2>&1; then
      echo "stale: extension/$f differs from $f"
      STALE=true
    fi
  done
  if ! diff -q assets/favicon.svg extension/assets/favicon.svg >/dev/null 2>&1; then
    echo "stale: extension/assets/favicon.svg differs from assets/favicon.svg"
    STALE=true
  fi
  if [ "$EXPECTED_NEWTAB" != "$(cat extension/newtab.html 2>/dev/null)" ]; then
    echo "stale: extension/newtab.html is out of date with index.html"
    STALE=true
  fi
  if $STALE; then
    echo "Run ./sync.sh to fix."
    exit 1
  fi
  echo "extension/ and sw.js are in sync."
  exit 0
fi

mkdir -p extension/assets
printf '%s\n' "$EXPECTED_NEWTAB" > extension/newtab.html
cp styles.css app.js config.js cosmos.js live.js extension/
cp assets/favicon.svg extension/assets/

echo "Synced -> extension/  (reload it at chrome://extensions)"
