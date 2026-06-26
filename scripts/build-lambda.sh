#!/bin/bash
# Build the Lambda zip package with dependencies.
# Run this BEFORE terraform apply.
# Installs Python deps into the source directory, then terraform zips it.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LAMBDA_DIR="$REPO_ROOT/terraform/files/grc-tools"

echo "=== Building Lambda package ==="
echo "Source: $LAMBDA_DIR"

cd "$LAMBDA_DIR"

# Install dependencies into the source directory
echo "[1/2] Installing Python dependencies..."
pip install \
    -r requirements.txt \
    -t . \
    --platform manylinux2014_x86_64 \
    --only-binary=:all: \
    --python-version 3.12 \
    --no-compile \
    --quiet

echo "[2/2] Cleaning up..."
# Remove files that bloat the package
rm -rf *.dist-info __pycache__ bin

SIZE=$(du -sh . | cut -f1)
echo ""
echo "=== Done ==="
echo "Package size: $SIZE"
echo ""
echo "Now run: terraform apply"
