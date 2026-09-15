#!/usr/bin/env bash
# Copy the page into the Chrome extension folder.
# Run this after editing config.js (or anything else) so the New Tab page
# matches the website. macOS / Linux / Git Bash / WSL.

set -e
cd "$(dirname "$0")"

mkdir -p extension/assets

# newtab.html = index.html without the PWA-only tags
#   (the web manifest and apple-touch-icon mean nothing inside an extension)
sed -e '/manifest\.webmanifest/d' \
    -e '/apple-touch-icon/d' \
    -e 's/data-page="web"/data-page="ext"/' \
    index.html > extension/newtab.html

cp styles.css app.js config.js cosmos.js live.js extension/
cp assets/favicon.svg extension/assets/

echo "Synced -> extension/  (reload it at chrome://extensions)"
