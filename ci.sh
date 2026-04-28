#!/usr/bin/env bash
set -euo pipefail

export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH="$JAVA_HOME/bin:$PATH"

BACKEND_PID=""

cleanup() {
  if [[ -n "$BACKEND_PID" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID"
    wait "$BACKEND_PID" 2>/dev/null || true
  fi
}

wait_for_url() {
  local url="$1"
  local attempts="${2:-60}"

  for _ in $(seq 1 "$attempts"); do
    if curl -fsS "$url" >/dev/null; then
      return 0
    fi
    sleep 2
  done

  echo "Timed out waiting for $url" >&2
  return 1
}

trap cleanup EXIT

docker compose up -d mysql

cd backend
./mvnw test
./mvnw verify -Pintegration-test
./mvnw spring-boot:run >../backend-ci.log 2>&1 &
BACKEND_PID=$!
cd ..

wait_for_url "http://127.0.0.1:8080/v3/api-docs" 60

cd frontend
npm ci
npx playwright install chromium
npm run check
npm run sdk:check
npm run test:e2e
