#!/usr/bin/env bash
set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

FRONTEND_PORT="$(grep -E '^FRONTEND_PORT=' .env 2>/dev/null | cut -d= -f2 || true)"
BACKEND_PORT="$(grep -E '^BACKEND_PORT=' .env 2>/dev/null | cut -d= -f2 || true)"
FRONTEND_PORT="${FRONTEND_PORT:-4211}"
BACKEND_PORT="${BACKEND_PORT:-8012}"

echo "BuildOS status"
echo

if command -v docker >/dev/null 2>&1; then
  echo "Compose services"
  docker compose ps || true
else
  echo "Docker CLI not available"
fi

echo
echo "API health"
if curl -fsS "http://127.0.0.1:${BACKEND_PORT}/health" >/dev/null 2>&1; then
  echo "Backend: healthy at http://127.0.0.1:${BACKEND_PORT}/health"
else
  echo "Backend: unavailable at http://127.0.0.1:${BACKEND_PORT}/health"
fi

echo
echo "Frontend"
if curl -fsSI "http://127.0.0.1:${FRONTEND_PORT}" >/dev/null 2>&1; then
  echo "Frontend: reachable at http://127.0.0.1:${FRONTEND_PORT}"
else
  echo "Frontend: unavailable at http://127.0.0.1:${FRONTEND_PORT}"
fi
