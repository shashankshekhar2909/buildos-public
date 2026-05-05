#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

WITH_DOCKER=0
WITH_HOST_PROJECTS=0
if [[ "${1:-}" == "--with-docker" ]]; then
  WITH_DOCKER=1
fi
if [[ "${1:-}" == "--with-host-projects" || "${2:-}" == "--with-host-projects" ]]; then
  WITH_HOST_PROJECTS=1
fi

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

mkdir -p data projects backups

COMPOSE_FILES=(-f docker-compose.yml)
if [[ "$WITH_DOCKER" -eq 1 ]]; then
  COMPOSE_FILES+=(-f docker-compose.docker.yml)
fi
if [[ "$WITH_HOST_PROJECTS" -eq 1 ]]; then
  COMPOSE_FILES+=(-f docker-compose.host-projects.yml)
fi

docker compose "${COMPOSE_FILES[@]}" up -d --build

FRONTEND_PORT="$(grep -E '^FRONTEND_PORT=' .env | cut -d= -f2 || true)"
BACKEND_PORT="$(grep -E '^BACKEND_PORT=' .env | cut -d= -f2 || true)"
FRONTEND_PORT="${FRONTEND_PORT:-4211}"
BACKEND_PORT="${BACKEND_PORT:-8012}"

echo
echo "BuildOS started."
echo "Frontend: http://localhost:${FRONTEND_PORT}"
echo "Backend:  http://localhost:${BACKEND_PORT}"
echo "Docs:     http://localhost:${BACKEND_PORT}/docs"
