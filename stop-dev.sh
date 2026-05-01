#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUN_DIR="$ROOT_DIR/.dev"
BACKEND_PID_FILE="$RUN_DIR/backend.pid"
FRONTEND_PID_FILE="$RUN_DIR/frontend.pid"

stop_pid_file() {
  local name="$1"
  local pid_file="$2"

  if [[ ! -f "$pid_file" ]]; then
    echo "$name pid file not found."
    return
  fi

  local pid
  pid="$(cat "$pid_file")"
  if ! kill -0 "$pid" 2>/dev/null; then
    echo "$name process $pid is not running."
    rm -f "$pid_file"
    return
  fi

  echo "Stopping $name process group $pid..."
  kill -- "-$pid" 2>/dev/null || kill "$pid" 2>/dev/null || true

  for _ in $(seq 1 20); do
    if ! kill -0 "$pid" 2>/dev/null; then
      rm -f "$pid_file"
      echo "$name stopped."
      return
    fi
    sleep 1
  done

  echo "$name did not stop gracefully; forcing process group $pid..."
  kill -9 -- "-$pid" 2>/dev/null || kill -9 "$pid" 2>/dev/null || true
  rm -f "$pid_file"
}

stop_safe_port_processes() {
  local name="$1"
  local port="$2"
  local pids
  pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -z "$pids" ]]; then
    return
  fi

  while read -r pid; do
    [[ -z "$pid" ]] && continue
    local args
    args="$(ps -p "$pid" -o args= 2>/dev/null || true)"
    if [[ "$args" == *"$ROOT_DIR"* || "$args" == *"learn-java"* || "$args" == *"vite"* ]]; then
      echo "Stopping $name listener on port $port: pid $pid"
      kill "$pid" 2>/dev/null || true
    else
      echo "Port $port is used by pid $pid, but it does not look like this project. Leaving it alone."
    fi
  done <<<"$pids"
}

stop_pid_file "Frontend" "$FRONTEND_PID_FILE"
stop_pid_file "Backend" "$BACKEND_PID_FILE"
stop_safe_port_processes "Frontend" 5173
stop_safe_port_processes "Backend" 8080

echo "Done."
