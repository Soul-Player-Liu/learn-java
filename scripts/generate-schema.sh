#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT="${1:-$ROOT_DIR/docs/schema/current.sql}"

cd "$ROOT_DIR/backend"
../scripts/with-java-17.sh ./mvnw --batch-mode -Pschema-snapshot test-compile exec:java \
  -Dexec.args="--output=$OUTPUT"
