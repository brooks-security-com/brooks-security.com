#!/bin/bash
# Copy grc-tools markdown content into Hugo content directory for brooks-security.com
# Run from: hugo/ directory
set -euo pipefail

GRC_REPO="${GRC_REPO:-$HOME/Projects/brooks-security/grc-tools}"
HUGO_CONTENT="content/grc-tools"

rm -rf "$HUGO_CONTENT"
mkdir -p "$HUGO_CONTENT"

# Copy only markdown files, excluding build artifacts
find "$GRC_REPO" -name "*.md" -not -path "*/.git/*" | while read f; do
  rel="${f#$GRC_REPO/}"
  dir=$(dirname "$HUGO_CONTENT/$rel")
  mkdir -p "$dir"
  cp "$f" "$HUGO_CONTENT/$rel"
done

# Create _index.md for each directory so Hugo treats them as sections
for dir in "$HUGO_CONTENT" "$HUGO_CONTENT"/Guides "$HUGO_CONTENT"/Resources "$HUGO_CONTENT"/Policy-Templates; do
  [ -d "$dir" ] || continue
  title=$(basename "$dir" | sed 's/-/ /g')
  [ "$title" = "grc tools" ] && title="GRC Tools"
  [ "$title" = "Policy Templates" ] && title="Policy Templates"
  cat > "$dir/_index.md" << EOF
---
title: "$title"
bookHidden: true
bookFlatSection: true
---
EOF
done

# Create _index.md for each policy folder
for dir in "$HUGO_CONTENT"/Policy-Templates/*/; do
  [ -d "$dir" ] || continue
  name=$(basename "$dir")
  title=$(head -5 "$dir/README.md" 2>/dev/null | grep "^# " | head -1 | sed 's/^# //;s/ Template$//' || echo "$name")
  cat > "$dir/_index.md" << EOF
---
title: "$title"
bookHidden: true
---
EOF
done

echo "Synced grc-tools to $HUGO_CONTENT"
