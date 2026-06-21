#!/usr/bin/env bash
# Build the google-auth Lambda layer. Reproducible from the committed
# requirements.txt. google-auth and its transitive deps (rsa, pyasn1,
# pyasn1-modules, cachetools) are pure Python, so no platform-specific wheels
# are involved and the layer builds the same on any machine.
#
# Output: python/ (the layer payload; Lambda puts it on sys.path). subscribe.tf
# zips this directory via archive_file, so just run this and commit python/.
set -euo pipefail
cd "$(dirname "$0")"

rm -rf python
pip install --target python --requirement requirements.txt --only-binary :none:
# Drop bytecode and metadata that bloat the layer and add no runtime value.
find python -type d -name '__pycache__' -prune -exec rm -rf {} +
find python -type d -name '*.dist-info' -prune -exec rm -rf {} +

echo "Layer built at $(pwd)/python"
