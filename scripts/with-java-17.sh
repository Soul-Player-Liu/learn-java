#!/usr/bin/env bash
set -euo pipefail

if [[ -n "${DEV_JAVA_HOME:-}" ]]; then
  export JAVA_HOME="$DEV_JAVA_HOME"
fi

if [[ -n "${JAVA_HOME:-}" ]]; then
  export PATH="$JAVA_HOME/bin:$PATH"
fi

if ! command -v java >/dev/null 2>&1; then
  echo "Java 17 is required, but java was not found in PATH. Set JAVA_HOME or DEV_JAVA_HOME." >&2
  exit 1
fi

java_version="$(java -XshowSettings:properties -version 2>&1 | awk -F= '/java.specification.version/ { gsub(/[[:space:]]/, "", $2); print $2; exit }')"

if [[ "$java_version" != "17" ]]; then
  echo "Java 17 is required, but current java.specification.version is ${java_version:-unknown}." >&2
  echo "Set JAVA_HOME or DEV_JAVA_HOME to a Java 17 JDK before running this command." >&2
  exit 1
fi

exec "$@"
