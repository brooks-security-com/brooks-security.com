#!/bin/bash
# Build the Lambda zip package with dependencies.
# Run this BEFORE terraform apply when working locally.
# In CI, the hugo-deploy.yml workflow handles this automatically.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LAMBDA_DIR="$REPO_ROOT/terraform/files/grc-tools"

echo "=== Building Lambda package ==="
echo "Source: $LAMBDA_DIR"

cd "$LAMBDA_DIR"

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
rm -rf *.dist-info __pycache__ bin

SIZE=$(du -sh . | cut -f1)
echo ""
echo "=== Done ==="
echo "Package size: $SIZE"
echo ""
echo "Now run: terraform apply"
