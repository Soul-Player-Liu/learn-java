#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUN_DIR="$ROOT_DIR/.dev"
BACKEND_PID_FILE="$RUN_DIR/backend.pid"
FRONTEND_PID_FILE="$RUN_DIR/frontend.pid"
BACKEND_LOG="$RUN_DIR/backend.log"
FRONTEND_LOG="$RUN_DIR/frontend.log"

mkdir -p "$RUN_DIR"

is_pid_alive() {
  local pid_file="$1"
  [[ -f "$pid_file" ]] && kill -0 "$(cat "$pid_file")" 2>/dev/null
}

is_url_up() {
  local url="$1"
  curl -fsS "$url" >/dev/null 2>&1
}

is_port_listening() {
  local port="$1"
  lsof -tiTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1
}

wait_for_url() {
  local name="$1"
  local url="$2"
  local attempts="${3:-60}"

  for _ in $(seq 1 "$attempts"); do
    if is_url_up "$url"; then
      echo "$name is ready: $url"
      return 0
    fi
    sleep 2
  done

  echo "$name did not become ready. Check logs under $RUN_DIR." >&2
  return 1
}

start_backend() {
  if is_url_up "http://127.0.0.1:8080/v3/api-docs"; then
    echo "Backend already running on http://127.0.0.1:8080"
    return
  fi
  if is_pid_alive "$BACKEND_PID_FILE"; then
    echo "Backend process is already starting/running with pid $(cat "$BACKEND_PID_FILE")"
    wait_for_url "Backend" "http://127.0.0.1:8080/v3/api-docs" 60
    return
  fi
  if is_port_listening 8080; then
    echo "Port 8080 is already in use, but /v3/api-docs is not reachable. Not starting backend." >&2
    return 1
  fi

  echo "Starting backend..."
  setsid bash -c "cd '$ROOT_DIR/backend' && exec ../scripts/with-java-17.sh ./mvnw spring-boot:run" >"$BACKEND_LOG" 2>&1 &
  echo "$!" >"$BACKEND_PID_FILE"
  wait_for_url "Backend" "http://127.0.0.1:8080/v3/api-docs" 60
}

start_frontend() {
  if is_url_up "http://127.0.0.1:5173"; then
    echo "Frontend already running on http://127.0.0.1:5173"
    return
  fi
  if is_pid_alive "$FRONTEND_PID_FILE"; then
    echo "Frontend process is already starting/running with pid $(cat "$FRONTEND_PID_FILE")"
    wait_for_url "Frontend" "http://127.0.0.1:5173" 30
    return
  fi
  if is_port_listening 5173; then
    echo "Port 5173 is already in use, but Vite is not reachable. Not starting frontend." >&2
    return 1
  fi

  echo "Starting frontend..."
  setsid bash -c "cd '$ROOT_DIR/frontend' && exec npm run dev -- --host 127.0.0.1" >"$FRONTEND_LOG" 2>&1 &
  echo "$!" >"$FRONTEND_PID_FILE"
  wait_for_url "Frontend" "http://127.0.0.1:5173" 30
}

start_backend
start_frontend

echo
echo "Backend:  http://127.0.0.1:8080"
echo "Frontend: http://127.0.0.1:5173"
echo "Logs:     $RUN_DIR"
