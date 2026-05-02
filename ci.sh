#!/usr/bin/env bash
set -euo pipefail

BACKEND_PID=""

cleanup() {
  rm -f backend-ci.log
  if [[ -n "$BACKEND_PID" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID"
    wait "$BACKEND_PID" 2>/dev/null || true
  fi
}

stop_backend() {
  if [[ -n "$BACKEND_PID" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID"
    wait "$BACKEND_PID" 2>/dev/null || true
  fi
  BACKEND_PID=""
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
../scripts/with-java-17.sh ./mvnw verify -Pintegration-test,coverage
../scripts/with-java-17.sh ./mvnw spring-boot:run >../backend-ci.log 2>&1 &
BACKEND_PID=$!
cd ..

wait_for_url "http://127.0.0.1:8080/v3/api-docs" 60

cd frontend
npm ci
npx playwright install chromium
npm run check
npm run test:coverage
npm run build:mock
npm run build:storybook
npm run sdk:check
stop_backend
npm run test:e2e
