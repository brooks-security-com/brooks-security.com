#!/usr/bin/env bash
# Copy the drawing libraries the mockup needs out of the site's own vendor
# directory.
#
# The variant serves the mermaid diagrams the portfolio pages already contain,
# and it draws them with the same bundle the live site ships, so the mockup and
# the site cannot drift. The bundle is 2.6MB, so it is not committed here — it
# already lives in the repo once, at hugo/assets/js/vendor/. Run this after
# cloning or when the site's copy is updated.
#
#   mockups/01-typographic/tools/sync-vendor.sh
#
# Without it the diagrams fall back to showing their source text, which is
# readable but not the point.
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
variant="$(dirname "$here")"
repo="$(cd "$variant/../.." && pwd)"
from="$repo/hugo/assets/js/vendor"
to="$variant/assets"

for file in mermaid.min.js d3.min.js; do
  if [[ ! -f "$from/$file" ]]; then
    echo "missing $from/$file — is this a brooks-security.com checkout?" >&2
    exit 1
  fi
  cp "$from/$file" "$to/$file"
  echo "synced $file ($(du -h "$to/$file" | cut -f1))"
done

echo "done — reload the variant to pick them up"
