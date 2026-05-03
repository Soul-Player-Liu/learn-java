#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SNAPSHOT="$ROOT_DIR/docs/schema/current.sql"
BEFORE="$(git -C "$ROOT_DIR" diff -- "$SNAPSHOT")"

"$ROOT_DIR/scripts/generate-schema.sh" "$SNAPSHOT"

AFTER="$(git -C "$ROOT_DIR" diff -- "$SNAPSHOT")"

if [[ "$BEFORE" != "$AFTER" ]]; then
  echo "Generated schema snapshot is stale. Run ./scripts/generate-schema.sh and include docs/schema/current.sql." >&2
  exit 1
fi
